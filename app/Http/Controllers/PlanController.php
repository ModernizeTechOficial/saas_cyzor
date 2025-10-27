<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Traits\HasPermissionChecks;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlanController extends Controller
{
    use HasPermissionChecks;
    public function index(Request $request)
    {
        $this->authorizePermission('plan_view_any');
        
        $user = auth()->user();
        
        // Company users see only active plans
        if ($user->type !== 'superadmin') {
            return $this->companyPlansView($request);
        }
        
        // Admin view
        $billingCycle = $request->input('billing_cycle', 'monthly');
        
        $dbPlans = Plan::all();
        $hasDefaultPlan = $dbPlans->where('is_default', true)->count() > 0;
        
        $plans = $dbPlans->map(function ($plan) use ($billingCycle) {
            // Determine features based on plan attributes
            $features = [];
            if ($plan->enable_chatgpt === 'on') $features[] = 'AI Integration';
            
            // Get price based on billing cycle
            $price = $billingCycle === 'yearly' ? $plan->yearly_price : $plan->price;
            
            // Format price with currency symbol
            $formattedPrice = '$' . number_format($price, 2);
            
            // Set duration based on billing cycle
            $duration = $billingCycle === 'yearly' ? 'Yearly' : 'Monthly';
            
            return [
                'id' => $plan->id,
                'name' => $plan->name,
                'price' => $price,
                'yearly_price' => $plan->yearly_price,
                'formattedPrice' => $formattedPrice,
                'duration' => $duration,
                'description' => $plan->description,
                'trial_days' => $plan->trial_day,
                'features' => $features,
                'limits' => [
                    'workspaces' => $plan->workspace_limit,
                    'users_per_workspace' => $plan->max_users_per_workspace,
                    'clients_per_workspace' => $plan->max_clients_per_workspace,
                    'managers_per_workspace' => $plan->max_managers_per_workspace,
                    'projects_per_workspace' => $plan->max_projects_per_workspace,
                    'storage' => $plan->storage_limit . ' GB',
                ],
                'status' => $plan->is_plan_enable === 'on',
                'is_default' => $plan->is_default,
                'recommended' => false // Default to false
            ];
        })->toArray();
        
        // Mark the plan with most subscribers as recommended
        $planSubscriberCounts = Plan::withCount('users')->get()->pluck('users_count', 'id');
        $mostSubscribedPlanId = $planSubscriberCounts->keys()->first();
        if ($planSubscriberCounts->isNotEmpty()) {
            $mostSubscribedPlanId = $planSubscriberCounts->keys()->sortByDesc(function($planId) use ($planSubscriberCounts) {
                return $planSubscriberCounts[$planId];
            })->first();
        }
        
        foreach ($plans as &$plan) {
            if ($plan['id'] == $mostSubscribedPlanId) {
                $plan['recommended'] = true;
                break;
            }
        }

        return Inertia::render('plans/index', [
            'plans' => $plans,
            'billingCycle' => $billingCycle,
            'hasDefaultPlan' => $hasDefaultPlan,
            'isAdmin' => true
        ]);
    }
    
    /**
     * Toggle plan status
     */
    public function toggleStatus(Plan $plan)
    {
        $this->authorizePermission('plan_update');
        
        $plan->is_plan_enable = $plan->is_plan_enable === 'on' ? 'off' : 'on';
        $plan->save();
        
        return back();
    }
    
    /**
     * Show the form for creating a new plan
     */
    public function create()
    {
        $this->authorizePermission('plan_create');
        
        $hasDefaultPlan = Plan::where('is_default', true)->exists();
        
        return Inertia::render('plans/create', [
            'hasDefaultPlan' => $hasDefaultPlan
        ]);
    }
    
    /**
     * Store a newly created plan
     */
    public function store(Request $request)
    {
        $this->authorizePermission('plan_create');
        
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:plans',
            'price' => 'required|numeric|min:0',
            'yearly_price' => 'nullable|numeric|min:0',
            'duration' => 'required|string',
            'description' => 'nullable|string',
            'max_users_per_workspace' => 'required|integer|min:0',
            'max_clients_per_workspace' => 'required|integer|min:0',
            'max_managers_per_workspace' => 'required|integer|min:1',
            'max_projects_per_workspace' => 'required|integer|min:1',
            'workspace_limit' => 'required|integer|min:1',
            'storage_limit' => 'required|numeric|min:0',
            'enable_chatgpt' => 'nullable|in:on,off',
            'is_trial' => 'nullable|in:on,off',
            'trial_day' => 'nullable|integer|min:0',
            'is_plan_enable' => 'nullable|in:on,off',
            'is_default' => 'nullable|boolean',
        ]);
        
        // Set default values for nullable fields
        $validated['enable_chatgpt'] = $validated['enable_chatgpt'] ?? 'off';
        $validated['is_trial'] = $validated['is_trial'] ?? null;
        $validated['is_plan_enable'] = $validated['is_plan_enable'] ?? 'on';
        $validated['is_default'] = $validated['is_default'] ?? false;
        
        // If yearly_price is not provided, calculate it as 80% of monthly price * 12
        if (!isset($validated['yearly_price']) || $validated['yearly_price'] === null) {
            $validated['yearly_price'] = $validated['price'] * 12 * 0.8;
        }
        
        // If this plan is set as default, remove default status from other plans
        if ($validated['is_default']) {
            Plan::where('is_default', true)->update(['is_default' => false]);
        }
        
        // Create the plan
        Plan::create($validated);
        
        return redirect()->route('plans.index')->with('success', __('Plan created successfully.'));
    }
    
    /**
     * Show the form for editing a plan
     */
    public function edit(Plan $plan)
    {
        $this->authorizePermission('plan_update');
        
        $otherDefaultPlanExists = Plan::where('is_default', true)
            ->where('id', '!=', $plan->id)
            ->exists();
            
        return Inertia::render('plans/edit', [
            'plan' => $plan,
            'otherDefaultPlanExists' => $otherDefaultPlanExists
        ]);
    }
    
    /**
     * Update a plan
     */
    public function update(Request $request, Plan $plan)
    {
        $this->authorizePermission('plan_update');
        
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:plans,name,' . $plan->id,
            'price' => 'required|numeric|min:0',
            'yearly_price' => 'nullable|numeric|min:0',
            'duration' => 'required|string',
            'description' => 'nullable|string',
            'max_users_per_workspace' => 'required|integer|min:0',
            'max_clients_per_workspace' => 'required|integer|min:0',
            'max_managers_per_workspace' => 'required|integer|min:1',
            'max_projects_per_workspace' => 'required|integer|min:1',
            'workspace_limit' => 'required|integer|min:1',
            'storage_limit' => 'required|numeric|min:0',
            'enable_chatgpt' => 'nullable|in:on,off',
            'is_trial' => 'nullable|in:on,off',
            'trial_day' => 'nullable|integer|min:0',
            'is_plan_enable' => 'nullable|in:on,off',
            'is_default' => 'nullable|boolean',
        ]);
        
        // Set default values for nullable fields
        $validated['enable_chatgpt'] = $validated['enable_chatgpt'] ?? 'off';
        $validated['is_trial'] = $validated['is_trial'] ?? null;
        $validated['is_plan_enable'] = $validated['is_plan_enable'] ?? 'on';
        $validated['is_default'] = $validated['is_default'] ?? false;
        
        // If yearly_price is not provided, calculate it as 80% of monthly price * 12
        if (!isset($validated['yearly_price']) || $validated['yearly_price'] === null) {
            $validated['yearly_price'] = $validated['price'] * 12 * 0.8;
        }
        
        // If this plan is set as default, remove default status from other plans
        if ($validated['is_default'] && !$plan->is_default) {
            Plan::where('is_default', true)->update(['is_default' => false]);
        }
        
        // Update the plan
        $plan->update($validated);
        
        return redirect()->route('plans.index')->with('success', __('Plan updated successfully.'));
    }
    
    /**
     * Delete a plan
     */
    public function destroy(Plan $plan)
    {
        $this->authorizePermission('plan_delete');
        
        // Don't allow deleting the default plan
        if ($plan->is_default) {
            return back()->with('error', __('Cannot delete the default plan.'));
        }
        
        $plan->delete();
        
        return redirect()->route('plans.index')->with('success', __('Plan deleted successfully.'));
    }
    
    private function companyPlansView(Request $request)
    {
        $user = auth()->user();
        
        // Check if trial has expired and show alert
        $trialExpired = false;
        if ($user->is_trial && $user->trial_expire_date && $user->trial_expire_date < now()) {
            Plan::assignDefaultPlanToUser($user);
            $user = $user->fresh();
            $trialExpired = true;
        }
        
        // Check if regular plan has expired and assign default plan
        if (!$user->is_trial && $user->plan_expire_date && $user->plan_expire_date < now()) {
            Plan::assignDefaultPlanToUser($user);
            $user = $user->fresh();
        }
        
        $billingCycle = $request->input('billing_cycle', 'monthly');
        
        $dbPlans = Plan::where('is_plan_enable', 'on')->get();
        
        // Get user's pending requests (exclude cancelled)
        $pendingRequests = \App\Models\PlanRequest::where('user_id', $user->id)
            ->where('status', 'pending')
            ->pluck('plan_id')
            ->toArray();
        
        $plans = $dbPlans->map(function ($plan) use ($billingCycle, $user, $pendingRequests) {
            $price = $billingCycle === 'yearly' ? $plan->yearly_price : $plan->price;
            
            $features = [];
            if ($plan->enable_chatgpt === 'on') $features[] = 'AI Integration';
            
            return [
                'id' => $plan->id,
                'name' => $plan->name,
                'price' => $price,
                'yearly_price' => $plan->yearly_price,
                'formatted_price' => '$' . number_format($price, 2),
                'duration' => $billingCycle,
                'description' => $plan->description,
                'trial_days' => $plan->trial_day,
                'features' => $features,
                'limits' => [
                    'workspaces' => $plan->workspace_limit,
                    'users_per_workspace' => $plan->max_users_per_workspace,
                    'clients_per_workspace' => $plan->max_clients_per_workspace,
                    'managers_per_workspace' => $plan->max_managers_per_workspace,
                    'projects_per_workspace' => $plan->max_projects_per_workspace,
                    'storage' => $plan->storage_limit . ' GB',
                ],
                'is_current' => $user->plan_id == $plan->id,
                'is_trial_available' => $plan->is_trial === 'on' && $plan->trial_day > 0 && $user->is_trial == 0 && $user->trial_expire_date === null,
                'is_default' => $plan->is_default,
                'has_pending_request' => in_array($plan->id, $pendingRequests),
                'recommended' => false // Default to false
            ];
        });
        
        // Mark the plan with most subscribers as recommended
        $planSubscriberCounts = Plan::withCount('users')->get()->pluck('users_count', 'id');
        if ($planSubscriberCounts->isNotEmpty()) {
            $mostSubscribedPlanId = $planSubscriberCounts->keys()->sortByDesc(function($planId) use ($planSubscriberCounts) {
                return $planSubscriberCounts[$planId];
            })->first();
            
            $plans = $plans->map(function($plan) use ($mostSubscribedPlanId) {
                if ($plan['id'] == $mostSubscribedPlanId) {
                    $plan['recommended'] = true;
                }
                return $plan;
            });
        }
        
        return Inertia::render('plans/index', [
            'plans' => $plans,
            'billingCycle' => $billingCycle,
            'currentPlan' => $user->plan,
            'userTrialUsed' => (bool) $user->is_trial || $user->trial_expire_date !== null,
            'pendingRequests' => $pendingRequests,
            'paymentMethods' => getPaymentSettings(\App\Models\User::where('type', 'superadmin')->first()?->id),
            'trialExpired' => $trialExpired
        ]);
    }
    
    public function requestPlan(Request $request)
    {
        $this->authorizePermission('plan_request');
        
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'billing_cycle' => 'required|in:monthly,yearly'
        ]);
        
        $user = auth()->user();
        $plan = Plan::findOrFail($request->plan_id);
        
        // Check if user already has any pending request
        $existingRequest = \App\Models\PlanRequest::where('user_id', $user->id)
            ->where('status', 'pending')
            ->first();
            
        if ($existingRequest) {
            return back()->withErrors(['error' => __('You already have a pending plan request. Please wait for approval or cancel your current request.')]);
        }
        
        \App\Models\PlanRequest::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'duration' => $request->billing_cycle,
            'status' => 'pending'
        ]);
        
        return back()->with('success', __('Plan request submitted successfully'));
    }
    
    public function startTrial(Request $request)
    {
        $this->authorizePermission('plan_trial');
        
        $request->validate([
            'plan_id' => 'required|exists:plans,id'
        ]);
        
        $user = auth()->user();
        $plan = Plan::findOrFail($request->plan_id);
        
        // Check if user has pending plan request
        $hasPendingRequest = \App\Models\PlanRequest::where('user_id', $user->id)
            ->where('status', 'pending')
            ->exists();
            
        if ($hasPendingRequest) {
            return back()->withErrors(['error' => __('Cannot start trial while you have a pending plan request')]);
        }
        
        if ($user->is_trial || $plan->is_trial !== 'on') {
            return back()->withErrors(['error' => __('Trial not available')]);
        }
        
        $user->update([
            'plan_id' => $plan->id,
            'is_trial' => 1,
            'trial_day' => $plan->trial_day,
            'trial_expire_date' => now()->addDays($plan->trial_day)
        ]);
        
        return back()->with('success', __('Trial started successfully'));
    }
    
    public function subscribe(Request $request)
    {
        $this->authorizePermission('plan_subscribe');
        
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'billing_cycle' => 'required|in:monthly,yearly'
        ]);
        
        $user = auth()->user();
        $plan = Plan::findOrFail($request->plan_id);
        $price = $request->billing_cycle === 'yearly' ? $plan->yearly_price : $plan->price;
        
        \App\Models\PlanOrder::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'billing_cycle' => $request->billing_cycle,
            'original_price' => $price,
            'final_price' => $price,
            'status' => 'pending'
        ]);
        
        return back()->with('success', __('Subscription request submitted successfully'));
    }
    
    public function cancelRequest(Request $request)
    {
        $this->authorizePermission('plan_request');
        
        $request->validate([
            'plan_id' => 'required|exists:plans,id'
        ]);
        
        $user = auth()->user();
        
        $planRequest = \App\Models\PlanRequest::where('user_id', $user->id)
            ->where('plan_id', $request->plan_id)
            ->where('status', 'pending')
            ->first();
            
        if ($planRequest) {
            $planRequest->delete();
            return back()->with('success', __('Plan request cancelled successfully'));
        }
        
        return back()->withErrors(['error' => __('No pending request found')]);
    }
}