import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Calendar, Clock, DollarSign, Users, RefreshCw, FileText, Activity } from 'lucide-react';
import { PageTemplate } from '@/components/page-template';
import { formatCurrency } from '@/utils/currency';
import { useTranslation } from 'react-i18next';
import { hasPermission } from '@/utils/authorization';
import { usePage } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
}

interface Project {
    id: number;
    title: string;
}

interface Props {
    members: User[];
    projects: Project[];
    defaultFilters: {
        start_date: string;
        end_date: string;
        user_id: string;
        project_id: string;
    };
    defaultReportData: any;
    permissions?: any;
}

export default function TimesheetReports({ members, projects, defaultFilters, defaultReportData, permissions }: Props) {
    const { t } = useTranslation();
    const { auth } = usePage().props as any;
    const userPermissions = auth?.permissions || [];
    const [filters, setFilters] = useState(defaultFilters);
    const [reportData, setReportData] = useState<any>(defaultReportData);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateReport = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(route('timesheet-reports.generate'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify(filters)
            });
            const data = await response.json();
            setReportData(data);
        } catch (error) {
            console.error('Failed to generate report:', error);
        } finally {
            setIsLoading(false);
        }
    };





    const breadcrumbs = [
        { title: t('Dashboard'), href: route('dashboard') },
        { title: t('Timesheets'), href: route('timesheets.index') },
        { title: t('Reports') }
    ];

    return (
        <PageTemplate 
            title={t('Timesheet Reports')} 
            breadcrumbs={breadcrumbs}
            action={
                <Button 
                    variant="outline" 
                    onClick={() => window.location.href = route('customer-reports.index')}
                    className="flex items-center gap-2"
                >
                    <FileText className="h-4 w-4" />
                    Customer Report
                </Button>
            }
        >
            <Head title={t('Timesheet Reports')} />
            
            {/* Filters */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        {t('Report Filters')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>{t('Project')}</Label>
                            <Select 
                                value={filters.project_id} 
                                onValueChange={(value) => setFilters(prev => ({ ...prev, project_id: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('All Projects')}</SelectItem>
                                    {projects.map(project => (
                                        <SelectItem key={project.id} value={project.id.toString()}>
                                            {project.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>{t('Member')}</Label>
                            <Select 
                                value={filters.user_id} 
                                onValueChange={(value) => setFilters(prev => ({ ...prev, user_id: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('All Members')}</SelectItem>
                                    {members.map(member => (
                                        <SelectItem key={member.id} value={member.id.toString()}>
                                            {member.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>{t('Start Date')}</Label>
                            <Input
                                type="date"
                                value={filters.start_date}
                                onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t('End Date')}</Label>
                            <Input
                                type="date"
                                value={filters.end_date}
                                onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
                            />
                        </div>

                    </div>
                    
                    <div className="mt-4 flex items-center space-x-2">
                        <Button 
                            onClick={handleGenerateReport}
                            disabled={isLoading || !filters.start_date || !filters.end_date}
                            className="flex-1 md:flex-none"
                        >
                            {isLoading ? t('Generating...') : t('Generate Report')}
                        </Button>
                        <Button 
                            variant="outline"
                            onClick={() => {
                                setFilters(defaultFilters);
                                setReportData(defaultReportData);
                            }}
                            disabled={isLoading}
                            title="Reset to latest reports"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                    </CardContent>
                </Card>

            {/* Report Results */}
            {reportData && (
                <Card>
                    <CardHeader>
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                {t('Report Results')}
                                {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>}
                            </CardTitle>
                            {JSON.stringify(filters) === JSON.stringify(defaultFilters) && (
                                <p className="text-sm text-gray-500 mt-1">{t('Showing latest reports (Last 30 days)')}</p>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Summary Section */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold mb-4">{t('Summary')}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500 rounded-lg">
                                                <Clock className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-blue-600">{t('Total Hours')}</p>
                                                <p className="text-2xl font-bold text-blue-900">
                                                    {parseFloat(reportData.summary?.total_hours || 0).toFixed(1)}h
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-500 rounded-lg">
                                                <DollarSign className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-green-600">{t('Billable Hours')}</p>
                                                <p className="text-2xl font-bold text-green-900">
                                                    {parseFloat(reportData.summary?.billable_hours || 0).toFixed(1)}h
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-500 rounded-lg">
                                                <DollarSign className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-purple-600">{t('Total Amount')}</p>
                                                <p className="text-2xl font-bold text-purple-900">
                                                    {formatCurrency(reportData.summary?.total_amount || 0)}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-orange-500 rounded-lg">
                                                <Activity className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-orange-600">{t('Entries')}</p>
                                                <p className="text-2xl font-bold text-orange-900">
                                                    {reportData.summary?.entries_count || 0}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Projects Section */}
                        {reportData.projects && reportData.projects.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-lg font-semibold mb-4">Projects ({reportData.projects.length})</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {reportData.projects.map((item: any, index: number) => (
                                        <Card key={index} className="hover:shadow-md transition-shadow">
                                            <CardContent className="p-4">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                                        <BarChart3 className="h-4 w-4 text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h2 className="font-semibold text-gray-900">{item.project_name}</h2>
                                                        <Badge variant={item.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                                                            {item.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                
                                                <div className="mb-3">
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span>Progress</span>
                                                        <span>{item.progress}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div 
                                                            className="bg-blue-600 h-2 rounded-full transition-all" 
                                                            style={{ width: `${item.progress}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                                
                                                <div className="mb-3">
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span>Tasks</span>
                                                        <span>{item.tasks_completed}/{item.tasks_total}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div 
                                                            className="bg-green-600 h-2 rounded-full transition-all" 
                                                            style={{ width: `${item.task_progress}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600">Total Hours:</span>
                                                        <Badge variant="secondary">{parseFloat(item.total_hours).toFixed(1)}h</Badge>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600">Billable Hours:</span>
                                                        <Badge variant="default" className="bg-green-100 text-green-800">
                                                            {parseFloat(item.billable_hours).toFixed(1)}h
                                                        </Badge>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600">Total Amount:</span>
                                                        <span className="font-semibold text-gray-900">
                                                            {formatCurrency(item.total_amount)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Members Section */}
                        {reportData.members && reportData.members.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold mb-4">Team Members ({reportData.members.length})</h2>
                                <div className="space-y-6">
                                    {reportData.members.map((member: any, index: number) => (
                                        <Card key={index} className="hover:shadow-md transition-shadow">
                                            <CardContent className="p-6">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                                        <Users className="h-5 w-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <h2 className="font-semibold text-lg text-gray-900">{member.member_name}</h2>
                                                        <p className="text-sm text-gray-600">
                                                            {parseFloat(member.total_hours).toFixed(1)}h total • 
                                                            {formatCurrency(member.total_amount)} earned
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-4">
                                                    <h2 className="font-medium text-gray-900">Projects & Tasks</h2>
                                                    {member.projects.map((project: any, pIndex: number) => (
                                                        <div key={pIndex} className="border rounded-lg p-4 bg-gray-50">
                                                            <div className="flex justify-between items-start mb-3">
                                                                <h2 className="font-medium text-gray-900">{project.project_name}</h2>
                                                                <div className="text-right">
                                                                    <div className="text-sm font-medium">{parseFloat(project.hours).toFixed(1)}h</div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {parseFloat(project.billable_hours).toFixed(1)}h billable
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                            {project.tasks.length > 0 && (
                                                                <div className="mb-3">
                                                                    <h2 className="text-sm font-medium text-gray-700 mb-2">Tasks ({project.tasks.length})</h2>
                                                                    <div className="space-y-1">
                                                                        {project.tasks.slice(0, 3).map((task: any, tIndex: number) => (
                                                                            <div key={tIndex} className="flex justify-between items-center text-sm">
                                                                                <span className="text-gray-600">{task.title}</span>
                                                                                <Badge variant={task.status === 'Done' ? 'default' : 'secondary'} className="text-xs">
                                                                                    {task.status}
                                                                                </Badge>
                                                                            </div>
                                                                        ))}
                                                                        {project.tasks.length > 3 && (
                                                                            <div className="text-xs text-gray-500">+{project.tasks.length - 3} more tasks</div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            
                                                            {project.entries.length > 0 && (
                                                                <div>
                                                                    <h2 className="text-sm font-medium text-gray-700 mb-2">Recent Entries</h2>
                                                                    <div className="space-y-1">
                                                                        {project.entries.slice(0, 3).map((entry: any, eIndex: number) => (
                                                                            <div key={eIndex} className="flex justify-between items-center text-sm">
                                                                                <div>
                                                                                    <span className="text-gray-600">{new Date(entry.date).toLocaleDateString()}</span>
                                                                                    {entry.description && (
                                                                                        <span className="text-gray-500 ml-2">• {entry.description.substring(0, 30)}...</span>
                                                                                    )}
                                                                                </div>
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="font-medium">{parseFloat(entry.hours).toFixed(1)}h</span>
                                                                                    {entry.is_billable && (
                                                                                        <Badge variant="outline" className="text-xs">Billable</Badge>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                        {project.entries.length > 3 && (
                                                                            <div className="text-xs text-gray-500">+{project.entries.length - 3} more entries</div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {!reportData && (
                <Card>
                    <CardContent className="p-8 text-center">
                        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No timesheet data found for the selected criteria</p>
                        <p className="text-sm text-gray-400 mt-2">Try adjusting your date range or filters</p>
                    </CardContent>
                </Card>
            )}
        </PageTemplate>
    );
}