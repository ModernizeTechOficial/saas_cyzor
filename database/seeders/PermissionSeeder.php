<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // Dashboard Module
            ['name' => 'dashboard_view', 'module' => 'dashboards', 'label' => 'View Dashboard', 'description' => 'Access dashboard metrics'],
            ['name' => 'dashboard_manage', 'module' => 'dashboards', 'label' => 'Manage Dashboard', 'description' => 'Manage dashboard widgets and layout'],

            // Workspace Module
            ['name' => 'workspace_view_any', 'module' => 'workspace', 'label' => 'View All Workspaces', 'description' => 'View all accessible workspaces'],
            ['name' => 'workspace_view', 'module' => 'workspace', 'label' => 'View Workspace', 'description' => 'View workspace information'],
            ['name' => 'workspace_create', 'module' => 'workspace', 'label' => 'Create Workspace', 'description' => 'Create new workspace'],
            ['name' => 'workspace_update', 'module' => 'workspace', 'label' => 'Update Workspace', 'description' => 'Modify workspace information'],
            ['name' => 'workspace_delete', 'module' => 'workspace', 'label' => 'Delete Workspace', 'description' => 'Remove workspace'],
            ['name' => 'workspace_assign', 'module' => 'workspace', 'label' => 'Assign Workspace', 'description' => 'Set workspace owner'],
            ['name' => 'workspace_manage_members', 'module' => 'workspace', 'label' => 'Manage Workspace Members', 'description' => 'Add/remove/manage members'],
            ['name' => 'workspace_manage_settings', 'module' => 'workspace', 'label' => 'Manage Workspace Settings', 'description' => 'Configure workspace options'],
            ['name' => 'workspace_switch', 'module' => 'workspace', 'label' => 'Switch Workspace', 'description' => 'Change active workspace'],
            ['name' => 'workspace_leave', 'module' => 'workspace', 'label' => 'Leave Workspace', 'description' => 'Leave workspace as member'],
            ['name' => 'workspace_view_activity', 'module' => 'workspace', 'label' => 'View Workspace Activity', 'description' => 'View workspace activity log'],
            ['name' => 'workspace_invite_members', 'module' => 'workspace', 'label' => 'Invite Workspace Members', 'description' => 'Send workspace invitations'],

            // Project Module
            ['name' => 'project_view_any', 'module' => 'projects', 'label' => 'View All Projects', 'description' => 'View all projects in workspace'],
            ['name' => 'project_view', 'module' => 'projects', 'label' => 'View Project', 'description' => 'View individual project information'],
            ['name' => 'project_create', 'module' => 'projects', 'label' => 'Create Project', 'description' => 'Create new project'],
            ['name' => 'project_update', 'module' => 'projects', 'label' => 'Update Project', 'description' => 'Modify project information'],
            ['name' => 'project_delete', 'module' => 'projects', 'label' => 'Delete Project', 'description' => 'Remove project'],
            ['name' => 'project_assign_members', 'module' => 'projects', 'label' => 'Assign Project Members', 'description' => 'Add/remove project team members'],
            ['name' => 'project_assign_clients', 'module' => 'projects', 'label' => 'Assign Project Clients', 'description' => 'Add/remove project clients'],
            ['name' => 'project_assign', 'module' => 'projects', 'label' => 'Assign Project', 'description' => 'Move project between workspaces'],
            ['name' => 'project_manage_budget', 'module' => 'projects', 'label' => 'Manage Project Budget', 'description' => 'Create/edit project budget'],
            ['name' => 'project_manage_milestones', 'module' => 'projects', 'label' => 'Manage Project Milestones', 'description' => 'Add/edit project milestones'],
            ['name' => 'project_manage_attachments', 'module' => 'projects', 'label' => 'Manage Project Attachments', 'description' => 'Upload/delete project files'],
            ['name' => 'project_generate_reports', 'module' => 'projects', 'label' => 'Generate Project Reports', 'description' => 'Create project analytics'],
            ['name' => 'project_track_progress', 'module' => 'projects', 'label' => 'Track Project Progress', 'description' => 'Monitor project completion'],
            ['name' => 'project_manage_notes', 'module' => 'projects', 'label' => 'Manage Project Notes', 'description' => 'Add/edit project notes'],
            ['name' => 'project_view_activity', 'module' => 'projects', 'label' => 'View Project Activity', 'description' => 'View project activity log'],

            // Task Module
            ['name' => 'task_view_any', 'module' => 'tasks', 'label' => 'View All Tasks', 'description' => 'View all tasks in workspace'],
            ['name' => 'task_view', 'module' => 'tasks', 'label' => 'View Task', 'description' => 'View individual task information'],
            ['name' => 'task_create', 'module' => 'tasks', 'label' => 'Create Task', 'description' => 'Create new task'],
            ['name' => 'task_update', 'module' => 'tasks', 'label' => 'Update Task', 'description' => 'Modify task information'],
            ['name' => 'task_delete', 'module' => 'tasks', 'label' => 'Delete Task', 'description' => 'Remove task'],
            ['name' => 'task_assign_users', 'module' => 'tasks', 'label' => 'Assign Users to Task', 'description' => 'Assign/unassign users to task'],
            ['name' => 'task_assign', 'module' => 'tasks', 'label' => 'Assign Task', 'description' => 'Move task between projects/milestones'],
            ['name' => 'task_change_status', 'module' => 'tasks', 'label' => 'Change Task Status', 'description' => 'Move task between stages'],
            ['name' => 'task_manage_stages', 'module' => 'tasks', 'label' => 'Manage Task Stages', 'description' => 'Create/edit/delete task stages'],
            ['name' => 'task_duplicate', 'module' => 'tasks', 'label' => 'Duplicate Task', 'description' => 'Create copy of existing task'],
            ['name' => 'task_add_comments', 'module' => 'tasks', 'label' => 'Add Task Comments', 'description' => 'Add comments to task'],
            ['name' => 'task_add_attachments', 'module' => 'tasks', 'label' => 'Add Task Attachments', 'description' => 'Upload files to task'],
            ['name' => 'task_manage_checklists', 'module' => 'tasks', 'label' => 'Manage Task Checklists', 'description' => 'Add checklist items to task'],
            ['name' => 'task_track_progress', 'module' => 'tasks', 'label' => 'Track Task Progress', 'description' => 'Monitor task completion'],

            // Bug Module
            ['name' => 'bug_view_any', 'module' => 'bugs', 'label' => 'View All Bugs', 'description' => 'View all bugs in workspace'],
            ['name' => 'bug_view', 'module' => 'bugs', 'label' => 'View Bug', 'description' => 'View individual bug information'],
            ['name' => 'bug_create', 'module' => 'bugs', 'label' => 'Create Bug', 'description' => 'Create new bug report'],
            ['name' => 'bug_update', 'module' => 'bugs', 'label' => 'Update Bug', 'description' => 'Modify bug information'],
            ['name' => 'bug_delete', 'module' => 'bugs', 'label' => 'Delete Bug', 'description' => 'Remove bug report'],
            ['name' => 'bug_assign', 'module' => 'bugs', 'label' => 'Assign Bug', 'description' => 'Assign bug to team member'],
            ['name' => 'bug_assign_project', 'module' => 'bugs', 'label' => 'Assign Bug to Project', 'description' => 'Link bug to specific project'],
            ['name' => 'bug_change_status', 'module' => 'bugs', 'label' => 'Change Bug Status', 'description' => 'Update bug resolution status'],
            ['name' => 'bug_add_comments', 'module' => 'bugs', 'label' => 'Add Bug Comments', 'description' => 'Add comments to bug'],
            ['name' => 'bug_add_attachments', 'module' => 'bugs', 'label' => 'Add Bug Attachments', 'description' => 'Upload files to bug report'],
            ['name' => 'bug_track_resolution', 'module' => 'bugs', 'label' => 'Track Bug Resolution', 'description' => 'Monitor bug fix progress'],
            ['name' => 'bug_manage_statuses', 'module' => 'bugs', 'label' => 'Manage Bug Statuses', 'description' => 'Create/edit bug status types'],
            ['name' => 'bug_manage_priority', 'module' => 'bugs', 'label' => 'Manage Bug Priority', 'description' => 'Set bug priority levels'],

            // Timesheet Module
            ['name' => 'timesheet_view_any', 'module' => 'timesheet', 'label' => 'View All Timesheets', 'description' => 'View all timesheets in workspace'],
            ['name' => 'timesheet_view', 'module' => 'timesheet', 'label' => 'View Timesheet', 'description' => 'View individual timesheet'],
            ['name' => 'timesheet_create', 'module' => 'timesheet', 'label' => 'Create Timesheet', 'description' => 'Add new time entries'],
            ['name' => 'timesheet_update', 'module' => 'timesheet', 'label' => 'Update Timesheet', 'description' => 'Modify time entries'],
            ['name' => 'timesheet_delete', 'module' => 'timesheet', 'label' => 'Delete Timesheet', 'description' => 'Remove time entries'],
            ['name' => 'timesheet_assign', 'module' => 'timesheet', 'label' => 'Assign Timesheet', 'description' => 'Link timesheet to project/task'],
            ['name' => 'timesheet_submit', 'module' => 'timesheet', 'label' => 'Submit Timesheet', 'description' => 'Submit timesheet for review'],
            ['name' => 'timesheet_approve', 'module' => 'timesheet', 'label' => 'Approve Timesheet', 'description' => 'Review and approve timesheets'],
            ['name' => 'timesheet_generate_reports', 'module' => 'timesheet', 'label' => 'Generate Timesheet Reports', 'description' => 'Create time tracking reports'],
            ['name' => 'timesheet_use_timer', 'module' => 'timesheet', 'label' => 'Use Timer', 'description' => 'Use timer functionality'],
            ['name' => 'timesheet_bulk_operations', 'module' => 'timesheet', 'label' => 'Bulk Timesheet Operations', 'description' => 'Mass update time entries'],

            // Budget Module
            ['name' => 'budget_view_any', 'module' => 'budget', 'label' => 'View All Budgets', 'description' => 'View all budgets in workspace'],
            ['name' => 'budget_view', 'module' => 'budget', 'label' => 'View Budget', 'description' => 'View individual budget'],
            ['name' => 'budget_dashboard_view', 'module' => 'budget', 'label' => 'View Budget Dashboard', 'description' => 'Access budget dashboard (company and manager only)'],
            ['name' => 'budget_create', 'module' => 'budget', 'label' => 'Create Budget', 'description' => 'Create new budget'],
            ['name' => 'budget_update', 'module' => 'budget', 'label' => 'Update Budget', 'description' => 'Modify budget information'],
            ['name' => 'budget_delete', 'module' => 'budget', 'label' => 'Delete Budget', 'description' => 'Remove budget'],
            ['name' => 'budget_assign', 'module' => 'budget', 'label' => 'Assign Budget', 'description' => 'Link budget to project'],
            ['name' => 'budget_manage_categories', 'module' => 'budget', 'label' => 'Manage Budget Categories', 'description' => 'Set budget category allocations'],
            ['name' => 'budget_approve', 'module' => 'budget', 'label' => 'Approve Budget', 'description' => 'Review and approve budget changes'],
            ['name' => 'budget_track_expenses', 'module' => 'budget', 'label' => 'Track Budget Expenses', 'description' => 'Monitor budget utilization'],
            ['name' => 'budget_generate_reports', 'module' => 'budget', 'label' => 'Generate Budget Reports', 'description' => 'Create budget analytics'],
            ['name' => 'budget_manage_workflows', 'module' => 'budget', 'label' => 'Manage Budget Workflows', 'description' => 'Control budget approval process'],
            ['name' => 'budget_view_history', 'module' => 'budget', 'label' => 'View Budget History', 'description' => 'View budget change history'],
            ['name' => 'budget_manage_alerts', 'module' => 'budget', 'label' => 'Manage Budget Alerts', 'description' => 'Receive budget notifications'],

            // Expense Module
            ['name' => 'expense_view_any', 'module' => 'expense', 'label' => 'View All Expenses', 'description' => 'View all expenses in workspace'],
            ['name' => 'expense_view', 'module' => 'expense', 'label' => 'View Expense', 'description' => 'View individual expense'],
            ['name' => 'expense_create', 'module' => 'expense', 'label' => 'Create Expense', 'description' => 'Add new expense'],
            ['name' => 'expense_update', 'module' => 'expense', 'label' => 'Update Expense', 'description' => 'Modify expense information'],
            ['name' => 'expense_delete', 'module' => 'expense', 'label' => 'Delete Expense', 'description' => 'Remove expense'],
            ['name' => 'expense_assign', 'module' => 'expense', 'label' => 'Assign Expense', 'description' => 'Link expense to project/budget/approver'],
            ['name' => 'expense_add_attachments', 'module' => 'expense', 'label' => 'Add Expense Attachments', 'description' => 'Upload receipts/documents'],
            ['name' => 'expense_generate_reports', 'module' => 'expense', 'label' => 'Generate Expense Reports', 'description' => 'Create expense analytics'],
            ['name' => 'expense_manage_recurring', 'module' => 'expense', 'label' => 'Manage Recurring Expenses', 'description' => 'Set up automatic expenses'],
            ['name' => 'expense_manage_workflows', 'module' => 'expense', 'label' => 'Manage Expense Workflows', 'description' => 'Control approval process'],

            // Expense Approvals Module
            ['name' => 'expense_approval_view_any', 'module' => 'expense_approval', 'label' => 'View All Expense Approvals', 'description' => 'View all pending expense approvals'],
            ['name' => 'expense_approval_view', 'module' => 'expense_approval', 'label' => 'View Expense Approval', 'description' => 'View individual expense approval'],
            ['name' => 'expense_approval_approve', 'module' => 'expense_approval', 'label' => 'Approve Expense', 'description' => 'Approve expense requests'],
            ['name' => 'expense_approval_reject', 'module' => 'expense_approval', 'label' => 'Reject Expense', 'description' => 'Reject expense requests'],
            ['name' => 'expense_approval_request_info', 'module' => 'expense_approval', 'label' => 'Request Additional Info', 'description' => 'Request more information for expense'],
            ['name' => 'expense_approval_bulk_approve', 'module' => 'expense_approval', 'label' => 'Bulk Approve Expenses', 'description' => 'Approve multiple expenses at once'],
            ['name' => 'expense_approval_view_stats', 'module' => 'expense_approval', 'label' => 'View Approval Statistics', 'description' => 'View expense approval metrics'],
            ['name' => 'expense_approval_budget_summary', 'module' => 'expense_approval', 'label' => 'View Budget Summary', 'description' => 'View budget impact of approvals'],

            // Invoice Module
            ['name' => 'invoice_view_any', 'module' => 'invoice', 'label' => 'View All Invoices', 'description' => 'View all invoices in workspace'],
            ['name' => 'invoice_view', 'module' => 'invoice', 'label' => 'View Invoice', 'description' => 'View individual invoice'],
            ['name' => 'invoice_create', 'module' => 'invoice', 'label' => 'Create Invoice', 'description' => 'Create new invoice'],
            ['name' => 'invoice_update', 'module' => 'invoice', 'label' => 'Update Invoice', 'description' => 'Modify invoice information'],
            ['name' => 'invoice_delete', 'module' => 'invoice', 'label' => 'Delete Invoice', 'description' => 'Remove invoice'],
            ['name' => 'invoice_assign', 'module' => 'invoice', 'label' => 'Assign Invoice', 'description' => 'Link invoice to client/project'],
            ['name' => 'invoice_send', 'module' => 'invoice', 'label' => 'Send Invoice', 'description' => 'Email invoice to client'],
            ['name' => 'invoice_manage_payments', 'module' => 'invoice', 'label' => 'Manage Invoice Payments', 'description' => 'Monitor/record payment status'],
            ['name' => 'invoice_generate_reports', 'module' => 'invoice', 'label' => 'Generate Invoice Reports', 'description' => 'Create invoice analytics'],
            ['name' => 'invoice_manage_templates', 'module' => 'invoice', 'label' => 'Manage Invoice Templates', 'description' => 'Create/edit invoice layouts'],
            ['name' => 'invoice_manage_items', 'module' => 'invoice', 'label' => 'Manage Invoice Items', 'description' => 'Add/edit invoice line items'],

            // Media/File Management Module
            ['name' => 'media_view_any', 'module' => 'media', 'label' => 'View All Media', 'description' => 'Access file library'],
            ['name' => 'media_view', 'module' => 'media', 'label' => 'View Media', 'description' => 'View file details'],
            ['name' => 'media_upload', 'module' => 'media', 'label' => 'Upload Media', 'description' => 'Add new files'],
            ['name' => 'media_create', 'module' => 'media', 'label' => 'Create Media', 'description' => 'Create media files'],
            ['name' => 'media_update', 'module' => 'media', 'label' => 'Update Media', 'description' => 'Modify media files'],
            ['name' => 'media_delete', 'module' => 'media', 'label' => 'Delete Media', 'description' => 'Remove files'],
            ['name' => 'media_download', 'module' => 'media', 'label' => 'Download Media', 'description' => 'Download media files'],
            ['name' => 'media_manage', 'module' => 'media', 'label' => 'Manage Media', 'description' => 'Organize file structure'],

            // Plan Management Module (SaaS)
            ['name' => 'plan_view_any', 'module' => 'plan', 'label' => 'View All Plans', 'description' => 'View all subscription plans'],
            ['name' => 'plan_view', 'module' => 'plan', 'label' => 'View Plan', 'description' => 'View individual plan'],
            ['name' => 'plan_create', 'module' => 'plan', 'label' => 'Create Plan', 'description' => 'Add new plan'],
            ['name' => 'plan_update', 'module' => 'plan', 'label' => 'Update Plan', 'description' => 'Modify plan information'],
            ['name' => 'plan_delete', 'module' => 'plan', 'label' => 'Delete Plan', 'description' => 'Remove plan'],
            ['name' => 'plan_assign', 'module' => 'plan', 'label' => 'Assign Plan', 'description' => 'Set user subscription'],
            ['name' => 'plan_manage_orders', 'module' => 'plan', 'label' => 'Manage Plan Orders', 'description' => 'Handle plan purchases'],
            ['name' => 'plan_manage_requests', 'module' => 'plan', 'label' => 'Manage Plan Requests', 'description' => 'Process plan change requests'],
            ['name' => 'plan_request', 'module' => 'plan', 'label' => 'Request Plan', 'description' => 'Request plan changes'],
            ['name' => 'plan_trial', 'module' => 'plan', 'label' => 'Start Trial', 'description' => 'Start plan trial'],
            ['name' => 'plan_subscribe', 'module' => 'plan', 'label' => 'Subscribe Plan', 'description' => 'Subscribe to plan'],
            ['name' => 'plan_approve_orders', 'module' => 'plan', 'label' => 'Approve Plan Orders', 'description' => 'Approve plan orders'],
            ['name' => 'plan_reject_orders', 'module' => 'plan', 'label' => 'Reject Plan Orders', 'description' => 'Reject plan orders'],
            ['name' => 'plan_view_my_requests', 'module' => 'plan', 'label' => 'View My Plan Requests', 'description' => 'View own plan requests'],
            ['name' => 'plan_view_my_orders', 'module' => 'plan', 'label' => 'View My Plan Orders', 'description' => 'View own plan orders'],

            // Report Module
            ['name' => 'report_view_any', 'module' => 'report', 'label' => 'View All Reports', 'description' => 'View all available reports'],
            ['name' => 'report_view', 'module' => 'report', 'label' => 'View Report', 'description' => 'Access specific report'],
            ['name' => 'report_create', 'module' => 'report', 'label' => 'Create Report', 'description' => 'Build custom reports'],
            ['name' => 'report_export', 'module' => 'report', 'label' => 'Export Report', 'description' => 'Download reports'],
            ['name' => 'report_assign', 'module' => 'report', 'label' => 'Assign Report', 'description' => 'Grant report permissions'],
            ['name' => 'report_schedule', 'module' => 'report', 'label' => 'Schedule Report', 'description' => 'Setup automatic reports'],
            ['name' => 'report_timesheet', 'module' => 'report', 'label' => 'Timesheet Reports', 'description' => 'Generate timesheet reports'],
            ['name' => 'report_expense', 'module' => 'report', 'label' => 'Expense Reports', 'description' => 'Generate expense reports'],
            ['name' => 'report_customer', 'module' => 'report', 'label' => 'Customer Reports', 'description' => 'Generate customer reports'],
            ['name' => 'report_budget_vs_actual', 'module' => 'report', 'label' => 'Budget vs Actual Reports', 'description' => 'Generate budget comparison reports'],
            ['name' => 'report_category', 'module' => 'report', 'label' => 'Category Reports', 'description' => 'Generate category-wise reports'],
            ['name' => 'report_team', 'module' => 'report', 'label' => 'Team Reports', 'description' => 'Generate team performance reports'],
            ['name' => 'report_dashboard_widgets', 'module' => 'report', 'label' => 'Dashboard Widgets', 'description' => 'View dashboard report widgets'],

            // User Management Module
            ['name' => 'user_view_any', 'module' => 'user', 'label' => 'View All Users', 'description' => 'View all users in system'],
            ['name' => 'user_view', 'module' => 'user', 'label' => 'View User', 'description' => 'View individual user profile'],
            ['name' => 'user_create', 'module' => 'user', 'label' => 'Create User', 'description' => 'Add new user'],
            ['name' => 'user_update', 'module' => 'user', 'label' => 'Update User', 'description' => 'Modify user information'],
            ['name' => 'user_delete', 'module' => 'user', 'label' => 'Delete User', 'description' => 'Remove user'],
            ['name' => 'user_assign', 'module' => 'user', 'label' => 'Assign User', 'description' => 'Add user to workspace/role'],
            ['name' => 'user_invite', 'module' => 'user', 'label' => 'Invite User', 'description' => 'Send workspace invitations'],
            ['name' => 'user_manage_roles', 'module' => 'user', 'label' => 'Manage User Roles', 'description' => 'Create/edit user roles'],
            ['name' => 'user_manage_permissions', 'module' => 'user', 'label' => 'Manage User Permissions', 'description' => 'Grant specific permissions'],
            ['name' => 'user_reset_password', 'module' => 'user', 'label' => 'Reset User Password', 'description' => 'Reset user login credentials'],
            ['name' => 'user_toggle_status', 'module' => 'user', 'label' => 'Toggle User Status', 'description' => 'Activate/deactivate users'],
            ['name' => 'user_impersonate', 'module' => 'user', 'label' => 'Impersonate User', 'description' => 'Login as another user'],
            ['name' => 'user_manage_profile', 'module' => 'user', 'label' => 'Manage Profile', 'description' => 'Manage own profile'],

            // Role & Permission Module
            // ['name' => 'role_view_any', 'module' => 'role', 'label' => 'View All Roles', 'description' => 'View all system roles'],
            // ['name' => 'role_view', 'module' => 'role', 'label' => 'View Role', 'description' => 'View individual role'],
            // ['name' => 'role_create', 'module' => 'role', 'label' => 'Create Role', 'description' => 'Add new role'],
            // ['name' => 'role_update', 'module' => 'role', 'label' => 'Update Role', 'description' => 'Modify role information'],
            // ['name' => 'role_delete', 'module' => 'role', 'label' => 'Delete Role', 'description' => 'Remove role'],
            // ['name' => 'role_assign', 'module' => 'role', 'label' => 'Assign Role', 'description' => 'Grant role to user'],
            // ['name' => 'permission_view_any', 'module' => 'permission', 'label' => 'View All Permissions', 'description' => 'See all permissions'],
            // ['name' => 'permission_assign', 'module' => 'permission', 'label' => 'Assign Permissions', 'description' => 'Set role permissions'],
            // ['name' => 'permission_manage', 'module' => 'permission', 'label' => 'Manage Permissions', 'description' => 'Manage access system'],

            // Company Management Module (SaaS)
            ['name' => 'company_view_any', 'module' => 'company', 'label' => 'View All Companies', 'description' => 'View all companies'],
            ['name' => 'company_view', 'module' => 'company', 'label' => 'View Company', 'description' => 'View individual company'],
            ['name' => 'company_create', 'module' => 'company', 'label' => 'Create Company', 'description' => 'Add new company'],
            ['name' => 'company_update', 'module' => 'company', 'label' => 'Update Company', 'description' => 'Modify company information'],
            ['name' => 'company_delete', 'module' => 'company', 'label' => 'Delete Company', 'description' => 'Remove company'],
            ['name' => 'company_reset_password', 'module' => 'company', 'label' => 'Reset Company Password', 'description' => 'Reset company password'],
            ['name' => 'company_toggle_status', 'module' => 'company', 'label' => 'Toggle Company Status', 'description' => 'Enable/disable company'],
            ['name' => 'company_manage_plans', 'module' => 'company', 'label' => 'Manage Company Plans', 'description' => 'Manage company plans'],
            ['name' => 'company_upgrade_plan', 'module' => 'company', 'label' => 'Upgrade Company Plan', 'description' => 'Upgrade company plan'],

            // Payment Module
            ['name' => 'payment_view_any', 'module' => 'payment', 'label' => 'View All Payments', 'description' => 'View all payment transactions'],
            ['name' => 'payment_view', 'module' => 'payment', 'label' => 'View Payment', 'description' => 'View individual payment'],
            ['name' => 'payment_process', 'module' => 'payment', 'label' => 'Process Payment', 'description' => 'Handle payment transactions'],
            ['name' => 'payment_refund', 'module' => 'payment', 'label' => 'Process Refund', 'description' => 'Issue payment refunds'],
            ['name' => 'payment_manage_gateways', 'module' => 'payment', 'label' => 'Manage Payment Gateways', 'description' => 'Configure payment methods'],

            // Coupon Module (SaaS)
            ['name' => 'coupon_view_any', 'module' => 'coupon', 'label' => 'View All Coupons', 'description' => 'View all discount coupons'],
            ['name' => 'coupon_view', 'module' => 'coupon', 'label' => 'View Coupon', 'description' => 'View individual coupon'],
            ['name' => 'coupon_create', 'module' => 'coupon', 'label' => 'Create Coupon', 'description' => 'Add new coupon'],
            ['name' => 'coupon_update', 'module' => 'coupon', 'label' => 'Update Coupon', 'description' => 'Modify coupon information'],
            ['name' => 'coupon_delete', 'module' => 'coupon', 'label' => 'Delete Coupon', 'description' => 'Remove coupon'],
            ['name' => 'coupon_assign', 'module' => 'coupon', 'label' => 'Assign Coupon', 'description' => 'Grant coupon to user/plan'],
            ['name' => 'coupon_toggle_status', 'module' => 'coupon', 'label' => 'Toggle Coupon Status', 'description' => 'Enable/disable coupon'],

            // Currency Module
            ['name' => 'currency_view_any', 'module' => 'currency', 'label' => 'View All Currencies', 'description' => 'View all currencies'],
            ['name' => 'currency_view', 'module' => 'currency', 'label' => 'View Currency', 'description' => 'View individual currency'],
            ['name' => 'currency_create', 'module' => 'currency', 'label' => 'Create Currency', 'description' => 'Add new currency'],
            ['name' => 'currency_update', 'module' => 'currency', 'label' => 'Update Currency', 'description' => 'Modify currency information'],
            ['name' => 'currency_delete', 'module' => 'currency', 'label' => 'Delete Currency', 'description' => 'Remove currency'],

            // Referral Module (SaaS)
            ['name' => 'referral_view_any', 'module' => 'referral', 'label' => 'View All Referrals', 'description' => 'View all referral records'],
            ['name' => 'referral_view', 'module' => 'referral', 'label' => 'View Referral', 'description' => 'View individual referral'],
            ['name' => 'referral_create', 'module' => 'referral', 'label' => 'Create Referral', 'description' => 'Generate referral links'],
            ['name' => 'referral_manage', 'module' => 'referral', 'label' => 'Manage Referral', 'description' => 'Configure referral settings'],
            ['name' => 'referral_payout', 'module' => 'referral', 'label' => 'Manage Referral Payout', 'description' => 'Handle referral payments'],
            ['name' => 'referral_approve_payout', 'module' => 'referral', 'label' => 'Approve Referral Payout', 'description' => 'Approve payout requests'],
            ['name' => 'referral_reject_payout', 'module' => 'referral', 'label' => 'Reject Referral Payout', 'description' => 'Reject payout requests'],

            // Landing Page Module
            ['name' => 'landing_page_view', 'module' => 'landing_page', 'label' => 'View Landing Page', 'description' => 'Access public page'],
            ['name' => 'landing_page_update', 'module' => 'landing_page', 'label' => 'Update Landing Page', 'description' => 'Modify page content'],
            ['name' => 'landing_page_manage', 'module' => 'landing_page', 'label' => 'Manage Landing Page', 'description' => 'Configure page options'],

            // Custom Pages Module
            ['name' => 'custom_page_view_any', 'module' => 'custom_page', 'label' => 'View All Custom Pages', 'description' => 'View all custom pages in admin'],
            ['name' => 'custom_page_view', 'module' => 'custom_page', 'label' => 'View Custom Page', 'description' => 'View individual custom page'],
            ['name' => 'custom_page_create', 'module' => 'custom_page', 'label' => 'Create Custom Page', 'description' => 'Create new custom page'],
            ['name' => 'custom_page_update', 'module' => 'custom_page', 'label' => 'Update Custom Page', 'description' => 'Modify custom page content'],
            ['name' => 'custom_page_delete', 'module' => 'custom_page', 'label' => 'Delete Custom Page', 'description' => 'Remove custom page'],
            ['name' => 'custom_page_manage_seo', 'module' => 'custom_page', 'label' => 'Manage Page SEO', 'description' => 'Manage meta titles and descriptions'],
            ['name' => 'custom_page_manage_order', 'module' => 'custom_page', 'label' => 'Manage Page Order', 'description' => 'Change page sort order'],
            ['name' => 'custom_page_toggle_status', 'module' => 'custom_page', 'label' => 'Toggle Page Status', 'description' => 'Activate/deactivate custom pages'],

            // // Email Template Module
            // ['name' => 'email_template_view_any', 'module' => 'email_template', 'label' => 'View All Email Templates', 'description' => 'View all email templates'],
            // ['name' => 'email_template_view', 'module' => 'email_template', 'label' => 'View Email Template', 'description' => 'View individual template'],
            // ['name' => 'email_template_create', 'module' => 'email_template', 'label' => 'Create Email Template', 'description' => 'Add new template'],
            // ['name' => 'email_template_update', 'module' => 'email_template', 'label' => 'Update Email Template', 'description' => 'Modify template'],
            // ['name' => 'email_template_delete', 'module' => 'email_template', 'label' => 'Delete Email Template', 'description' => 'Remove template'],
            // ['name' => 'email_template_assign', 'module' => 'email_template', 'label' => 'Assign Email Template', 'description' => 'Link template to trigger'],

            // Webhook Module
            // ['name' => 'webhook_view_any', 'module' => 'webhook', 'label' => 'View All Webhooks', 'description' => 'View all webhook endpoints'],
            // ['name' => 'webhook_view', 'module' => 'webhook', 'label' => 'View Webhook', 'description' => 'View individual webhook'],
            // ['name' => 'webhook_create', 'module' => 'webhook', 'label' => 'Create Webhook', 'description' => 'Add new webhook'],
            // ['name' => 'webhook_update', 'module' => 'webhook', 'label' => 'Update Webhook', 'description' => 'Modify webhook settings'],
            // ['name' => 'webhook_delete', 'module' => 'webhook', 'label' => 'Delete Webhook', 'description' => 'Remove webhook'],
            // ['name' => 'webhook_test', 'module' => 'webhook', 'label' => 'Test Webhook', 'description' => 'Verify webhook functionality'],

            // Language Module
            ['name' => 'language_view', 'module' => 'language', 'label' => 'View Language', 'description' => 'View language settings'],
            ['name' => 'language_update', 'module' => 'language', 'label' => 'Update Language', 'description' => 'Modify language translations'],
            ['name' => 'language_manage', 'module' => 'language', 'label' => 'Manage Language', 'description' => 'Manage language system'],

            // Newsletter Module
            ['name' => 'newsletter_view_any', 'module' => 'newsletter', 'label' => 'View All Newsletters', 'description' => 'View all newsletter subscriptions'],
            ['name' => 'newsletter_view', 'module' => 'newsletter', 'label' => 'View Newsletter', 'description' => 'View individual newsletter subscription'],
            ['name' => 'newsletter_create', 'module' => 'newsletter', 'label' => 'Create Newsletter', 'description' => 'Add new newsletter subscription'],
            ['name' => 'newsletter_update', 'module' => 'newsletter', 'label' => 'Update Newsletter', 'description' => 'Modify newsletter subscription'],
            ['name' => 'newsletter_delete', 'module' => 'newsletter', 'label' => 'Delete Newsletter', 'description' => 'Remove newsletter subscription'],
            ['name' => 'newsletter_toggle_status', 'module' => 'newsletter', 'label' => 'Toggle Newsletter Status', 'description' => 'Subscribe/unsubscribe newsletter'],
            ['name' => 'newsletter_bulk_operations', 'module' => 'newsletter', 'label' => 'Newsletter Bulk Operations', 'description' => 'Perform bulk operations on newsletters'],
            ['name' => 'newsletter_export', 'module' => 'newsletter', 'label' => 'Export Newsletter', 'description' => 'Export newsletter data'],

            // Contact Module
            ['name' => 'contact_view_any', 'module' => 'contact', 'label' => 'View All Contacts', 'description' => 'View all contact submissions'],
            ['name' => 'contact_view', 'module' => 'contact', 'label' => 'View Contact', 'description' => 'View individual contact submission'],
            ['name' => 'contact_create', 'module' => 'contact', 'label' => 'Create Contact', 'description' => 'Add new contact submission'],
            ['name' => 'contact_update', 'module' => 'contact', 'label' => 'Update Contact', 'description' => 'Modify contact submission'],
            ['name' => 'contact_delete', 'module' => 'contact', 'label' => 'Delete Contact', 'description' => 'Remove contact submission'],
            ['name' => 'contact_update_status', 'module' => 'contact', 'label' => 'Update Contact Status', 'description' => 'Change contact status'],
            ['name' => 'contact_bulk_operations', 'module' => 'contact', 'label' => 'Contact Bulk Operations', 'description' => 'Perform bulk operations on contacts'],
            ['name' => 'contact_export', 'module' => 'contact', 'label' => 'Export Contact', 'description' => 'Export contact data'],

            // Settings Module
            ['name' => 'settings_view', 'module' => 'settings', 'label' => 'View Settings', 'description' => 'Access settings panel'],
            ['name' => 'settings_update', 'module' => 'settings', 'label' => 'Update Settings', 'description' => 'Modify basic settings'],
            ['name' => 'settings_system', 'module' => 'settings', 'label' => 'Manage System Settings', 'description' => 'Set system timezone/language'],
            ['name' => 'settings_brand', 'module' => 'settings', 'label' => 'Manage Brand Settings', 'description' => 'Update logos, colors, themes'],
            ['name' => 'settings_email', 'module' => 'settings', 'label' => 'Manage Email Settings', 'description' => 'Setup email configuration'],
            ['name' => 'settings_payment', 'module' => 'settings', 'label' => 'Manage Payment Settings', 'description' => 'Configure payment methods'],
            ['name' => 'settings_storage', 'module' => 'settings', 'label' => 'Manage Storage Settings', 'description' => 'Setup file storage'],
            ['name' => 'settings_currency', 'module' => 'settings', 'label' => 'Manage Currency Settings', 'description' => 'Set currency options'],
            ['name' => 'settings_recaptcha', 'module' => 'settings', 'label' => 'Manage ReCaptcha Settings', 'description' => 'Configure ReCaptcha'],
            ['name' => 'settings_chatgpt', 'module' => 'settings', 'label' => 'Manage ChatGPT Settings', 'description' => 'Configure ChatGPT integration'],
            ['name' => 'settings_cookie', 'module' => 'settings', 'label' => 'Manage Cookie Settings', 'description' => 'Configure GDPR cookie settings'],
            ['name' => 'settings_seo', 'module' => 'settings', 'label' => 'Manage SEO Settings', 'description' => 'Configure SEO options'],
            ['name' => 'settings_cache', 'module' => 'settings', 'label' => 'Manage Cache Settings', 'description' => 'Configure cache settings'],
            // ['name' => 'settings_webhook', 'module' => 'settings', 'label' => 'Manage Webhook Settings', 'description' => 'Configure webhook settings']
        ];

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(
                ['name' => $permission['name']],
                [
                    'module' => $permission['module'],
                    'label' => $permission['label'],
                    'description' => $permission['description'],
                    'guard_name' => 'web'
                ]
            );
        }
    }
}