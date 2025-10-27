import React, { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Bug, MessageSquare, Paperclip, X, Send, Trash2, Edit, Download, MoreHorizontal, File, Image, FileText, Upload } from 'lucide-react';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import MediaPicker from '@/components/MediaPicker';
import { useTranslation } from 'react-i18next';

interface BugModalProps {
    bug?: any;
    projects: Array<{ id: number; title: string; milestones?: any[] }>;
    statuses: Array<{ id: number; name: string; color: string }>;
    members: Array<{ id: number; name: string }>;
    onClose: () => void;
    permissions?: any;
}

export function BugModal({ bug, projects, statuses, members, onClose, permissions }: BugModalProps) {
    const { t } = useTranslation();
    const [bugPermissions, setBugPermissions] = useState(permissions);
    const [activeTab, setActiveTab] = useState('details');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [projectMembers, setProjectMembers] = useState<Array<{ id: number; name: string; email: string }>>([]);
    const [projectMilestones, setProjectMilestones] = useState<Array<{ id: number; title: string; status: string }>>([]);
    const [loadingProjectData, setLoadingProjectData] = useState(false);
    const [bugData, setBugData] = useState(bug);
    const [loadingBug, setLoadingBug] = useState(false);
    const [editingComment, setEditingComment] = useState<number | null>(null);
    const [editCommentText, setEditCommentText] = useState('');
    const [commentToDelete, setCommentToDelete] = useState<any>(null);
    const [isDeleteCommentModalOpen, setIsDeleteCommentModalOpen] = useState(false);
    const [attachmentToDelete, setAttachmentToDelete] = useState<any>(null);
    const [isDeleteAttachmentModalOpen, setIsDeleteAttachmentModalOpen] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState('');
    
    const { data, setData, post, put, processing, errors } = useForm({
        project_id: bug?.project_id?.toString() || '',
        milestone_id: bug?.milestone_id?.toString() || 'none',
        title: bug?.title || '',
        description: bug?.description || '',
        priority: bug?.priority || 'medium',
        severity: bug?.severity || 'major',
        steps_to_reproduce: bug?.steps_to_reproduce || '',
        expected_behavior: bug?.expected_behavior || '',
        actual_behavior: bug?.actual_behavior || '',
        environment: bug?.environment || '',
        assigned_to: bug?.assigned_to?.id?.toString() || 'none',
        start_date: bug?.start_date || '',
        end_date: bug?.end_date || '',
        resolution_notes: bug?.resolution_notes || ''
    });

    const { data: commentData, setData: setCommentData, post: postComment, reset: resetComment } = useForm({
        comment: ''
    });

    const selectedProject = projects.find(p => p.id.toString() === data.project_id);

    // Fetch project data when project changes
    useEffect(() => {
        if (data.project_id) {
            setLoadingProjectData(true);
            axios.get(route('api.bugs.project-data') + `?project_id=${data.project_id}`)
                .then(response => {
                    if (response.data.success) {
                        setProjectMembers(response.data.members || []);
                        setProjectMilestones(response.data.milestones || []);
                    }
                })
                .catch(error => {
                    console.error('Error fetching project data:', error);
                    setProjectMembers([]);
                    setProjectMilestones([]);
                })
                .finally(() => {
                    setLoadingProjectData(false);
                });
        } else {
            setProjectMembers([]);
            setProjectMilestones([]);
        }
    }, [data.project_id]);

    // Reset assigned_to when project changes
    useEffect(() => {
        if (data.project_id && !bug) {
            setData('assigned_to', 'none');
        }
    }, [data.project_id]);

    // Fetch bug data when bug prop changes
    useEffect(() => {
        if (bug?.id) {
            setLoadingBug(true);
            axios.get(route('bugs.show', bug.id))
                .then(response => {
                    setBugData(response.data.bug);
                    setBugPermissions(response.data.permissions);
                })
                .catch(error => {
                    console.error('Error fetching bug data:', error);
                    setBugData(bug);
                })
                .finally(() => {
                    setLoadingBug(false);
                });
        } else {
            setBugData(bug);
        }
    }, [bug]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Prepare data for submission
        const submitData = {
            ...data,
            milestone_id: data.milestone_id === 'none' ? null : data.milestone_id,
            assigned_to: data.assigned_to === 'none' ? null : data.assigned_to
        };
        
        if (bug) {
            put(route('bugs.update', bug.id), {
                onSuccess: () => onClose(),
                onError: (errors) => {
                    console.error('Update error:', errors);
                }
            });
        } else {
            // For new bugs, we need to set the data first
            Object.keys(submitData).forEach(key => {
                setData(key as any, submitData[key as keyof typeof submitData]);
            });
            
            post(route('bugs.store'), {
                onSuccess: () => onClose(),
                onError: (errors) => {
                    console.error('Create error:', errors);
                }
            });
        }
    };

    const handleComment = (e: React.FormEvent) => {
        e.preventDefault();
        postComment(route('bug-comments.store', bugData.id), {
            onSuccess: () => {
                resetComment();
                // Refresh bug data
                if (bugData?.id) {
                    axios.get(route('bugs.show', bugData.id))
                        .then(response => {
                            setBugData(response.data.bug);
                        })
                        .catch(error => {
                            console.error('Error refreshing bug data:', error);
                        });
                }
            }
        });
    };

    const getPriorityColor = (priority: string) => {
        const colors = {
            low: 'bg-blue-100 text-blue-800',
            medium: 'bg-yellow-100 text-yellow-800',
            high: 'bg-orange-100 text-orange-800',
            critical: 'bg-red-100 text-red-800'
        };
        return colors[priority as keyof typeof colors] || colors.medium;
    };

    const getSeverityColor = (severity: string) => {
        const colors = {
            minor: 'bg-green-100 text-green-800',
            major: 'bg-yellow-100 text-yellow-800',
            critical: 'bg-orange-100 text-orange-800',
            blocker: 'bg-red-100 text-red-800'
        };
        return colors[severity as keyof typeof colors] || colors.major;
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Bug className="h-5 w-5 text-red-500" />
                        {bug ? `${t('Edit Bug')}: ${bug.title}` : t('Report New Bug')}
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="details">{t('Details')}</TabsTrigger>
                        <TabsTrigger value="comments" disabled={!bugData}>{t('Comments')} {bugData?.comments?.length ? `(${bugData.comments.length})` : ''}</TabsTrigger>
                        <TabsTrigger value="attachments" disabled={!bugData}>{t('Attachments')} {bugData?.attachments?.length ? `(${bugData.attachments.length})` : ''}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="project_id">Project *</Label>
                                    <Select value={data.project_id} onValueChange={(value) => setData('project_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select project" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[9999]">
                                            {projects.map(project => (
                                                <SelectItem key={project.id} value={project.id.toString()}>
                                                    {project.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.project_id && <p className="text-red-500 text-sm mt-1">{errors.project_id}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="milestone_id">Milestone</Label>
                                    <Select value={data.milestone_id} onValueChange={(value) => setData('milestone_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={loadingProjectData ? "Loading..." : "Select milestone"} />
                                        </SelectTrigger>
                                        <SelectContent className="z-[9999]">
                                            <SelectItem value="none">No milestone</SelectItem>
                                            {projectMilestones.map(milestone => (
                                                <SelectItem key={milestone.id} value={milestone.id.toString()}>
                                                    {milestone.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.milestone_id && <p className="text-red-500 text-sm mt-1">{errors.milestone_id}</p>}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="title">Bug Title *</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Brief description of the bug"
                                    required
                                />
                                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Detailed description of the bug"
                                    rows={3}
                                />
                                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="priority">Priority *</Label>
                                    <Select value={data.priority} onValueChange={(value) => setData('priority', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="z-[9999]">
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="critical">Critical</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.priority && <p className="text-red-500 text-sm mt-1">{errors.priority}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="severity">Severity *</Label>
                                    <Select value={data.severity} onValueChange={(value) => setData('severity', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="z-[9999]">
                                            <SelectItem value="minor">Minor</SelectItem>
                                            <SelectItem value="major">Major</SelectItem>
                                            <SelectItem value="critical">Critical</SelectItem>
                                            <SelectItem value="blocker">Blocker</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.severity && <p className="text-red-500 text-sm mt-1">{errors.severity}</p>}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="steps_to_reproduce">Steps to Reproduce</Label>
                                <Textarea
                                    id="steps_to_reproduce"
                                    value={data.steps_to_reproduce}
                                    onChange={(e) => setData('steps_to_reproduce', e.target.value)}
                                    placeholder="1. Step one&#10;2. Step two&#10;3. Step three"
                                    rows={4}
                                />
                                {errors.steps_to_reproduce && <p className="text-red-500 text-sm mt-1">{errors.steps_to_reproduce}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="expected_behavior">Expected Behavior</Label>
                                    <Textarea
                                        id="expected_behavior"
                                        value={data.expected_behavior}
                                        onChange={(e) => setData('expected_behavior', e.target.value)}
                                        placeholder="What should happen"
                                        rows={3}
                                    />
                                    {errors.expected_behavior && <p className="text-red-500 text-sm mt-1">{errors.expected_behavior}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="actual_behavior">Actual Behavior</Label>
                                    <Textarea
                                        id="actual_behavior"
                                        value={data.actual_behavior}
                                        onChange={(e) => setData('actual_behavior', e.target.value)}
                                        placeholder="What actually happens"
                                        rows={3}
                                    />
                                    {errors.actual_behavior && <p className="text-red-500 text-sm mt-1">{errors.actual_behavior}</p>}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="environment">Environment</Label>
                                <Input
                                    id="environment"
                                    value={data.environment}
                                    onChange={(e) => setData('environment', e.target.value)}
                                    placeholder="Browser, OS, device details"
                                />
                                {errors.environment && <p className="text-red-500 text-sm mt-1">{errors.environment}</p>}
                            </div>

                            {bugPermissions?.assign_users && (
                                <div>
                                    <Label htmlFor="assigned_to">Assign To</Label>
                                    <Select 
                                        value={data.assigned_to} 
                                        onValueChange={(value) => setData('assigned_to', value)}
                                        disabled={!data.project_id || loadingProjectData}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={
                                                !data.project_id ? "Select project first" : 
                                                loadingProjectData ? "Loading..." : 
                                                "Select assignee"
                                            } />
                                        </SelectTrigger>
                                        <SelectContent className="z-[9999]">
                                            <SelectItem value="none">Unassigned</SelectItem>
                                            {projectMembers.map(member => (
                                                <SelectItem key={member.id} value={member.id.toString()}>
                                                    {member.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.assigned_to && <p className="text-red-500 text-sm mt-1">{errors.assigned_to}</p>}
                                    {!data.project_id && !errors.assigned_to && (
                                        <p className="text-sm text-gray-500 mt-1">Please select a project first to see available assignees</p>
                                    )}
                                </div>
                            )}

                            {/* Display form errors */}
                            {Object.keys(errors).length > 0 && (
                                <div className="rounded-md bg-red-50 p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                                            <div className="mt-2 text-sm text-red-700">
                                                {Object.entries(errors).map(([key, error]) => (
                                                    <p key={key}>{error}</p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between pt-4">
                                <div>
                                    {bug && (
                                        <div className="flex gap-2">
                                            <Badge className={getPriorityColor(data.priority)} variant="secondary">
                                                {data.priority}
                                            </Badge>
                                            <Badge className={getSeverityColor(data.severity)} variant="secondary">
                                                {data.severity}
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" onClick={onClose}>
                                        Cancel
                                    </Button>
                                    {(bug ? bugPermissions?.update : bugPermissions?.create) && (
                                        <Button type="submit" disabled={processing || !data.project_id || !data.title}>
                                            {processing ? 'Saving...' : bug ? 'Update Bug' : 'Report Bug'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </TabsContent>

                    <TabsContent value="comments" className="space-y-4">
                        {bugData ? (
                            <>
                                {loadingBug ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                                        <p className="text-gray-500 mt-2">Loading comments...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-3 max-h-96 overflow-y-auto">
                                            {bugData.comments?.length > 0 ? (
                                                bugData.comments.map((comment: any) => (
                                                    <div key={comment.id} className="group flex gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <span className="text-blue-600 font-semibold text-sm">
                                                                {comment.user.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium text-sm text-gray-900">{comment.user.name}</span>
                                                                    <span className="text-xs text-gray-500">
                                                                        {new Date(comment.created_at).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    {comment.can_update && (
                                                                        <Button 
                                                                            variant="ghost" 
                                                                            size="sm"
                                                                            onClick={() => {
                                                                                setEditingComment(comment.id);
                                                                                setEditCommentText(comment.comment);
                                                                            }}
                                                                            className="h-7 w-7 p-0 text-gray-400 hover:text-blue-600"
                                                                        >
                                                                            <Edit className="h-3 w-3" />
                                                                        </Button>
                                                                    )}
                                                                    {comment.can_delete && (
                                                                        <Button 
                                                                            variant="ghost" 
                                                                            size="sm"
                                                                            onClick={() => {
                                                                                setCommentToDelete(comment);
                                                                                setIsDeleteCommentModalOpen(true);
                                                                            }}
                                                                            className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {editingComment === comment.id ? (
                                                                <div className="space-y-2 mt-2">
                                                                    <Textarea
                                                                        value={editCommentText}
                                                                        onChange={(e) => setEditCommentText(e.target.value)}
                                                                        rows={2}
                                                                        className="text-sm"
                                                                    />
                                                                    <div className="flex gap-2">
                                                                        <Button 
                                                                            size="sm"
                                                                            onClick={() => {
                                                                                router.put(route('bug-comments.update', comment.id), {
                                                                                    comment: editCommentText
                                                                                }, {
                                                                                    onSuccess: () => {
                                                                                        setEditingComment(null);
                                                                                        axios.get(route('bugs.show', bugData.id))
                                                                                            .then(response => setBugData(response.data.bug))
                                                                                            .catch(console.error);
                                                                                    }
                                                                                });
                                                                            }}
                                                                            className="h-7 px-3 text-xs"
                                                                        >
                                                                            Save
                                                                        </Button>
                                                                        <Button 
                                                                            size="sm" 
                                                                            variant="outline"
                                                                            onClick={() => setEditingComment(null)}
                                                                            className="h-7 px-3 text-xs"
                                                                        >
                                                                            Cancel
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{comment.comment}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8 text-gray-500">
                                                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                                    <p>No comments yet</p>
                                                </div>
                                            )}
                                        </div>

                                        <form onSubmit={handleComment} className="flex gap-2">
                                            <Textarea
                                                value={commentData.comment}
                                                onChange={(e) => setCommentData('comment', e.target.value)}
                                                placeholder="Add a comment..."
                                                rows={2}
                                                className="flex-1"
                                            />
                                            <Button type="submit" disabled={!commentData.comment.trim()}>
                                                <Send className="h-4 w-4" />
                                            </Button>
                                        </form>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                <p>Save the bug first to add comments</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="attachments">
                        {bugData ? (
                            <div className="space-y-4">
                                {bugData.attachments?.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {bugData.attachments.map((attachment: any) => {
                                            const getFileIcon = (mimeType: string) => {
                                                if (mimeType?.startsWith('image/')) return Image;
                                                if (mimeType?.includes('pdf') || mimeType?.includes('document')) return FileText;
                                                return File;
                                            };
                                            
                                            const FileIcon = getFileIcon(attachment.media_item?.mime_type || '');
                                            const isImage = attachment.media_item?.mime_type?.startsWith('image/') || 
                                                           attachment.media_item?.name?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
                                            const imageUrl = attachment.media_item?.url || 
                                                            (attachment.media_item?.path ? `/storage/${attachment.media_item.path}` : null);
                                            
                                            return (
                                                <div key={attachment.id} className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-200">
                                                    <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative">
                                                        {isImage && imageUrl ? (
                                                            <img
                                                                src={imageUrl}
                                                                alt={attachment.media_item?.name || 'Attachment'}
                                                                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = 'none';
                                                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                                }}
                                                                onClick={() => window.open(imageUrl, '_blank')}
                                                            />
                                                        ) : null}
                                                        <div className={`${isImage && imageUrl ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                                                            <FileIcon className="h-16 w-16 text-gray-400" />
                                                        </div>
                                                    </div>
                                                    
                                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="secondary" size="sm" className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-sm">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="z-[9999]">
                                                                <DropdownMenuItem onClick={() => window.open(route('bug-attachments.download', attachment.id), '_blank')}>
                                                                    <Download className="h-4 w-4 mr-2" />
                                                                    Download
                                                                </DropdownMenuItem>
                                                                {attachment.can_delete && (
                                                                    <DropdownMenuItem 
                                                                        onClick={() => {
                                                                            setAttachmentToDelete(attachment);
                                                                            setIsDeleteAttachmentModalOpen(true);
                                                                        }}
                                                                        className="text-red-600"
                                                                    >
                                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                                        Remove
                                                                    </DropdownMenuItem>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                    
                                                    <div className="p-3 bg-white border-t border-gray-100">
                                                        <p className="text-sm font-medium text-gray-900 truncate mb-1" title={attachment.media_item?.name}>
                                                            {attachment.media_item?.name}
                                                        </p>
                                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                                            <span>{attachment.media_item?.mime_type}</span>
                                                            <span>{attachment.media_item?.size ? `${Math.round(attachment.media_item.size / 1024)}KB` : ''}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                
                                {bugData.attachments?.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <Paperclip className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                        <p>No attachments yet</p>
                                    </div>
                                )}
                                

                                <MediaPicker
                                    label="Add from Media Library"
                                    value={selectedMedia}
                                    onChange={(url: string, mediaIds?: number[]) => {
                                        setSelectedMedia(url);
                                        if (mediaIds && mediaIds.length > 0) {
                                            router.post(route('bug-attachments.store', bugData.id), {
                                                media_item_ids: mediaIds
                                            }, {
                                                onSuccess: () => {
                                                    axios.get(route('bugs.show', bugData.id))
                                                        .then(response => setBugData(response.data.bug))
                                                        .catch(console.error);
                                                    setSelectedMedia('');
                                                }
                                            });
                                        }
                                    }}
                                    placeholder="Select from media library..."
                                    showPreview={true}
                                />
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Paperclip className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                <p>Save the bug first to add attachments</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
            
            {/* Delete Bug Modal */}
            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => {
                    if (bug) {
                        router.delete(route('bugs.destroy', bug.id), {
                            onSuccess: () => {
                                setIsDeleteModalOpen(false);
                                onClose();
                            },
                            onError: () => {
                                setIsDeleteModalOpen(false);
                            }
                        });
                    }
                }}
                itemName={bug?.title || ''}
                entityName="bug"
            />
            
            {/* Delete Comment Modal */}
            <CrudDeleteModal
                isOpen={isDeleteCommentModalOpen}
                onClose={() => {
                    setIsDeleteCommentModalOpen(false);
                    setCommentToDelete(null);
                }}
                onConfirm={() => {
                    if (commentToDelete) {
                        router.delete(route('bug-comments.destroy', commentToDelete.id), {
                            onSuccess: () => {
                                setIsDeleteCommentModalOpen(false);
                                setCommentToDelete(null);
                                axios.get(route('bugs.show', bugData.id))
                                    .then(response => setBugData(response.data.bug))
                                    .catch(console.error);
                            },
                            onError: () => {
                                setIsDeleteCommentModalOpen(false);
                                setCommentToDelete(null);
                            }
                        });
                    }
                }}
                itemName="comment"
                entityName="comment"
            />
            
            {/* Delete Attachment Modal */}
            <CrudDeleteModal
                isOpen={isDeleteAttachmentModalOpen}
                onClose={() => {
                    setIsDeleteAttachmentModalOpen(false);
                    setAttachmentToDelete(null);
                }}
                onConfirm={() => {
                    if (attachmentToDelete) {
                        router.delete(route('bug-attachments.destroy', attachmentToDelete.id), {
                            onSuccess: () => {
                                setIsDeleteAttachmentModalOpen(false);
                                setAttachmentToDelete(null);
                                axios.get(route('bugs.show', bugData.id))
                                    .then(response => setBugData(response.data.bug))
                                    .catch(console.error);
                            },
                            onError: () => {
                                setIsDeleteAttachmentModalOpen(false);
                                setAttachmentToDelete(null);
                            }
                        });
                    }
                }}
                itemName={attachmentToDelete?.media_item?.name || "attachment"}
                entityName="attachment"
            />
        </Dialog>
    );
}