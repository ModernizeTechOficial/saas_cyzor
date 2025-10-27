import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { toast } from '@/components/custom-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Plus, Clock, Calendar } from 'lucide-react';
import { PageTemplate } from '@/components/page-template';
import TimeEntryForm from '@/components/timesheets/TimeEntryForm';
import { useTranslation } from 'react-i18next';
import { hasPermission } from '@/utils/authorization';

interface DayEntry {
    date: string;
    entries: TimeEntry[];
    totalHours: number;
    billableHours: number;
}

interface TimeEntry {
    id: number;
    project: { title: string };
    task?: { title: string };
    hours: number;
    description?: string;
    is_billable: boolean;
}

interface Project {
    id: number;
    title: string;
    tasks?: any[];
}

interface Props {
    weekData: DayEntry[];
    projects: Project[];
    weekStart: string;
    weekEnd: string;
    timesheetId: number;
    permissions?: any;
}

export default function WeeklyView({ weekData, projects, weekStart, weekEnd, timesheetId, permissions }: Props) {
    const { t } = useTranslation();
    const { flash, auth } = usePage().props as any;
    const userPermissions = auth?.permissions || [];
    const [currentWeekStart, setCurrentWeekStart] = useState(new Date(weekStart));
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>('');

    // Show flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const navigateWeek = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentWeekStart);
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        setCurrentWeekStart(newDate);
        
        const weekStartStr = newDate.toISOString().split('T')[0];
        router.get(route('timesheets.weekly-view'), { week_start: weekStartStr }, { preserveState: true });
    };

    const goToCurrentWeek = () => {
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        setCurrentWeekStart(startOfWeek);
        const weekStartStr = startOfWeek.toISOString().split('T')[0];
        router.get(route('timesheets.weekly-view'), { week_start: weekStartStr }, { preserveState: true });
    };

    const addTimeEntry = (date: string) => {
        setSelectedDate(date);
        setIsFormOpen(true);
    };

    const getWeekTotal = () => weekData.reduce((sum, day) => sum + day.totalHours, 0);
    const getWeekBillable = () => weekData.reduce((sum, day) => sum + day.billableHours, 0);
    const getWeekEntries = () => weekData.reduce((sum, day) => sum + day.entries.length, 0);

    const formatWeekRange = () => {
        const start = new Date(weekStart);
        const end = new Date(weekEnd);
        return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    };

    const getDayName = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
    };

    const getDayDate = (dateStr: string) => {
        return new Date(dateStr).getDate();
    };

    const isToday = (dateStr: string) => {
        return new Date(dateStr).toDateString() === new Date().toDateString();
    };

    const isCurrentWeek = () => {
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        return startOfWeek.toDateString() === currentWeekStart.toDateString();
    };

    const pageActions: any[] = [];

    const breadcrumbs = [
        { title: t('Dashboard'), href: route('dashboard') },
        { title: t('Timesheets'), href: route('timesheets.index') },
        { title: t('Weekly View') }
    ];

    return (
        <PageTemplate 
            title={t('Weekly Time Tracking')} 
            actions={pageActions}
            breadcrumbs={breadcrumbs}
        >
            <Head title={`Weekly View - ${formatWeekRange()}`} />
            
            {/* Week Navigation */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => navigateWeek('prev')}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            
                            <div className="text-center">
                                <CardTitle className="text-xl">
                                    {formatWeekRange()}
                                    {isCurrentWeek() && <Badge className="ml-2">{t('Current Week')}</Badge>}
                                </CardTitle>
                            </div>
                            
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => navigateWeek('next')}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        
                        {!isCurrentWeek() && (
                            <Button variant="outline" onClick={goToCurrentWeek}>
                                {t('Current Week')}
                            </Button>
                        )}
                    </div>
                </CardHeader>
            </Card>

            {/* Week Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-600" />
                            <span className="text-sm font-medium text-blue-600">{t('Total Hours')}</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-900">
                            {getWeekTotal().toFixed(2)}h
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-green-600" />
                            <span className="text-sm font-medium text-green-600">{t('Billable Hours')}</span>
                        </div>
                        <div className="text-2xl font-bold text-green-900">
                            {getWeekBillable().toFixed(2)}h
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-purple-600">{t('Entries')}</span>
                        </div>
                        <div className="text-2xl font-bold text-purple-900">
                            {getWeekEntries()}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-orange-600">{t('Avg/Day')}</span>
                        </div>
                        <div className="text-2xl font-bold text-orange-900">
                            {(getWeekTotal() / 7).toFixed(1)}h
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Daily Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                {weekData.map((day) => (
                    <Card key={day.date} className={`${isToday(day.date) ? 'ring-2 ring-blue-500' : ''}`}>
                        <CardHeader className="pb-2">
                            <div className="text-center">
                                <div className="text-sm font-medium text-muted-foreground">
                                    {getDayName(day.date)}
                                </div>
                                <div className="text-lg font-bold">
                                    {getDayDate(day.date)}
                                    {isToday(day.date) && <Badge variant="secondary" className="ml-1 text-xs">{t('Today')}</Badge>}
                                </div>
                            </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-2">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {day.totalHours.toFixed(1)}h
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {day.billableHours.toFixed(1)}h {t('billable')}
                                </div>
                            </div>
                            
                            <div className="space-y-1">
                                {day.entries.slice(0, 3).map((entry, index) => (
                                    <div key={index} className="text-xs p-2 bg-gray-50 rounded">
                                        <div className="font-medium truncate">{entry.project.title}</div>
                                        <div className="text-muted-foreground">
                                            {entry.hours}h {entry.is_billable && '💰'}
                                        </div>
                                    </div>
                                ))}
                                
                                {day.entries.length > 3 && (
                                    <div className="text-xs text-center text-muted-foreground">
                                        +{day.entries.length - 3} {t('more')}
                                    </div>
                                )}
                            </div>
                            
                            {hasPermission(userPermissions, 'timesheet_create') && (
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="w-full"
                                    onClick={() => addTimeEntry(day.date)}
                                >
                                    <Plus className="h-3 w-3 mr-1" />
                                    {t('Add')}
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Empty State */}
            {getWeekEntries() === 0 && (
                <Card className="mt-6">
                    <CardContent className="p-8 text-center">
                        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">{t('No time entries this week')}</h3>
                        <p className="text-gray-500 mb-4">{t('Start tracking your time to see your weekly overview')}</p>
                        {hasPermission(userPermissions, 'timesheet_create') && (
                            <Button onClick={() => addTimeEntry(new Date().toISOString().split('T')[0])}>
                                <Plus className="h-4 w-4 mr-2" />
                                {t('Add Time Entry')}
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            <TimeEntryForm
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setSelectedDate('');
                }}
                timesheetId={timesheetId}
                projects={projects}
                selectedDate={selectedDate}
            />
        </PageTemplate>
    );
}