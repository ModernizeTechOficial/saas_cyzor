import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2, Clock, Calendar, Search, Filter, CheckCircle, Eye } from 'lucide-react';
import TimeEntryForm from './TimeEntryForm';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { formatHoursDisplay } from '@/utils/timesheetUtils';
import { Progress } from '@/components/ui/progress';

interface TimeEntry {
    id: number;
    project: { id: number; title: string };
    task?: { id: number; title: string };
    date: string;
    start_time?: string;
    end_time?: string;
    hours: number;
    description?: string;
    is_billable: boolean;
    hourly_rate?: number;
}

interface Project {
    id: number;
    title: string;
    tasks?: any[];
}

interface Props {
    entries: TimeEntry[] | { data: TimeEntry[], links?: any[], from?: number, to?: number, total?: number };
    timesheetId: number;
    projects: Project[];
    onRefresh?: () => void;
    filters?: { search?: string, per_page?: number, project?: string, billable?: string };
}

export default function TimeEntryList({ entries, timesheetId, projects, onRefresh, filters = {} }: Props) {
    const [selectedEntries, setSelectedEntries] = useState<number[]>([]);
    const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState<TimeEntry | null>(null);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedProject, setSelectedProject] = useState(filters.project || 'all');
    const [selectedBillable, setSelectedBillable] = useState(filters.billable || 'all');
    const [showFilters, setShowFilters] = useState(false);

    // Handle both array and paginated data formats
    const entriesData = Array.isArray(entries) ? entries : entries.data || [];
    const paginationData = Array.isArray(entries) ? null : entries;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };
    
    const applyFilters = () => {
        const params: any = { page: 1 };
        
        if (searchTerm) params.search = searchTerm;
        if (selectedProject !== 'all') params.project = selectedProject;
        if (selectedBillable !== 'all') params.billable = selectedBillable;
        if (filters.per_page) params.per_page = filters.per_page;
        
        router.get(window.location.pathname, params, { preserveState: true, preserveScroll: false });
    };
    
    const handleProjectFilter = (value: string) => {
        setSelectedProject(value);
        const params: any = { page: 1 };
        if (searchTerm) params.search = searchTerm;
        if (value !== 'all') params.project = value;
        if (selectedBillable !== 'all') params.billable = selectedBillable;
        if (filters.per_page) params.per_page = filters.per_page;
        router.get(window.location.pathname, params, { preserveState: true, preserveScroll: false });
    };
    
    const handleBillableFilter = (value: string) => {
        setSelectedBillable(value);
        const params: any = { page: 1 };
        if (searchTerm) params.search = searchTerm;
        if (selectedProject !== 'all') params.project = selectedProject;
        if (value !== 'all') params.billable = value;
        if (filters.per_page) params.per_page = filters.per_page;
        router.get(window.location.pathname, params, { preserveState: true, preserveScroll: false });
    };
    
    const hasActiveFilters = () => {
        return selectedProject !== 'all' || selectedBillable !== 'all' || searchTerm !== '';
    };
    
    const activeFilterCount = () => {
        return (selectedProject !== 'all' ? 1 : 0) + (selectedBillable !== 'all' ? 1 : 0) + (searchTerm ? 1 : 0);
    };
    
    const handleResetFilters = () => {
        setSelectedProject('all');
        setSelectedBillable('all');
        setSearchTerm('');
        setShowFilters(false);
        router.get(window.location.pathname, { page: 1, per_page: filters.per_page }, { preserveState: true, preserveScroll: false });
    };

    const handleEdit = (entry: TimeEntry) => {
        const mappedEntry = {
            id: entry.id,
            timesheet_id: timesheetId,
            project_id: entry.project.id,
            task_id: entry.task?.id,
            date: entry.date,
            start_time: entry.start_time,
            end_time: entry.end_time,
            hours: entry.hours,
            description: entry.description,
            is_billable: entry.is_billable
        };
        setEditingEntry(mappedEntry as any);
        setIsFormOpen(true);
    };

    const handleDelete = (entry: TimeEntry) => {
        setEntryToDelete(entry);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (entryToDelete) {
            router.delete(route('timesheet-entries.destroy', { timesheet_entry: entryToDelete.id }), {
                onSuccess: () => {
                    onRefresh?.();
                    setIsDeleteModalOpen(false);
                    setEntryToDelete(null);
                },
                onError: (errors) => {
                    console.error('Delete failed:', errors);
                    alert('Failed to delete entry. Please try again.');
                }
            });
        }
    };

    const handleBulkDelete = () => {
        if (selectedEntries.length === 0) return;
        setIsBulkDeleteModalOpen(true);
    };

    const handleBulkDeleteConfirm = () => {
        router.delete(route('timesheet-entries.bulk-delete'), {
            data: { entry_ids: selectedEntries },
            onSuccess: () => {
                setSelectedEntries([]);
                onRefresh?.();
                setIsBulkDeleteModalOpen(false);
            },
            onError: (errors) => {
                console.error('Bulk delete failed:', errors);
                alert('Failed to delete entries. Please try again.');
            }
        });
    };

    const handleBulkToggleBillable = (billable: boolean) => {
        if (selectedEntries.length === 0) return;
        router.post(route('timesheet-entries.bulk-update'), {
            entry_ids: selectedEntries,
            is_billable: billable
        }, {
            onSuccess: () => {
                setSelectedEntries([]);
                onRefresh?.();
            },
            onError: (errors) => {
                console.error('Bulk update failed:', errors);
                alert('Failed to update entries. Please try again.');
            }
        });
    };

    const toggleSelection = (entryId: number) => {
        setSelectedEntries(prev => 
            prev.includes(entryId) 
                ? prev.filter(id => id !== entryId)
                : [...prev, entryId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedEntries.length === entriesData.length) {
            setSelectedEntries([]);
        } else {
            setSelectedEntries(entriesData.map(e => e.id));
        }
    };

    const getTotalHours = () => entriesData.reduce((sum, entry) => sum + (Number(entry.hours) || 0), 0);
    const getBillableHours = () => entriesData.filter(e => e.is_billable).reduce((sum, entry) => sum + (Number(entry.hours) || 0), 0);
    
    const totalHours = getTotalHours();
    const billableHours = getBillableHours();
    const hoursDisplay = formatHoursDisplay(totalHours, billableHours);

    return (
        <div className="space-y-4">
            {/* Search and filters section */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <div className="relative w-64">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search entries..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-9"
                                    />
                                </div>
                                <Button type="submit" size="sm">
                                    <Search className="h-4 w-4 mr-1.5" />
                                    Search
                                </Button>
                            </form>
                            
                            <div className="ml-2">
                                <Button 
                                    variant={hasActiveFilters() ? "default" : "outline"}
                                    size="sm" 
                                    className="h-8 px-2 py-1"
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <Filter className="h-3.5 w-3.5 mr-1.5" />
                                    {showFilters ? 'Hide Filters' : 'Filters'}
                                    {hasActiveFilters() && (
                                        <span className="ml-1 bg-primary-foreground text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                            {activeFilterCount()}
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Label className="text-xs text-muted-foreground">Per Page:</Label>
                            <Select 
                                value={filters.per_page?.toString() || "10"} 
                                onValueChange={(value) => {
                                    const params: any = { page: 1, per_page: parseInt(value) };
                                    if (searchTerm) params.search = searchTerm;
                                    if (selectedProject !== 'all') params.project = selectedProject;
                                    if (selectedBillable !== 'all') params.billable = selectedBillable;
                                    router.get(window.location.pathname, params, { preserveState: true, preserveScroll: false });
                                }}
                            >
                                <SelectTrigger className="w-16 h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    {showFilters && (
                        <div className="w-full mt-3 p-4 bg-gray-50 border rounded-md">
                            <div className="flex flex-wrap gap-4 items-end">
                                <div className="space-y-2">
                                    <Label>Project</Label>
                                    <Select value={selectedProject} onValueChange={handleProjectFilter}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue placeholder="All Projects" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Projects</SelectItem>
                                            {projects.map((project) => (
                                                <SelectItem key={project.id} value={project.id.toString()}>
                                                    {project.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label>Billable</Label>
                                    <Select value={selectedBillable} onValueChange={handleBillableFilter}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue placeholder="All Types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="true">Billable</SelectItem>
                                            <SelectItem value="false">Non-billable</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="h-9"
                                    onClick={handleResetFilters}
                                    disabled={!hasActiveFilters()}
                                >
                                    Reset Filters
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Summary */}
            {entriesData.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 mb-6">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
                                Time Summary
                            </h3>
                            {hoursDisplay.match && totalHours > 0 && (
                                <Badge className="bg-green-100 text-green-800 border-green-300 px-3 py-1" variant="outline">
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    All Hours Billable
                                </Badge>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Clock className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total Hours</p>
                                        <p className="text-2xl font-bold text-gray-900">{hoursDisplay.total}</p>
                                    </div>
                                    {hoursDisplay.match && (
                                        <CheckCircle className="h-5 w-5 text-green-500 ml-auto" title="Hours match" />
                                    )}
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <Calendar className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Billable Hours</p>
                                        <p className="text-2xl font-bold text-green-600">{hoursDisplay.billable}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-semibold text-gray-700">Billable Rate</span>
                                <span className="text-lg font-bold text-gray-900">{hoursDisplay.percentage}%</span>
                            </div>
                            <div className="relative">
                                <Progress value={hoursDisplay.percentage} className="w-full h-4 bg-gray-200" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xs font-medium text-white drop-shadow">
                                        {billableHours}h / {totalHours}h
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Actions */}
            {selectedEntries.length > 0 && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium">{selectedEntries.length} selected</span>
                    <Button size="sm" onClick={() => handleBulkToggleBillable(true)}>
                        Mark Billable
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBulkToggleBillable(false)}>
                        Mark Non-Billable
                    </Button>
                    <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                        Delete Selected
                    </Button>
                </div>
            )}

            {/* Entries List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left">
                                    <Checkbox
                                        checked={selectedEntries.length === entriesData.length && entriesData.length > 0}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Billable</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {entriesData.map((entry) => (
                                <tr key={entry.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <Checkbox
                                            checked={selectedEntries.includes(entry.id)}
                                            onCheckedChange={() => toggleSelection(entry.id)}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {new Date(entry.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-sm font-medium text-gray-900">{entry.project.title}</div>
                                        {entry.description && <div className="text-sm text-gray-500 truncate max-w-xs">{entry.description}</div>}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {entry.task?.title || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-blue-600">
                                        {entry.hours}h
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant={entry.is_billable ? 'default' : 'secondary'} className={entry.is_billable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {entry.is_billable ? '💰 Billable' : 'Non-billable'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => handleEdit(entry)}
                                                className="h-8 w-8 text-amber-500 hover:text-amber-700"
                                                title="Edit"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => handleDelete(entry)}
                                                className="h-8 w-8 text-red-500 hover:text-red-700"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {entriesData.length === 0 && (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No time entries found</p>
                </div>
            )}

            {/* Pagination */}
            {paginationData?.links && (
                <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing <span className="font-medium">{paginationData?.from || 0}</span> to <span className="font-medium">{paginationData?.to || 0}</span> of <span className="font-medium">{paginationData?.total || 0}</span> entries
                    </div>
                    
                    <div className="flex gap-1">
                        {paginationData?.links?.map((link: any, i: number) => {
                            const isTextLink = link.label === "&laquo; Previous" || link.label === "Next &raquo;";
                            const label = link.label.replace("&laquo; ", "").replace(" &raquo;", "");
                            
                            return (
                                <Button
                                    key={i}
                                    variant={link.active ? 'default' : 'outline'}
                                    size={isTextLink ? "sm" : "icon"}
                                    className={isTextLink ? "px-3" : "h-8 w-8"}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url)}
                                >
                                    {isTextLink ? label : <span dangerouslySetInnerHTML={{ __html: link.label }} />}
                                </Button>
                            );
                        })}
                    </div>
                </div>
            )}

            <TimeEntryForm
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setEditingEntry(null);
                }}
                timeEntry={editingEntry || undefined}
                timesheetId={timesheetId}
                projects={projects}
            />

            {/* Delete Modal */}
            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setEntryToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
                itemName={entryToDelete ? `${entryToDelete.hours}h entry for ${entryToDelete.project.title}` : ''}
                entityName="time entry"
            />

            {/* Bulk Delete Modal */}
            <CrudDeleteModal
                isOpen={isBulkDeleteModalOpen}
                onClose={() => setIsBulkDeleteModalOpen(false)}
                onConfirm={handleBulkDeleteConfirm}
                itemName={`${selectedEntries.length} time entries`}
                entityName="time entries"
            />
        </div>
    );
}