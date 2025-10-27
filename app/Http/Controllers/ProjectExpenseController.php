<?php

namespace App\Http\Controllers;

use App\Models\ProjectExpense;
use App\Models\Project;
use App\Models\BudgetCategory;
use App\Traits\HasPermissionChecks;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectExpenseController extends Controller
{
    use HasPermissionChecks;
    public function index(Request $request)
    {
        $this->authorizePermission('expense_view_any');
        
        $user = auth()->user();
        $workspace = $user->currentWorkspace;
        
        $userWorkspaceRole = $workspace->getMemberRole($user);
        
        $query = ProjectExpense::with(['project', 'budgetCategory', 'submitter', 'task'])
            ->whereHas('project', function($q) use ($workspace) {
                $q->where('workspace_id', $workspace->id);
            });
            
        // Members can only see their own expenses
        if ($userWorkspaceRole === 'member') {
            $query->where('submitted_by', $user->id);
        } elseif ($userWorkspaceRole === 'manager') {
            // Managers see expenses from their assigned projects
            $query->whereHas('project', function($q) use ($user) {
                $q->where(function($projectQuery) use ($user) {
                    $projectQuery->whereHas('members', function($memberQuery) use ($user) {
                        $memberQuery->where('user_id', $user->id);
                    })
                    ->orWhere('created_by', $user->id);
                });
            });
        }

        if ($request->project_id) {
            $query->where('project_id', $request->project_id);
        }

        if ($request->category_id) {
            $query->where('budget_category_id', $request->category_id);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->submitted_by) {
            $query->where('submitted_by', $request->submitted_by);
        }

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%')
                  ->orWhere('vendor', 'like', '%' . $request->search . '%')
                  ->orWhereHas('submitter', function($subQ) use ($request) {
                      $subQ->where('name', 'like', '%' . $request->search . '%');
                  })
                  ->orWhereHas('project', function($projQ) use ($request) {
                      $projQ->where('title', 'like', '%' . $request->search . '%');
                  });
            });
        }

        $perPage = $request->get('per_page', 20);
        $expenses = $query->latest()->paginate($perPage);

        $userWorkspaceRole = $workspace->getMemberRole($user);
        
        // Apply access control to projects dropdown
        $projectsQuery = Project::with(['budget.categories'])->forWorkspace($workspace->id);
        
        if (in_array($userWorkspaceRole, ['member', 'manager'])) {
            // Members and managers only see projects they're assigned to
            $projectsQuery->where(function($q) use ($user) {
                $q->whereHas('members', function($memberQuery) use ($user) {
                    $memberQuery->where('user_id', $user->id);
                })
                ->orWhere('created_by', $user->id);
            });
        } elseif ($userWorkspaceRole === 'client') {
            // Clients see projects they're assigned to as clients
            $projectsQuery->where(function($q) use ($user) {
                $q->whereHas('clients', function($clientQuery) use ($user) {
                    $clientQuery->where('user_id', $user->id);
                })
                ->orWhere('created_by', $user->id);
            });
        }
        
        $projects = $projectsQuery->get();
        $categories = BudgetCategory::whereHas('projectBudget', function($q) use ($workspace) {
            $q->where('workspace_id', $workspace->id);
        })->get(['id', 'name', 'color']);
        
        $members = $workspace->users()->get(['users.id', 'users.name', 'users.avatar']);

        return Inertia::render('expenses/Index', [
            'expenses' => $expenses,
            'projects' => $projects,
            'categories' => $categories,
            'members' => $members,
            'filters' => $request->only(['project_id', 'category_id', 'status', 'submitted_by', 'search', 'per_page']),
            'project_name' => $request->project_name,
            'userWorkspaceRole' => $userWorkspaceRole,
            'permissions' => [
                'create' => $this->checkPermission('expense_create'),
                'update' => $this->checkPermission('expense_update'),
                'delete' => $this->checkPermission('expense_delete'),
                'view' => $this->checkPermission('expense_view'),
            ]
        ]);
    }

    public function create()
    {
        return redirect()->route('expenses.index');
    }

    public function show(ProjectExpense $expense)
    {
        $this->authorizePermission('expense_view');
        
        $expense->load([
            'project', 
            'budgetCategory', 
            'submitter', 
            'task', 
            'approvals.approver'
        ]);
        
        return Inertia::render('expenses/Show', [
            'expense' => $expense,
            'permissions' => [
                'update' => $this->checkPermission('expense_update'),
                'delete' => $this->checkPermission('expense_delete'),
            ]
        ]);
    }

    public function edit(ProjectExpense $expense)
    {
        return redirect()->route('expenses.index');
    }

    public function store(Request $request)
    {
        $this->authorizePermission('expense_create');
        
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'budget_category_id' => 'nullable|exists:budget_categories,id',
            'task_id' => 'nullable|exists:tasks,id',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'required|date|before_or_equal:today',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string'
        ]);

        ProjectExpense::create([
            ...$validated,
            'submitted_by' => auth()->id(),
            'status' => 'pending',
            'currency' => 'USD'
        ]);

        return redirect()->route('expenses.index')->with('success', __('Expense created successfully!'));
    }

    public function update(Request $request, ProjectExpense $expense)
    {
        $this->authorizePermission('expense_update');

        $validated = $request->validate([
            'budget_category_id' => 'nullable|exists:budget_categories,id',
            'task_id' => 'nullable|exists:tasks,id',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'required|date|before_or_equal:today',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string'
        ]);

        // If expense was requires_info, change back to pending when updated
        if ($expense->status === 'requires_info') {
            $validated['status'] = 'pending';
        }
        
        $expense->update($validated);

        return redirect()->route('expenses.index')->with('success', __('Expense updated successfully!'));
    }

    public function destroy(ProjectExpense $expense)
    {
        $this->authorizePermission('expense_delete');

        $expense->delete();
        return back()->with('success', __('Expense deleted successfully!'));
    }

    public function duplicate(ProjectExpense $expense)
    {
        $newExpense = $expense->replicate();
        $newExpense->title = $expense->title . ' (Copy)';
        $newExpense->expense_date = now()->toDateString();
        $newExpense->status = 'pending';
        $newExpense->submitted_by = auth()->id();
        $newExpense->save();

        return redirect()->route('expenses.index')->with('success', __('Expense duplicated successfully!'));
    }

    public function getProjectTasks(Project $project)
    {
        $tasks = $project->tasks()
            ->with(['taskStage:id,name,color'])
            ->select('id', 'title', 'task_stage_id')
            ->get();
            
        return response()->json($tasks);
    }
}