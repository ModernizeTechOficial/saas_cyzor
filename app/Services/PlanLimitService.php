<?php

namespace App\Services;

use App\Models\User;
use App\Models\Workspace;
use App\Models\Plan;
use App\Models\Project;
use App\Models\WorkspaceMember;

class PlanLimitService
{
    /**
     * Check if SaaS mode is enabled
     */
    public function isSaasMode(): bool
    {
        return config('app.is_saas', false);
    }
    /**
     * Check if user can create a new workspace
     */
    public function canCreateWorkspace(User $user): array
    {
        // Override limits if SaaS mode is disabled
        if (!$this->isSaasMode()) {
            return ['allowed' => true];
        }
        
        $plan = $user->getCurrentPlan();
        
        if (!$plan) {
            return [
                'allowed' => false, 
                'message' => __('No active plan found. Please contact support.'),
                'error_type' => 'no_plan'
            ];
        }

        // Check if plan is expired
        if ($user->isPlanExpired() && !$user->isOnFreePlan()) {
            return [
                'allowed' => false,
                'message' => __('Your plan has expired. Please renew your subscription to create new workspaces.'),
                'error_type' => 'plan_expired'
            ];
        }

        $currentWorkspaces = $user->ownedWorkspaces()->count();
        
        if ($plan->workspace_limit && $currentWorkspaces >= $plan->workspace_limit) {
            return [
                'allowed' => false, 
                'message' => __('Workspace limit reached. Your :plan_name plan allows :limit workspace(s), you currently have :current. Upgrade your plan to create more workspaces.', ['plan_name' => $plan->name, 'limit' => $plan->workspace_limit, 'current' => $currentWorkspaces]),
                'error_type' => 'workspace_limit_reached',
                'current_count' => $currentWorkspaces,
                'limit' => $plan->workspace_limit,
                'plan_name' => $plan->name
            ];
        }

        return ['allowed' => true];
    }

    /**
     * Check if workspace can add a new user
     */
    public function canAddUserToWorkspace(Workspace $workspace, string $role = 'user'): array
    {
        // Override limits if SaaS mode is disabled
        if (!$this->isSaasMode()) {
            return ['allowed' => true];
        }
        
        $owner = $workspace->owner;
        $plan = $owner->getCurrentPlan();
        
        if (!$plan) {
            return ['allowed' => false, 'message' => __('No active plan found')];
        }

        // Check specific role limits first (they have priority)
        if ($role === 'client') {
            return $this->canAddClientToWorkspace($workspace);
        }
        
        if ($role === 'manager') {
            return $this->canAddManagerToWorkspace($workspace);
        }

        // For general members, check overall user limit only if no specific role limits exist
        if ($plan->max_users_per_workspace) {
            $currentUsers = $workspace->activeMembers()->where('role', '!=', 'owner')->count();
            $pendingInvitations = $workspace->invitations()
                ->where('accepted_at', null)
                ->where('role', '!=', 'owner')
                ->where('expires_at', '>', now())
                ->count();
                
            $totalUsers = $currentUsers + $pendingInvitations;
            
            if ($totalUsers >= $plan->max_users_per_workspace) {
                return [
                    'allowed' => false,
                    'message' => __('User limit reached. Your plan allows :limit users per workspace, you currently have :current active users and :pending pending invitations.', ['limit' => $plan->max_users_per_workspace, 'current' => $currentUsers, 'pending' => $pendingInvitations])
                ];
            }
        }

        return ['allowed' => true];
    }

    /**
     * Check if workspace can add a new client
     */
    public function canAddClientToWorkspace(Workspace $workspace): array
    {
        // Override limits if SaaS mode is disabled
        if (!$this->isSaasMode()) {
            return ['allowed' => true];
        }
        
        $owner = $workspace->owner;
        $plan = $owner->getCurrentPlan();
        
        if (!$plan) {
            return ['allowed' => false, 'message' => __('No active plan found')];
        }

        if ($plan->max_clients_per_workspace) {
            $currentClients = $workspace->activeMembers()->where('role', 'client')->count();
            $pendingClientInvitations = $workspace->invitations()
                ->where('accepted_at', null)
                ->where('role', 'client')
                ->where('expires_at', '>', now())
                ->count();
                
            $totalClients = $currentClients + $pendingClientInvitations;
            
            if ($totalClients >= $plan->max_clients_per_workspace) {
                return [
                    'allowed' => false,
                    'message' => __('Client limit reached. Your plan allows :limit clients per workspace, you currently have :current active clients and :pending pending invitations.', ['limit' => $plan->max_clients_per_workspace, 'current' => $currentClients, 'pending' => $pendingClientInvitations])
                ];
            }
        }

        return ['allowed' => true];
    }

    /**
     * Check if workspace can add a new manager
     */
    public function canAddManagerToWorkspace(Workspace $workspace): array
    {
        // Override limits if SaaS mode is disabled
        if (!$this->isSaasMode()) {
            return ['allowed' => true];
        }
        
        $owner = $workspace->owner;
        $plan = $owner->getCurrentPlan();
        
        if (!$plan) {
            return ['allowed' => false, 'message' => __('No active plan found')];
        }

        if ($plan->max_managers_per_workspace) {
            $currentManagers = $workspace->activeMembers()->where('role', 'manager')->count();
            $pendingManagerInvitations = $workspace->invitations()
                ->where('accepted_at', null)
                ->where('role', 'manager')
                ->where('expires_at', '>', now())
                ->count();
                
            $totalManagers = $currentManagers + $pendingManagerInvitations;
            
            if ($totalManagers >= $plan->max_managers_per_workspace) {
                return [
                    'allowed' => false,
                    'message' => __('Manager limit reached. Your plan allows :limit managers per workspace, you currently have :current active managers and :pending pending invitations.', ['limit' => $plan->max_managers_per_workspace, 'current' => $currentManagers, 'pending' => $pendingManagerInvitations])
                ];
            }
        }

        return ['allowed' => true];
    }

    /**
     * Check if workspace can create a new project
     */
    public function canCreateProject(Workspace $workspace): array
    {
        // Override limits if SaaS mode is disabled
        if (!$this->isSaasMode()) {
            return ['allowed' => true];
        }
        
        $owner = $workspace->owner;
        $plan = $owner->getCurrentPlan();
        
        if (!$plan) {
            return ['allowed' => false, 'message' => __('No active plan found')];
        }

        $currentProjects = $workspace->projects()->count();
        
        if ($plan->max_projects_per_workspace && $currentProjects >= $plan->max_projects_per_workspace) {
            return [
                'allowed' => false,
                'message' => __('Project limit reached. Your :plan_name plan allows :limit projects per workspace, you currently have :current. Upgrade your plan to create more projects.', ['plan_name' => $plan->name, 'limit' => $plan->max_projects_per_workspace, 'current' => $currentProjects])
            ];
        }

        return ['allowed' => true];
    }

    /**
     * Check if user has enough storage space
     */
    public function canUploadFile(User $user, int $fileSizeInBytes): array
    {
        // Override limits if SaaS mode is disabled
        if (!$this->isSaasMode()) {
            return ['allowed' => true];
        }
        
        $plan = $user->getCurrentPlan();
        
        if (!$plan) {
            return ['allowed' => false, 'message' => __('No active plan found')];
        }

        if (!$plan->storage_limit) {
            return ['allowed' => true]; // Unlimited storage
        }

        $maxStorageBytes = $plan->storage_limit * 1024 * 1024 * 1024; // Convert GB to bytes
        $currentUsageBytes = $this->getTotalStorageUsage($user);
        
        if (($currentUsageBytes + $fileSizeInBytes) > $maxStorageBytes) {
            $maxStorageGB = $plan->storage_limit;
            $currentUsageGB = round($currentUsageBytes / (1024 * 1024 * 1024), 3);
            $uploadSizeMB = round($fileSizeInBytes / (1024 * 1024), 2);
            
            return [
                'allowed' => false,
                'message' => __('Storage limit exceeded. Plan limit: :max_gb GB, Current usage: :current_gb GB, Upload size: :upload_mb MB', [
                    'max_gb' => $maxStorageGB, 
                    'current_gb' => $currentUsageGB,
                    'upload_mb' => $uploadSizeMB
                ])
            ];
        }

        return ['allowed' => true];
    }
    
    /**
     * Get total storage usage for user
     */
    private function getTotalStorageUsage(User $user): int
    {
        // Get all media files uploaded by this user
        $totalSize = \Spatie\MediaLibrary\MediaCollections\Models\Media::where('user_id', $user->id)->sum('size');
        
        return (int) $totalSize;
    }

    /**
     * Get plan usage summary for a user
     */
    public function getPlanUsage(User $user): array
    {
        $plan = $user->getCurrentPlan();
        
        if (!$plan) {
            return ['error' => __('No active plan found')];
        }

        $workspaces = $user->ownedWorkspaces()->with(['activeMembers', 'projects'])->get();
        
        $usage = [
            'plan_name' => $plan->name,
            'workspaces' => [
                'current' => $workspaces->count(),
                'limit' => $plan->workspace_limit,
                'unlimited' => !$plan->workspace_limit
            ],
            'storage' => [
                'current_gb' => round($this->getTotalStorageUsage($user) / (1024 * 1024 * 1024), 3),
                'limit_gb' => $plan->storage_limit,
                'unlimited' => !$plan->storage_limit
            ]
        ];

        // Add workspace-specific usage
        foreach ($workspaces as $workspace) {
            $members = $workspace->activeMembers;
            // Exclude owner from user count for display purposes
            $nonOwnerMembers = $members->where('role', '!=', 'owner');
            $usage['workspace_details'][$workspace->id] = [
                'name' => $workspace->name,
                'users' => [
                    'current' => $nonOwnerMembers->count(),
                    'limit' => $plan->max_users_per_workspace,
                    'unlimited' => !$plan->max_users_per_workspace
                ],
                'clients' => [
                    'current' => $members->where('role', 'client')->count(),
                    'limit' => $plan->max_clients_per_workspace,
                    'unlimited' => !$plan->max_clients_per_workspace
                ],
                'managers' => [
                    'current' => $members->where('role', 'manager')->count(),
                    'limit' => $plan->max_managers_per_workspace,
                    'unlimited' => !$plan->max_managers_per_workspace
                ],
                'projects' => [
                    'current' => $workspace->projects->count(),
                    'limit' => $plan->max_projects_per_workspace,
                    'unlimited' => !$plan->max_projects_per_workspace
                ]
            ];
        }

        return $usage;
    }

    /**
     * Check if user is approaching any limits (80% threshold)
     */
    public function getApproachingLimits(User $user): array
    {
        $usage = $this->getPlanUsage($user);
        $warnings = [];

        if (isset($usage['error'])) {
            return $warnings;
        }

        // Check workspace limit
        if (!$usage['workspaces']['unlimited'] && $usage['workspaces']['current'] >= ($usage['workspaces']['limit'] * 0.8)) {
            $warnings[] = __('You are approaching your workspace limit (:current/:limit)', ['current' => $usage['workspaces']['current'], 'limit' => $usage['workspaces']['limit']]);
        }

        // Check storage limit
        if (!$usage['storage']['unlimited'] && $usage['storage']['current_gb'] >= ($usage['storage']['limit_gb'] * 0.8)) {
            $warnings[] = __('You are approaching your storage limit (:current_gb GB/:limit_gb GB)', ['current_gb' => $usage['storage']['current_gb'], 'limit_gb' => $usage['storage']['limit_gb']]);
        }

        // Check workspace-specific limits
        if (isset($usage['workspace_details'])) {
            foreach ($usage['workspace_details'] as $workspaceId => $details) {
                $workspaceName = $details['name'];
                
                if (!$details['users']['unlimited'] && $details['users']['current'] >= ($details['users']['limit'] * 0.8)) {
                    $warnings[] = __('Workspace ":workspace_name" is approaching user limit (:current/:limit)', ['workspace_name' => $workspaceName, 'current' => $details['users']['current'], 'limit' => $details['users']['limit']]);
                }
                
                if (!$details['projects']['unlimited'] && $details['projects']['current'] >= ($details['projects']['limit'] * 0.8)) {
                    $warnings[] = __('Workspace ":workspace_name" is approaching project limit (:current/:limit)', ['workspace_name' => $workspaceName, 'current' => $details['projects']['current'], 'limit' => $details['projects']['limit']]);
                }
            }
        }

        return $warnings;
    }

    /**
     * Get workspace creation status with detailed information
     */
    public function getWorkspaceCreationStatus(User $user): array
    {
        $limitCheck = $this->canCreateWorkspace($user);
        $plan = $user->getCurrentPlan();
        $currentWorkspaces = $user->ownedWorkspaces()->count();
        
        return [
            'can_create' => $limitCheck['allowed'],
            'message' => $limitCheck['message'] ?? null,
            'error_type' => $limitCheck['error_type'] ?? null,
            'current_workspaces' => $currentWorkspaces,
            'workspace_limit' => $plan->workspace_limit ?? null,
            'plan_name' => $plan->name ?? __('Unknown'),
            'is_unlimited' => !$plan->workspace_limit,
            'remaining_workspaces' => $plan->workspace_limit ? max(0, $plan->workspace_limit - $currentWorkspaces) : null
        ];
    }
    
    /**
     * Get user-friendly error message for workspace creation
     */
    public function getWorkspaceCreationErrorMessage(User $user): ?string
    {
        $limitCheck = $this->canCreateWorkspace($user);
        
        if ($limitCheck['allowed']) {
            return null;
        }
        
        $message = $limitCheck['message'];
        
        // Add upgrade link for limit-related errors
        if (in_array($limitCheck['error_type'] ?? '', ['workspace_limit_reached', 'plan_expired'])) {
            $message .= ' <a href="' . route('plans.index') . '" class="text-blue-600 underline hover:text-blue-800">' . __('Upgrade your plan') . '</a> ' . __('to continue') . '.';
        }
        
        return $message;
    }
}