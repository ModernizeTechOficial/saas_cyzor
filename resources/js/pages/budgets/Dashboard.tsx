import React, { useState, useEffect } from 'react';
import { PageTemplate } from '@/components/page-template';
import BudgetOverview from '@/components/budgets/BudgetOverview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, Eye } from 'lucide-react';
import { router } from '@inertiajs/react';
import { formatCurrency } from '@/utils/currency';
import { useTranslation } from 'react-i18next';

interface BudgetDashboardProps {
    initialData?: any;
}

export default function BudgetDashboard({ initialData }: BudgetDashboardProps) {
    const { t } = useTranslation();
    const [dashboardData, setDashboardData] = useState<any>(initialData || null);
    const [loading, setLoading] = useState(!initialData);

    useEffect(() => {
        if (!initialData) {
            loadDashboardData();
        }
    }, [initialData]);

    const loadDashboardData = async () => {
        try {
            const response = await fetch(route('budget-dashboard.overview'));
            const data = await response.json();
            setDashboardData(data);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };



    const getAlertColor = (level: string) => {
        switch (level) {
            case 'critical': return 'bg-red-100 text-red-800';
            case 'warning': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-blue-100 text-blue-800';
        }
    };

    const breadcrumbs = [
        { title: t('Dashboard'), href: route('dashboard') },
        { title: t('Budget & Expenses') },
        { title: t('Budget Dashboard') }
    ];

    if (loading) {
        return (
            <PageTemplate 
                title={t('Budget Dashboard')}
                description={t('Overview of budget performance and expense tracking')}
                url="/budgets/dashboard"
                breadcrumbs={breadcrumbs}
            >
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">{t('Loading dashboard...')}</div>
                </div>
            </PageTemplate>
        );
    }

    return (
        <PageTemplate 
            title={t('Budget Dashboard')}
            description={t('Overview of budget performance and expense tracking')}
            url="/budgets/dashboard"
            breadcrumbs={breadcrumbs}
            noPadding
        >
            <div className="space-y-8">
                {/* Budget Overview */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-6">
                    <BudgetOverview summary={dashboardData?.summary} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Expenses */}
                    <Card className="lg:col-span-2 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-t-lg">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                                    <TrendingUp className="h-5 w-5" />
                                    {t('Recent Expenses')}
                                </CardTitle>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="border-green-200 text-green-700 hover:bg-green-50"
                                    onClick={() => router.get(route('expenses.index'))}
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    {t('View All')}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            {dashboardData?.recent_expenses && dashboardData.recent_expenses.length > 0 ? (
                                <div className="space-y-4">
                                    {dashboardData.recent_expenses.slice(0, 6).map((expense: any) => (
                                        <div key={expense.id || Math.random()} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900 dark:text-gray-100">{expense.title || t('Untitled Expense')}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {expense.project?.title || t('Unknown Project')} • {expense.submitter?.name || t('Unknown User')}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-lg text-gray-900 dark:text-gray-100">
                                                    {formatCurrency(expense.amount || 0)}
                                                </div>
                                                <Badge 
                                                    variant="secondary" 
                                                    className={
                                                        expense.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                        expense.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                    }
                                                >
                                                    {expense.status || 'pending'}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <TrendingUp className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <p className="text-lg font-medium">{t('No recent expenses')}</p>
                                    <p className="text-sm">{t('Expenses will appear here once submitted')}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Top Categories */}
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-t-lg">
                            <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
                                <AlertTriangle className="h-5 w-5" />
                                {t('Top Categories')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {dashboardData?.top_categories && dashboardData.top_categories.length > 0 ? (
                                <div className="space-y-4">
                                    {dashboardData.top_categories.slice(0, 5).map((category: any, index: number) => (
                                        <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                            <div 
                                                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md"
                                                style={{ backgroundColor: category.color || '#6B7280' }}
                                            >
                                                {(category.name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-gray-900 dark:text-gray-100">{category.name || t('Unknown')}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {formatCurrency(category.total_spent || 0)} of {formatCurrency(category.allocated_amount || 0)}
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                                                    <div 
                                                        className="h-2 rounded-full transition-all duration-300"
                                                        style={{ 
                                                            backgroundColor: category.color || '#6B7280',
                                                            width: `${Math.min(((category.total_spent || 0) / (category.allocated_amount || 1)) * 100, 100)}%`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertTriangle className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <p className="font-medium">{t('No categories')}</p>
                                    <p className="text-sm">{t('Categories will appear here')}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageTemplate>
    );
}