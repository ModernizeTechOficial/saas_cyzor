<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Lab404\Impersonate\Models\Impersonate;
use App\Models\Plan;
use App\Models\Referral;
use App\Models\PayoutRequest;
use App\Services\MailConfigService;
use App\Models\ProjectActivity;
use App\Models\TimesheetEntry;
use App\Models\Timesheet;
use App\Models\TaskComment;
use App\Models\BugComment;
use App\Models\ProjectNote;
use App\Models\WorkspaceMember;
use App\Models\ProjectMember;

class User extends BaseAuthenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasRoles, HasFactory, Notifiable, Impersonate;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'email_verified_at',
        'password',
        'type',
        'avatar',
        'lang',
        'current_business',
        'delete_status',
        'is_enable_login',
        'mode',
        'created_by',
        'google2fa_enable',
        'google2fa_secret',
        'status',
        'active_module',
        'current_workspace_id',
        'timer_active',
        'timer_project_id',
        'timer_task_id',
        'timer_entry_id',
        'timer_started_at',
        'timer_description',
        'timer_elapsed_seconds'
    ];
    
    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);
        
        // Add SaaS-specific fillable fields if in SaaS mode
        if (isSaasMode()) {
            $this->fillable = array_merge($this->fillable, [
                'plan_id',
                'plan_expire_date',
                'requested_plan',
                'plan_is_active',
                'storage_limit',
                'is_trial',
                'trial_day',
                'trial_expire_date',
                'referral_code',
                'used_referral_code',
                'commission_amount'
            ]);
        }
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'google2fa_secret',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'plan_expire_date' => 'date',
            'trial_expire_date' => 'date',
            'plan_is_active' => 'integer',
            'is_active' => 'integer',
            'is_enable_login' => 'integer',
            'is_trial' => 'integer',
            'google2fa_enable' => 'integer',
            'storage_limit' => 'float',
            'timer_active' => 'boolean',
            'timer_started_at' => 'datetime',
            'timer_elapsed_seconds' => 'integer',
        ];
    }

    /**
     * Get the creator ID based on user type
     */
    public function creatorId()
    {
        if ($this->type == 'superadmin' || $this->type == 'super admin' || $this->type == 'admin') {
            return $this->id;
        } else {
            return $this->created_by;
        }
    }

    /**
     * Check if user is super admin
     */
    public function isSuperAdmin()
    {
        return $this->type === 'superadmin' || $this->type === 'super admin';
    }

    /**
     * Check if user is admin
     */
    public function isAdmin()
    {
        return $this->type === 'admin';
    }
        

    
    /**
     * Get the plan associated with the user.
     */
    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }
    
    /**
     * Check if user is on free plan
     */
    public function isOnFreePlan()
    {
        return $this->plan && $this->plan->is_default;
    }
    
    /**
     * Get current plan or default plan
     */
    public function getCurrentPlan()
    {
        if ($this->plan) {
            return $this->plan;
        }
        
        return Plan::getDefaultPlan();
    }
    
    /**
     * Check if user has an active plan subscription
     */
    public function hasActivePlan()
    {
        return $this->plan_id && 
               $this->plan_is_active && 
               ($this->plan_expire_date === null || $this->plan_expire_date > now());
    }
    
    /**
     * Check if user's plan has expired
     */
    public function isPlanExpired()
    {
        return $this->plan_expire_date && $this->plan_expire_date < now();
    }
    
    /**
     * Check if user's trial has expired
     */
    public function isTrialExpired()
    {
        return $this->is_trial && $this->trial_expire_date && $this->trial_expire_date < now();
    }
    
    /**
     * Check if user needs to subscribe to a plan
     */
    public function needsPlanSubscription()
    {
        if ($this->isSuperAdmin()) {
            return false;
        }
        
        if ($this->type !== 'company') {
            return false;
        }
        
        // Check if user has no plan and no default plan exists
        if (!$this->plan_id) {
            return !Plan::getDefaultPlan();
        }
        
        // Check if trial is expired
        if ($this->isTrialExpired()) {
            return true;
        }
        
        // Check if plan is expired (but not on trial)
        if (!$this->is_trial && $this->isPlanExpired()) {
            return true;
        }
        
        return false;
    }

    /**
     * Check if user can be impersonated
     */
    public function canBeImpersonated()
    {
        return $this->type === 'company';
    }

    /**
     * Check if user can impersonate others
     */
    public function canImpersonate()
    {
        return $this->isSuperAdmin();
    }

    /**
     * Get referrals made by this company
     */
    public function referrals()
    {
        return $this->hasMany(Referral::class, 'company_id');
    }

    /**
     * Get payout requests made by this company
     */
    public function payoutRequests()
    {
        return $this->hasMany(PayoutRequest::class, 'company_id');
    }

    /**
     * Get the user who created this user
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get referral balance for company
     */
    public function getReferralBalance()
    {
        $totalEarned = $this->referrals()->sum('amount');
        $totalRequested = $this->payoutRequests()->whereIn('status', ['pending', 'approved'])->sum('amount');
        return $totalEarned - $totalRequested;
    }
    
    /**
     * Send the email verification notification with dynamic config.
     */
    public function sendEmailVerificationNotification()
    {
        $workspace = $this->currentWorkspace ?? $this->ownedWorkspaces()->first() ?? $this->workspaces()->first();
        MailConfigService::setDynamicConfig($this->id, $workspace?->id);
        
        // If workspace SMTP not configured and in SaaS mode, fallback to super admin
        if (config('mail.default') === 'log' && isSaasMode()) {
            MailConfigService::setDynamicConfig(null, null);
        }
        
        parent::sendEmailVerificationNotification();
    }

    /**
     * Workspace relationships
     */
    public function ownedWorkspaces()
    {
        return $this->hasMany(Workspace::class, 'owner_id');
    }

    public function workspaces()
    {
        return $this->belongsToMany(Workspace::class, 'workspace_members')
                    ->withPivot('role', 'status', 'joined_at')
                    ->withTimestamps();
    }

    public function currentWorkspace()
    {
        return $this->belongsTo(Workspace::class, 'current_workspace_id');
    }

    public function workspaceInvitations()
    {
        return $this->hasMany(WorkspaceInvitation::class, 'invited_by');
    }

    public function canAccessWorkspace(Workspace $workspace): bool
    {
        return $workspace->isOwner($this) || $workspace->hasMember($this);
    }

    public function switchWorkspace(Workspace $workspace): bool
    {
        if (!$this->canAccessWorkspace($workspace)) {
            return false;
        }
        
        $this->current_workspace_id = $workspace->id;
        $saved = $this->save();
        
        if ($saved) {
            $this->loadWorkspaceSettings($workspace);
        }
        
        return $saved;
    }
    
    /**
     * Load workspace settings into session
     */
    public function loadWorkspaceSettings(?Workspace $workspace = null): void
    {
        $workspace = $workspace ?? $this->currentWorkspace;
        
        if (!$workspace) {
            session()->forget('workspace_settings');
            session()->forget('workspace_payment_settings');
            return;
        }
        
        // Clear any cached workspace data
        $this->load('currentWorkspace');
        
        // Get workspace-specific settings including logo settings
        $workspaceSettings = \App\Models\Setting::where('user_id', $this->id)
            ->where('workspace_id', $workspace->id)
            ->pluck('value', 'key')->toArray();
        
        // Store workspace settings in session for immediate access
        session(['workspace_settings' => [
            'timesheet_enabled' => $workspace->timesheet_enabled,
            'timesheet_approval_required' => $workspace->timesheet_approval_required,
            'timesheet_auto_submit' => $workspace->timesheet_auto_submit,
            'timesheet_reminder_days' => $workspace->timesheet_reminder_days,
            'default_work_start' => $workspace->default_work_start?->format('H:i'),
            'default_work_end' => $workspace->default_work_end?->format('H:i'),
            'settings' => $workspace->settings ?? [],
            'workspace_settings' => $workspaceSettings
        ]]);
        
        // Store workspace-specific payment settings in session
        $paymentSettings = \App\Models\PaymentSetting::getUserSettings($this->id, $workspace->id);
        session(['workspace_payment_settings' => $paymentSettings]);
        
        // Clear any cached settings to force reload
        session()->forget('cached_settings');
    }

    /**
     * Scope users to a specific workspace
     */
    public function scopeForWorkspace($query, $workspaceId)
    {
        return $query->whereHas('workspaces', function($q) use ($workspaceId) {
            $q->where('workspace_id', $workspaceId)
              ->where('status', 'active');
        });
    }

    /**
     * Scope users to current user's workspace (except superadmin)
     */
    public function scopeWorkspaceScoped($query)
    {
        $user = auth()->user();
        
        if (!$user || $user->type === 'superadmin') {
            return $query; // No scoping for superadmin
        }
        
        if ($user->type === 'client') {
            return $query->where('id', $user->id); // Clients only see themselves
        }
        
        if ($user->current_workspace_id) {
            return $query->forWorkspace($user->current_workspace_id);
        }
        
        return $query->whereRaw('1 = 0'); // No results if no workspace
    }

    /**
     * Timesheet relationships
     */
    public function timesheets()
    {
        return $this->hasMany(Timesheet::class);
    }

    public function timesheetEntries()
    {
        return $this->hasMany(TimesheetEntry::class);
    }
    
    /**
     * Project activity relationship
     */
    public function projectActivities()
    {
        return $this->hasMany(ProjectActivity::class);
    }



    public function timerProject()
    {
        return $this->belongsTo(Project::class, 'timer_project_id');
    }

    public function timerTask()
    {
        return $this->belongsTo(Task::class, 'timer_task_id');
    }

    public function timerEntry()
    {
        return $this->belongsTo(TimesheetEntry::class, 'timer_entry_id');
    }

    /**
     * Boot method to handle model events
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($user) {
            if (isSaasMode() && $user->type === 'company' && !$user->referral_code) {
                // Generate referral code after the user is saved to get the ID
                static::created(function ($createdUser) {
                    if (isSaasMode() && !$createdUser->referral_code) {
                        $createdUser->referral_code = 'REF' . str_pad($createdUser->id, 6, '0', STR_PAD_LEFT);
                        $createdUser->save();
                    }
                });
            }
        });
        
        static::created(function ($user) {
            // Assign default plan to company users if no default plan exists (SaaS mode only)
            if (isSaasMode() && $user->type === 'company' && !$user->plan_id) {
                $defaultPlan = Plan::getDefaultPlan();
                if ($defaultPlan) {
                    $user->plan_id = $defaultPlan->id;
                    $user->plan_is_active = 1;
                    $user->save();
                }
            }
        });
        
        static::deleting(function ($user) {
            // Handle cascading deletes for related records
            ProjectActivity::where('user_id', $user->id)->delete();
            TimesheetEntry::where('user_id', $user->id)->delete();
            Timesheet::where('user_id', $user->id)->delete();
            TaskComment::where('user_id', $user->id)->delete();
            BugComment::where('user_id', $user->id)->delete();
            ProjectNote::where('created_by', $user->id)->delete();
            
            // Remove user from workspace memberships
            WorkspaceMember::where('user_id', $user->id)->delete();
            
            // Remove user from project memberships
            ProjectMember::where('user_id', $user->id)->delete();
        });
    }
}