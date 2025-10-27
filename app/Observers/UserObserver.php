<?php

namespace App\Observers;

use App\Models\User;
use App\Models\Plan;
use App\Models\Workspace;

class UserObserver
{
    /**
     * Handle the User "creating" event.
     */
    public function creating(User $user): void
    {
        // If user is company type and has no plan_id, assign default plan (SaaS mode only)
        if (isSaasMode() && $user->type === 'company' && is_null($user->plan_id)) {
            $defaultPlan = Plan::getDefaultPlan();
            if ($defaultPlan) {
                $user->plan_id = $defaultPlan->id;
                $user->plan_is_active = 1;
            }
        }
    }
    
    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        // Generate a unique referral code if not already set (SaaS mode only)
        if (isSaasMode() && $user->type === 'company' && empty($user->referral_code)) {
            do {
                $code = rand(100000, 999999);
            } while (User::where('referral_code', $code)->exists());
            
            $user->referral_code = $code;
            $user->save();
        }
        
        // Note: Workspace creation and settings are handled by defaultRoleAndSetting() function
        // which is called explicitly after user creation in controllers
    }
}