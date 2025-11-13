import { useState, useEffect, useRef } from 'react';
import { AddDeliverable } from './AddDeliverable';
import { TaskDetailModal } from './TaskDetailModal';
import { TaskRejectModal } from './TaskRejectModal';
import { useTasks } from '../hooks/useTasks';
import { Task, DeliverableFile } from '../services/taskService';
import { fileService, downloadFileHelper, previewFileHelper } from '../services/fileService';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle,
  AlertCircle,
  FileText,
  DollarSign,
  Eye,
  MessageSquare,
  Edit,
  Trash2,
  XCircle,
  X,
  RefreshCw,
  Loader2,
  Download,
  Paperclip,
  ExternalLink,
  File,
  Star,
  TrendingUp,
  Activity,
  Award,
  BookOpen,
  GraduationCap,
  Target,
  Save,
  Receipt,
  CreditCard
} from 'lucide-react';
import { toast } from "sonner";

interface TaskManagementProps {
  userRole: 'student' | 'admin';
}

export function TaskManagement({ userRole }: TaskManagementProps) {
  const [showAddDeliverable, setShowAddDeliverable] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [assignedAdminFilter, setAssignedAdminFilter] = useState('all');
  const [studentFilter, setStudentFilter] = useState('all');
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Edit and Delete modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFileDeleteModal, setShowFileDeleteModal] = useState(false);
  const [showFileStagingModal, setShowFileStagingModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [billingTask, setBillingTask] = useState<Task | null>(null);
  const [deletingFile, setDeletingFile] = useState<{
    taskId: string;
    attachmentId: string;
    fileName: string;
    context: string;
    type: 'task' | 'deliverable';
    deliverableId?: string;
  } | null>(null);
  const [stagingFile, setStagingFile] = useState<{
    fileId: string;
    fileName: string;
    context: string;
  } | null>(null);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    subject: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    budget: 0,
    requirements: '',
    academicLevel: '',
    pages: 0,
    citations: '',
    type: ''
  });

  // Bill form state
  const [billForm, setBillForm] = useState({
    amount: 0,
    dueDate: '',
    description: '',
    notes: 'Payment terms and conditions'
  });

  // File handling state for edit modal
  const [editFiles, setEditFiles] = useState<File[]>([]);
  const [editExistingFiles, setEditExistingFiles] = useState<any[]>([]);
  const [filesToRemove, setFilesToRemove] = useState<string[]>([]);
  const [updateLoading, setUpdateLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use the custom hook for task management
  const {
    tasks,
    loading,
    error,
    fetchTasks,
    refreshTasks,
    updateTask,
    updateTaskStatus,
    updateAdminTaskStatus,
    deleteTask,
    assignTask,
  } = useTasks({
    searchTerm,
    statusFilter,
    userRole,
    priorityFilter,
    typeFilter,
    assignedAdminFilter,
    studentFilter,
  });

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openMenuId]);



  const handleAddDeliverable = (task: Task) => {
    setSelectedTask(task);
    setShowAddDeliverable(true);
  };

  const handleDeliverableAdded = async (newDeliverable: any) => {
    // Refresh tasks to get updated data including the new deliverable
    await refreshTasks();
    
    toast.success('Deliverable added successfully', {
      description: `"${newDeliverable.title}" has been added to the task.`,
    });
  };

  // Handle edit task
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setEditForm({
      title: task.title || '',
      description: task.description || '',
      subject: task.subject || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      priority: task.priority || 'medium',
      budget: task.budget || 0,
      requirements: task.requirements || '',
      academicLevel: task.academicLevel || '',
      pages: task.pages || 0,
      citations: task.citations || '',
      type: task.type || ''
    });
    
    // Initialize file states
    setEditFiles([]);
    setEditExistingFiles(task.attachments || []);
    setFilesToRemove([]);
    
    setShowEditModal(true);
    setOpenMenuId(null);
  };

  // File handling functions for edit modal
  const handleEditFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setEditFiles(prev => [...prev, ...newFiles]);
      
      // Clear the input value so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast.success(`${newFiles.length} file(s) added`);
    }
  };

  const handleRemoveEditFile = (index: number) => {
    setEditFiles(prev => prev.filter((_, i) => i !== index));
    toast.success('File removed');
  };

  const handleRemoveExistingFile = (fileId: string, fileName: string) => {
    // Show professional confirmation modal for staging file removal
    setStagingFile({
      fileId,
      fileName,
      context: 'task'
    });
    setShowFileStagingModal(true);
  };

  // Confirm file staging for removal
  const handleConfirmFileStaging = () => {
    if (!stagingFile) return;

    setFilesToRemove(prev => [...prev, stagingFile.fileId]);
    setEditExistingFiles(prev => prev.filter(f => f.id !== stagingFile.fileId));
    setShowFileStagingModal(false);
    setStagingFile(null);
    
    toast.success(`${stagingFile.fileName} will be removed when you save`);
  };

  // Update task
  const handleUpdateTask = async () => {
    if (!editingTask) return;

    try {
      setUpdateLoading(true);

      // Get auth token from localStorage
      const token = localStorage.getItem('gradhelper_token');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

      let response;

      // Use FormData when files are present, JSON when no files (like PostTask)
      if (editFiles.length > 0 || filesToRemove.length > 0) {
        const formData = new FormData();
        
        // Add all basic form fields
        formData.append('title', editForm.title);
        formData.append('description', editForm.description);
        formData.append('subject', editForm.subject);
        formData.append('dueDate', editForm.dueDate ? new Date(editForm.dueDate).toISOString() : editingTask.dueDate);
        formData.append('priority', editForm.priority);
        formData.append('budget', editForm.budget.toString());
        
        if (editForm.requirements) formData.append('requirements', editForm.requirements);
        if (editForm.academicLevel) formData.append('academicLevel', editForm.academicLevel);
        if (editForm.pages) formData.append('pages', editForm.pages.toString());
        if (editForm.citations) formData.append('citations', editForm.citations);
        if (editForm.type) formData.append('type', editForm.type);
        
        // Add remaining existing files (not removed) as JSON
        const remainingFiles = editExistingFiles.filter(f => !filesToRemove.includes(f.id));
        if (remainingFiles.length > 0) {
          formData.append('existingAttachments', JSON.stringify(remainingFiles));
        }
        
        // Add files to remove as JSON
        if (filesToRemove.length > 0) {
          formData.append('removeAttachments', JSON.stringify(filesToRemove));
        }
        
        // Add new files - this matches the API expectation from PostTask
        editFiles.forEach((file) => {
          formData.append('attachments', file);
        });
        
        console.log('Updating task with FormData (files present)');
        
        response = await fetch(`${API_BASE_URL}/tasks/${editingTask.id}/`, {
          method: 'PUT',
          headers: {
            ...(token && { 'Authorization': `Bearer ${token}` }),
            // Don't set Content-Type for FormData - browser sets it with boundary
          },
          body: formData,
        });
      } else {
        // No file changes, use JSON (like PostTask)
        const taskData = {
          ...editForm,
          dueDate: editForm.dueDate ? new Date(editForm.dueDate).toISOString() : editingTask.dueDate,
          updatedAt: new Date().toISOString()
        };
        
        console.log('Updating task with JSON (no file changes)');
        console.log('Task data:', taskData);
        
        response = await fetch(`${API_BASE_URL}/tasks/${editingTask.id}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
          body: JSON.stringify(taskData),
        });
      }

      // Check if response is JSON or HTML (like PostTask error handling)
      let result;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        // Server returned HTML (likely an error page)
        const htmlText = await response.text();
        console.error('Server returned HTML instead of JSON:', htmlText);
        result = { 
          error: 'Server error - received HTML response instead of JSON',
          html_content: htmlText.substring(0, 200) + '...'
        };
      }
      
      console.log('Update API Response:', response.status, result);

      if (response.ok) {
        // Update local state with the response data or optimistically update
        const updatedTask = result.data || {
          ...editingTask,
          ...editForm,
          dueDate: editForm.dueDate ? new Date(editForm.dueDate).toISOString() : editingTask.dueDate,
          updatedAt: new Date().toISOString(),
          // Update attachments if file changes were made
          ...(editFiles.length > 0 || filesToRemove.length > 0 ? {
            attachments: [
              ...editExistingFiles.filter(f => !filesToRemove.includes(f.id)),
              ...editFiles.map((file, index) => ({
                id: `new_${Date.now()}_${index}`,
                name: file.name,
                size: formatFileSize(file.size),
                type: file.type,
                url: URL.createObjectURL(file),
                uploadedAt: new Date().toISOString()
              }))
            ]
          } : {})
        };

        // Refresh tasks to get updated data from server
        await refreshTasks();
        
        setShowEditModal(false);
        setEditingTask(null);
        setEditFiles([]);
        setEditExistingFiles([]);
        setFilesToRemove([]);
        
        toast.success('Task updated successfully', {
          description: `Updated task${editFiles.length > 0 ? ` with ${editFiles.length} new files` : ''}${filesToRemove.length > 0 ? ` and removed ${filesToRemove.length} files` : ''}`
        });
      } else {
        // Handle API errors with detailed information (like PostTask)
        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          body: result
        });
        
        let errorMessage = 'Failed to update task';
        
        if (result.detail) {
          errorMessage = result.detail;
        } else if (result.message) {
          errorMessage = result.message;
        } else if (result.error) {
          errorMessage = result.error;
        } else if (typeof result === 'object') {
          // Handle field-specific errors
          const fieldErrors = Object.entries(result)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('; ');
          if (fieldErrors) errorMessage = fieldErrors;
        }
        
        toast.error(`Update failed (${response.status})`, {
          description: errorMessage
        });
      }
      
    } catch (error) {
      console.error('Task update error:', error);
      toast.error('Network error', {
        description: 'Unable to connect to the server. Please check your connection and try again.'
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handle delete task
  const handleDeleteTask = (task: Task) => {
    setDeletingTask(task);
    setShowDeleteModal(true);
    setOpenMenuId(null);
  };

  // Confirm delete task
  const handleConfirmDelete = async () => {
    if (!deletingTask) return;

    try {
      await deleteTask(deletingTask.id);
      
      setShowDeleteModal(false);
      setDeletingTask(null);
      
      toast.success('Task deleted successfully');
      
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleViewDetails = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
    setOpenMenuId(null);
  };

  const handleRejectTask = (task: Task) => {
    setSelectedTask(task);
    setShowRejectModal(true);
    setOpenMenuId(null);
  };

  const handleTaskUpdate = (updatedTask: any) => {
    // The useTasks hook will handle the state update
    refreshTasks();
  };

  const handleTaskRejection = async (taskId: string, reason: string, feedback: string) => {
    try {
      if (userRole === 'admin') {
        await updateAdminTaskStatus(taskId, 'rejected', reason, feedback);
      } else {
        await updateTaskStatus(taskId, 'rejected', reason, feedback);
      }
      
      // Close modals
      setShowRejectModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error rejecting task:', error);
    }
  };

  const handleMenuToggle = (taskId: string) => {
    setOpenMenuId(openMenuId === taskId ? null : taskId);
  };

  const handleContactStudent = (task: Task) => {
    toast.info('Opening messaging system...', {
      description: `Starting conversation with ${task.student}`
    });
    setOpenMenuId(null);
  };

  const handleContactAdmin = (task: Task) => {
    window.open('mailto:thegradhelper@outlook.com?subject=Task%20Support%20Request&body=Hello%20TheGradHelper%20Team,%0D%0A%0D%0AI%20need%20assistance%20with%20my%20task:%0D%0ATask%20ID:%20' + encodeURIComponent(task.id) + '%0D%0ATask%20Title:%20' + encodeURIComponent(task.title) + '%0D%0A%0D%0APlease%20describe%20your%20issue:%0D%0A', '_blank');
    toast.success('Opening email to contact admin', {
      description: 'Composing email to thegradhelper@outlook.com',
    });
    setOpenMenuId(null);
  };



  const handleMarkInProgress = async (task: Task) => {
    if (task.status === 'in_progress') {
      toast.info('Task is already marked as in progress');
      setOpenMenuId(null);
      return;
    }

    try {
      if (userRole === 'admin') {
        await updateAdminTaskStatus(task.id, 'in_progress');
      } else {
        await updateTaskStatus(task.id, 'in_progress');
      }
    } catch (error) {
      console.error('Error marking task as in progress:', error);
    }
    
    setOpenMenuId(null);
  };

  const handleMarkComplete = async (task: Task) => {
    if (task.status === 'completed') {
      toast.info('Task is already marked as completed');
      setOpenMenuId(null);
      return;
    }

    try {
      if (userRole === 'admin') {
        await updateAdminTaskStatus(task.id, 'completed');
      } else {
        await updateTaskStatus(task.id, 'completed');
      }
    } catch (error) {
      console.error('Error marking task as complete:', error);
    }
    
    setOpenMenuId(null);
  };

  // Filter is handled by the API, so we use tasks directly
  const filteredTasks = tasks;

  // Handler for search and filter changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  // Sorting functionality removed - backend doesn't support it yet

  // Handle refresh button click
  const handleRefresh = () => {
    refreshTasks();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'badge-success';
      case 'in_progress': return 'badge-info';
      case 'pending': return 'badge-warning';
      case 'revision_needed': return 'badge-error';
      case 'rejected': return 'badge-error';
      default: return 'badge-secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  // Enhanced file download handler using file service
  const handleDownloadFile = async (file: DeliverableFile | any, context?: string) => {
    try {
      await downloadFileHelper(file, context);
      toast.success(`Downloading ${file.name}...`, {
        description: context ? `From: ${context}` : undefined,
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file', {
        description: 'Please check your connection and try again.',
      });
    }
  };

  // Direct file removal handler - removes file immediately via API
  const handleRemoveFileDirectly = (taskId: string, attachmentId: string, fileName: string) => {
    // Show professional confirmation modal
    setDeletingFile({
      taskId,
      attachmentId,
      fileName,
      context: 'task attachment',
      type: 'task'
    });
    setShowFileDeleteModal(true);
  };

  // Confirm file deletion and execute removal
  const handleConfirmFileDelete = async () => {
    if (!deletingFile) return;

    try {
      const token = localStorage.getItem('gradhelper_token');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

      let apiUrl;
      if (deletingFile.type === 'task') {
        apiUrl = `${API_BASE_URL}/tasks/${deletingFile.taskId}/attachments/${deletingFile.attachmentId}/remove/`;
      } else {
        apiUrl = `${API_BASE_URL}/tasks/${deletingFile.taskId}/deliverables/${deletingFile.deliverableId}/attachments/${deletingFile.attachmentId}/remove/`;
      }

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        // Refresh tasks to get updated data from server
        await refreshTasks();
        
        // Close modal and reset state
        setShowFileDeleteModal(false);
        setDeletingFile(null);
        
        toast.success(`File removed successfully`, {
          description: `"${deletingFile.fileName}" has been deleted from the ${deletingFile.context}.`,
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          body: errorData
        });
        
        let errorMessage = 'Failed to remove file';
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
        
        toast.error(`Remove failed (${response.status})`, {
          description: errorMessage
        });
      }
    } catch (error) {
      console.error('File removal error:', error);
      toast.error('Network error', {
        description: 'Unable to connect to the server. Please check your connection and try again.'
      });
    } finally {
      // Close modal and reset state on any completion
      setShowFileDeleteModal(false);
      setDeletingFile(null);
    }
  };

  // Direct deliverable file removal handler
  const handleRemoveDeliverableFileDirectly = (taskId: string, deliverableId: string, attachmentId: string, fileName: string) => {
    // Show professional confirmation modal
    setDeletingFile({
      taskId,
      attachmentId,
      fileName,
      context: 'deliverable file',
      type: 'deliverable',
      deliverableId
    });
    setShowFileDeleteModal(true);
  };

  // Enhanced file preview handler
  const handlePreviewFile = async (file: DeliverableFile | any, context?: string) => {
    try {
      previewFileHelper(file);
      toast.info(`Opening ${file.name}...`, {
        description: context ? `From: ${context}` : undefined,
      });
    } catch (error) {
      console.error('Error previewing file:', error);
      toast.error('Failed to open file', {
        description: 'Please try downloading the file instead.',
      });
    }
  };

  // Enhanced file type icon helper
  const getFileTypeIcon = (fileName: string) => {
    if (!fileName || typeof fileName !== 'string') {
      return <File className="w-4 h-4 text-gray-500" />;
    }
    const ext = fileName.split('.').pop()?.toLowerCase();
    const iconClass = "w-4 h-4";
    
    switch (ext) {
      case 'pdf':
        return <FileText className={`${iconClass} text-red-600`} />;
      case 'doc':
      case 'docx':
        return <FileText className={`${iconClass} text-blue-600`} />;
      case 'xls':
      case 'xlsx':
        return <FileText className={`${iconClass} text-green-600`} />;
      case 'ppt':
      case 'pptx':
        return <FileText className={`${iconClass} text-orange-600`} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return <Eye className={`${iconClass} text-purple-600`} />;
      case 'zip':
      case 'rar':
      case '7z':
        return <Paperclip className={`${iconClass} text-gray-600`} />;
      case 'txt':
      case 'md':
        return <FileText className={`${iconClass} text-slate-600`} />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <Eye className={`${iconClass} text-indigo-600`} />;
      case 'mp3':
      case 'wav':
      case 'flac':
        return <Eye className={`${iconClass} text-pink-600`} />;
      default:
        return <FileText className={`${iconClass} text-gray-600`} />;
    }
  };

  // Use file service for formatting
  const formatFileSize = (bytes: number) => {
    return fileService.formatFileSize(bytes);
  };

  // Check if file can be previewed
  const canPreviewFile = (fileName: string, mimeType?: string) => {
    return fileService.canPreviewFile(fileName, mimeType);
  };

  // Handle create bill for task
  const handleCreateBill = (task: Task) => {
    setBillingTask(task);
    setBillForm({
      amount: task.budget || 0,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      description: `Payment for ${task.title}`,
      notes: 'Payment terms and conditions'
    });
    setShowBillModal(true);
    setOpenMenuId(null);
  };

  // Submit bill creation
  const handleSubmitBill = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission and page refresh
    if (!billingTask) return;

    try {
      setUpdateLoading(true);
      
      const token = localStorage.getItem('gradhelper_token');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

      const billData = {
        taskId: billingTask.id,
        studentId: billingTask.student.id,
        description: billForm.description,
        status: 'pending',
        dueDate: billForm.dueDate,
        notes: billForm.notes,
        student: billingTask.student.name,
        amount: billForm.amount.toString(),
        taskTitle: billingTask.title
      };

      const response = await fetch(`${API_BASE_URL}/admin/bills/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(billData),
      });

      let result;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const htmlText = await response.text();
        console.error('Server returned HTML instead of JSON:', htmlText);
        result = { 
          error: 'Server error - received HTML response instead of JSON',
          html_content: htmlText.substring(0, 200) + '...'
        };
      }
      
      console.log('Bill Creation API Response:', response.status, result);

      if (response.ok) {
        setShowBillModal(false);
        setBillingTask(null);
        setBillForm({
          amount: 0,
          dueDate: '',
          description: '',
          notes: 'Payment terms and conditions'
        });
        
        toast.success('Bill created successfully', {
          description: `Bill for "${billingTask.title}" has been created and sent to ${billingTask.student.name}.`,
        });
      } else {
        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          body: result
        });
        
        let errorMessage = 'Failed to create bill';
        
        if (result.detail) {
          errorMessage = result.detail;
        } else if (result.message) {
          errorMessage = result.message;
        } else if (result.error) {
          errorMessage = result.error;
        } else if (typeof result === 'object') {
          const fieldErrors = Object.entries(result)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('; ');
          if (fieldErrors) errorMessage = fieldErrors;
        }
        
        toast.error(`Bill creation failed (${response.status})`, {
          description: errorMessage
        });
      }
      
    } catch (error) {
      console.error('Bill creation error:', error);
      toast.error('Network error', {
        description: 'Unable to connect to the server. Please check your connection and try again.'
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Professional Header Section */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                {userRole === 'student' ? (
                  <GraduationCap className="w-8 h-8 text-white" />
                ) : (
                  <Target className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  {userRole === 'student' ? 'My Academic Tasks' : 'Task Management Center'}
                </h1>
                <p className="text-slate-600 mt-1 text-lg">
                  {userRole === 'student' 
                    ? 'Track your academic progress and manage assignments with precision'
                    : 'Oversee student assignments and monitor academic achievements'
                  }
                </p>
              </div>
            </div>
            
            {/* Task Statistics */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{filteredTasks.filter(t => t.status === 'completed').length}</div>
                <div className="text-sm text-slate-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{filteredTasks.filter(t => t.status === 'in_progress').length}</div>
                <div className="text-sm text-slate-600">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{filteredTasks.filter(t => t.status === 'pending').length}</div>
                <div className="text-sm text-slate-600">Pending</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Enhanced Professional Controls Panel */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/60 p-6">
          <div className="flex flex-col gap-6">
            {/* Primary Filters Row */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-center space-x-4 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder={userRole === 'admin' 
                      ? "Search tasks by title, subject, student, or admin..." 
                      : "Search tasks by title, subject, or student..."}
                    className="pl-12 pr-6 py-3 border border-slate-200 rounded-xl w-80 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </div>
                
                <select
                  className="px-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  value={statusFilter}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">📋 Pending</option>
                  <option value="in_progress">⚡ In Progress</option>
                  <option value="completed">✅ Completed</option>
                  <option value="revision_needed">🔄 Needs Revision</option>
                  <option value="rejected">❌ Rejected</option>
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh tasks"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-5 h-5" />
                  )}
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>

            {/* Admin-only Advanced Filters */}
            {userRole === 'admin' && (
              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Filter className="w-5 h-5 text-slate-600" />
                  <h3 className="text-sm font-semibold text-slate-700">Advanced Filters</h3>
                </div>
                <div className="flex items-center space-x-4 flex-wrap gap-2">
                  <select
                    className="px-3 py-2 border border-slate-200 rounded-lg bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm"
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">🔴 High Priority</option>
                    <option value="medium">🟡 Medium Priority</option>
                    <option value="low">🟢 Low Priority</option>
                  </select>

                  <select
                    className="px-3 py-2 border border-slate-200 rounded-lg bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="research">📚 Research</option>
                    <option value="essay">📝 Essay</option>
                    <option value="assignment">📋 Assignment</option>
                    <option value="project">🚀 Project</option>
                    <option value="thesis">🎓 Thesis</option>
                  </select>

                  <select
                    className="px-3 py-2 border border-slate-200 rounded-lg bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm"
                    value={assignedAdminFilter}
                    onChange={(e) => setAssignedAdminFilter(e.target.value)}
                  >
                    <option value="all">All Admins</option>
                    <option value="unassigned">🔘 Unassigned</option>
                    <option value="me">👤 Assigned to Me</option>
                    {/* TODO: Add specific admin options from API */}
                  </select>

                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <span>📊 Total: {tasks.length} tasks</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Professional Content Area */}
        <div className="space-y-6">
          {/* Loading State */}
          {loading && (
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/60 p-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full opacity-20 animate-pulse"></div>
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">Loading Your Tasks</h3>
                  <p className="text-slate-500">Please wait while we fetch your academic assignments...</p>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-red-200/60 p-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Unable to Load Tasks</h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Try Again</span>
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredTasks.length === 0 && (
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/60 p-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Tasks Found</h3>
                <p className="text-slate-600 max-w-md mx-auto">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search criteria or filter settings to find more tasks.'
                    : userRole === 'student' 
                      ? 'You haven\'t created any academic tasks yet. Start by creating your first assignment!'
                      : 'No tasks have been created by students yet. Check back later for new submissions.'
                  }
                </p>
              </div>
            </div>
          )}

          {/* Professional Tasks Grid */}
          {!loading && !error && filteredTasks.length > 0 && (
            <div className="grid gap-6 lg:gap-8">
              {filteredTasks.map((task) => (
              <div key={task.id} className="group bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/60 hover:shadow-2xl hover:border-slate-300/60 transition-all duration-300 overflow-hidden">
                {/* Task Header with Gradient */}
                <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 px-8 py-6 border-b border-slate-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`p-2 rounded-lg ${
                          task.priority === 'high' ? 'bg-red-100 text-red-600' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {task.priority === 'high' ? <AlertCircle className="w-5 h-5" /> :
                           task.priority === 'medium' ? <Clock className="w-5 h-5" /> :
                           <CheckCircle className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors duration-200">
                            {task.title}
                          </h3>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
                              {task.status.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                              {task.priority.toUpperCase()} PRIORITY
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-slate-600 text-base leading-relaxed mb-4">{task.description}</p>
                      
                      {/* Enhanced Meta Information */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-2 text-slate-600">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-slate-600">
                          <BookOpen className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium">{task.subject}</span>
                        </div>
                        {userRole === 'admin' && (
                          <div className="flex items-center space-x-2 text-slate-600">
                            <GraduationCap className="w-4 h-4 text-purple-500" />
                            <span className="text-sm font-medium">{task.student.name}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 text-slate-600">
                          <DollarSign className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm font-medium">${task.budget}</span>
                        </div>
                      </div>
                    </div>

                    {/* Professional Action Buttons */}
                    <div className="flex items-center space-x-2 ml-6">
                      <button 
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                        onClick={() => handleViewDetails(task)}
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">Details</span>
                      </button>
                      <div className="relative" ref={openMenuId === task.id ? menuRef : null}>
                        <button 
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200"
                          onClick={() => handleMenuToggle(task.id)}
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                        
                        {openMenuId === task.id && (
                          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 z-20 py-2">
                            <button 
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                              onClick={() => handleViewDetails(task)}
                            >
                              <Eye className="w-4 h-4" />
                              <span>View Details</span>
                            </button>
                            
                            {userRole === 'admin' && (
                              <>
                                <button 
                                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                                  onClick={() => handleContactStudent(task)}
                                >
                                  <MessageSquare className="w-4 h-4" />
                                  <span>Contact Student</span>
                                </button>
                                
                                {task.status !== 'in_progress' && task.status !== 'completed' && task.status !== 'rejected' && (
                                  <button 
                                    className="w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 flex items-center space-x-2"
                                    onClick={() => handleMarkInProgress(task)}
                                  >
                                    <Clock className="w-4 h-4" />
                                    <span>Mark In Progress</span>
                                  </button>
                                )}

                                {task.status !== 'completed' && task.status !== 'rejected' && (
                                  <button 
                                    className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 flex items-center space-x-2"
                                    onClick={() => handleMarkComplete(task)}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Mark Complete</span>
                                  </button>
                                )}
                                
                                {task.status !== 'rejected' && task.status !== 'completed' && (
                                <button 
                                  className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center space-x-2"
                                  onClick={() => handleRejectTask(task)}
                                >
                                  <XCircle className="w-4 h-4" />
                                  <span>Reject Task</span>
                                </button>
                                )}
                                
                                <div className="border-t border-slate-100 my-1" />
                                
                                <button 
                                  className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 flex items-center space-x-2"
                                  onClick={() => handleCreateBill(task)}
                                >
                                  <Receipt className="w-4 h-4" />
                                  <span>Create Bill</span>
                                </button>
                                
                                <div className="border-t border-slate-100 my-1" />                                <button 
                                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                                  onClick={() => handleEditTask(task)}
                                >
                                  <Edit className="w-4 h-4" />
                                  <span>Edit Task</span>
                                </button>
                                
                                <button 
                                  className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center space-x-2"
                                  onClick={() => handleDeleteTask(task)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Delete Task</span>
                                </button>
                              </>
                            )}
                            
                            {userRole === 'student' && (
                              <>
                                <button 
                                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                                  onClick={() => handleContactAdmin(task)}
                                >
                                  <MessageSquare className="w-4 h-4" />
                                  <span>Contact Admin</span>
                                </button>
                                
                                <button 
                                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                                  onClick={() => handleEditTask(task)}
                                >
                                  <Edit className="w-4 h-4" />
                                  <span>Edit Task</span>
                                </button>
                                
                                {task.status === 'pending' && (
                                  <button 
                                    className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center space-x-2"
                                    onClick={() => handleDeleteTask(task)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete Task</span>
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Task Attachments Section */}
                {task.attachments && task.attachments.length > 0 && (
                  <div className="px-8 py-4 bg-slate-50/50 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
                        <Paperclip className="w-4 h-4 text-slate-500" />
                        <span>Task Attachments ({task.attachments.length})</span>
                      </h4>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {task.attachments.map((file, index) => (
                        <div key={index} className="group flex items-center space-x-3 p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                          <div className="flex-shrink-0">
                            {getFileTypeIcon(file?.name || 'unknown')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{file?.name || 'Unknown File'}</p>
                            <p className="text-xs text-slate-500">{formatFileSize(file?.size || 0)}</p>
                          </div>
                          <div className="flex-shrink-0 flex items-center space-x-1">
                            <button
                              onClick={() => handleDownloadFile(file, `Task: ${task.title}`)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200 file-action-btn download"
                              title="Download file"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            {canPreviewFile(file?.name || 'unknown', file.type) ? (
                              <button
                                onClick={() => handlePreviewFile(file, `Task: ${task.title}`)}
                                className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-all duration-200 file-action-btn view"
                                title="Preview file"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handlePreviewFile(file, `Task: ${task.title}`)}
                                className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-all duration-200 file-action-btn view"
                                title="Open file in new tab"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveFileDirectly(task.id, file.id, file.name)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-200 file-action-btn remove"
                              title="Remove file"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Professional Deliverables Section */}
                <div className="px-8 py-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                      <Award className="w-5 h-5 text-blue-500" />
                      <span>Deliverables ({task.deliverables?.length || 0})</span>
                    </h4>
                    {userRole === 'student' && (
                      <button 
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
                        onClick={() => handleAddDeliverable(task)}
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Deliverable</span>
                      </button>
                    )}
                  </div>
                  
                  {task.deliverables && task.deliverables.length > 0 ? (
                    <div className="grid gap-3">
                      {task.deliverables.map((deliverable) => (
                        <div key={deliverable.id} className="group bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-xl p-4 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3 mb-2">
                                <h5 className="font-semibold text-slate-900 truncate">{deliverable.title}</h5>
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(deliverable.status)}`}>
                                  {deliverable.status.replace('_', ' ').toUpperCase()}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-slate-600">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span>Due: {new Date(deliverable.dueDate).toLocaleDateString()}</span>
                                </div>
                                {deliverable.files && deliverable.files.length > 0 && (
                                  <div className="flex items-center space-x-1">
                                    <Paperclip className="w-3.5 h-3.5" />
                                    <span>{deliverable.files.length} file{deliverable.files.length !== 1 ? 's' : ''}</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Deliverable Files */}
                              {deliverable.files && deliverable.files.length > 0 && (
                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {deliverable.files.map((file, fileIndex) => (
                                    <div key={fileIndex} className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-slate-100 hover:border-blue-200 transition-all duration-200">
                                      <div className="flex-shrink-0">
                                        {getFileTypeIcon(file?.name || 'unknown')}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-slate-800 truncate">{file?.name || 'Unknown File'}</p>
                                        <p className="text-xs text-slate-500">{formatFileSize(file?.size || 0)}</p>
                                      </div>
                                      <div className="flex-shrink-0 flex items-center space-x-1">
                                        <button
                                          onClick={() => handleDownloadFile(file, `${task.title} - ${deliverable.title}`)}
                                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200 file-action-btn download"
                                          title="Download file"
                                        >
                                          <Download className="w-3.5 h-3.5" />
                                        </button>
                                        {canPreviewFile(file?.name || 'unknown') ? (
                                          <button
                                            onClick={() => handlePreviewFile(file, `${task.title} - ${deliverable.title}`)}
                                            className="p-1 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded transition-all duration-200 file-action-btn view"
                                            title="Preview file"
                                          >
                                            <Eye className="w-3.5 h-3.5" />
                                          </button>
                                        ) : (
                                          <button
                                            onClick={() => handlePreviewFile(file, `${task.title} - ${deliverable.title}`)}
                                            className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-all duration-200 file-action-btn view"
                                            title="Open file in new tab"
                                          >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                        <button
                                          onClick={() => handleRemoveDeliverableFileDirectly(task.id.toString(), deliverable.id.toString(), file.id, file.name)}
                                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all duration-200 file-action-btn remove"
                                          title="Remove file"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FileText className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-slate-600 font-medium mb-1">No deliverables yet</p>
                      <p className="text-sm text-slate-500">
                        {userRole === 'student' && "Click 'Add Deliverable' to create your first submission."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
        {showAddDeliverable && selectedTask && (
        <AddDeliverable
          taskId={selectedTask!.id}
          taskTitle={selectedTask!.title}
          onClose={() => {
            setShowAddDeliverable(false);
            setSelectedTask(null);
          }}
          onAdd={handleDeliverableAdded}
        />
      )}

      {showTaskDetail && selectedTask && (
        <TaskDetailModal
          task={selectedTask!}
          userRole={userRole}
          isOpen={showTaskDetail}
          onClose={() => {
            setShowTaskDetail(false);
            setSelectedTask(null);
          }}
          onTaskUpdate={handleTaskUpdate}
        />
      )}

      {showRejectModal && selectedTask && (
        <TaskRejectModal
          task={selectedTask!}
          isOpen={showRejectModal}
          onClose={() => {
            setShowRejectModal(false);
            setSelectedTask(null);
          }}
          onReject={handleTaskRejection}
        />
      )}

      {/* Professional Edit Task Modal */}
      {showEditModal && editingTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Edit className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Edit Task</h3>
                  <p className="text-sm text-slate-600">Update task details and requirements</p>
                </div>
              </div>
              <button 
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                onClick={() => setShowEditModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Task Title</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter task title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={editForm.subject}
                    onChange={(e) => setEditForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter subject"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter task description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={editForm.dueDate}
                    onChange={(e) => setEditForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                  <select
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={editForm.priority}
                    onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Budget ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={editForm.budget}
                    onChange={(e) => setEditForm(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Task Type</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={editForm.type}
                    onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value }))}
                    placeholder="e.g., Essay, Research Paper"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Academic Level</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={editForm.academicLevel}
                    onChange={(e) => setEditForm(prev => ({ ...prev, academicLevel: e.target.value }))}
                    placeholder="e.g., Undergraduate, Masters"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Pages</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={editForm.pages}
                    onChange={(e) => setEditForm(prev => ({ ...prev, pages: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Requirements</label>
                  <textarea
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    rows={3}
                    value={editForm.requirements}
                    onChange={(e) => setEditForm(prev => ({ ...prev, requirements: e.target.value }))}
                    placeholder="Enter specific requirements"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Citations Style</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={editForm.citations}
                    onChange={(e) => setEditForm(prev => ({ ...prev, citations: e.target.value }))}
                    placeholder="e.g., APA, MLA, Chicago"
                  />
                </div>
              </div>

              {/* File Management Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700">Task Files</label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Files</span>
                  </button>
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleEditFileSelect}
                  accept="*/*"
                />

                {/* Existing Files */}
                {editExistingFiles.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-slate-600">Current Files</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {editExistingFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-slate-200 rounded-lg">
                              <FileText className="w-4 h-4 text-slate-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-800">{file.name}</p>
                              <p className="text-xs text-slate-500">{file.size || 'Unknown size'}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {file.url && (
                              <button
                                type="button"
                                onClick={() => window.open(file.url, '_blank')}
                                className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded transition-all"
                                title="Preview file"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingFile(file.id, file.name)}
                              className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded transition-all"
                              title="Remove file"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Files */}
                {editFiles.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-slate-600">New Files to Add</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {editFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-200 rounded-lg">
                              <FileText className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-800">{file.name}</p>
                              <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveEditFile(index)}
                            className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded transition-all"
                            title="Remove file"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* File Summary */}
                {(editFiles.length > 0 || filesToRemove.length > 0) && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2 text-sm text-blue-700">
                      <FileText className="w-4 h-4" />
                      <span>
                        {editFiles.length > 0 && `${editFiles.length} new file(s) will be added`}
                        {editFiles.length > 0 && filesToRemove.length > 0 && ', '}
                        {filesToRemove.length > 0 && `${filesToRemove.length} file(s) will be removed`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200 bg-slate-50">
              <button 
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-all"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button 
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
                onClick={handleUpdateTask}
                disabled={updateLoading || !editForm.title.trim()}
              >
                {updateLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Update Task</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Professional Delete Task Modal */}
      {showDeleteModal && deletingTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Delete Task</h3>
                  <p className="text-sm text-slate-600">This action cannot be undone</p>
                </div>
              </div>
              <button 
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                onClick={() => setShowDeleteModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Are you sure you want to delete this task?
                  </p>
                  <p className="text-sm text-red-600 mt-1">
                    "{deletingTask.title}" and all its deliverables will be permanently removed.
                  </p>
                </div>
              </div>
              
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-slate-200 rounded-lg">
                    <FileText className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-slate-900">{deletingTask.title}</h4>
                    <p className="text-sm text-slate-600 mt-1">{deletingTask.subject}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                      <span>Due: {new Date(deletingTask.dueDate).toLocaleDateString()}</span>
                      <span>${deletingTask.budget}</span>
                      <span>{deletingTask.deliverables?.length || 0} deliverables</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200 bg-slate-50">
              <button 
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-all"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all disabled:opacity-50"
                onClick={handleConfirmDelete}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>Delete Task</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Professional File Delete Modal */}
      {showFileDeleteModal && deletingFile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Delete File</h3>
                  <p className="text-sm text-slate-600">This action cannot be undone</p>
                </div>
              </div>
              <button 
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                onClick={() => {
                  setShowFileDeleteModal(false);
                  setDeletingFile(null);
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Are you sure you want to delete this file?
                  </p>
                  <p className="text-sm text-red-600 mt-1">
                    "{deletingFile.fileName}" will be permanently removed from the {deletingFile.context}.
                  </p>
                </div>
              </div>
              
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-slate-200 rounded-lg">
                    <FileText className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-slate-900">{deletingFile.fileName}</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      {deletingFile.type === 'task' ? 'Task Attachment' : 'Deliverable File'}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                      <span>Context: {deletingFile.context}</span>
                      <span>Type: {deletingFile.type}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200 bg-slate-50">
              <button 
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-all"
                onClick={() => {
                  setShowFileDeleteModal(false);
                  setDeletingFile(null);
                  toast.info('File deletion cancelled', {
                    description: `"${deletingFile.fileName}" was not deleted.`
                  });
                }}
              >
                Cancel
              </button>
              <button 
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all disabled:opacity-50"
                onClick={handleConfirmFileDelete}
                disabled={updateLoading}
              >
                {updateLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>Delete File</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Professional File Staging Modal */}
      {showFileStagingModal && stagingFile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FileText className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Stage File for Removal</h3>
                  <p className="text-sm text-slate-600">File will be deleted when you save</p>
                </div>
              </div>
              <button 
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                onClick={() => {
                  setShowFileStagingModal(false);
                  setStagingFile(null);
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center space-x-3 p-4 bg-orange-50 border border-orange-200 rounded-lg mb-4">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    Remove "{stagingFile.fileName}" from this task?
                  </p>
                  <p className="text-sm text-orange-600 mt-1">
                    The file will be deleted when you save the task changes.
                  </p>
                </div>
              </div>
              
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-slate-200 rounded-lg">
                    <FileText className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-slate-900">{stagingFile.fileName}</h4>
                    <p className="text-sm text-slate-600 mt-1">Current task attachment</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                      <span>Action: Stage for removal</span>
                      <span>Context: Edit mode</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200 bg-slate-50">
              <button 
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-all"
                onClick={() => {
                  setShowFileStagingModal(false);
                  setStagingFile(null);
                  toast.info('File staging cancelled', {
                    description: `"${stagingFile.fileName}" will remain in the task.`
                  });
                }}
              >
                Cancel
              </button>
              <button 
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all"
                onClick={handleConfirmFileStaging}
              >
                <FileText className="w-4 h-4" />
                <span>Stage for Removal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Billing Modal */}
      {showBillModal && billingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-green-600" />
                <span>Create Bill</span>
              </h3>
              <button
                onClick={() => {
                  setShowBillModal(false);
                  setBillingTask(null);
                  setBillForm({ amount: 0, dueDate: '', description: '', notes: '' });
                }}
                className="text-slate-500 hover:text-slate-700"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
              <h4 className="font-medium text-slate-900">{billingTask.title}</h4>
              <p className="text-sm text-slate-600 mt-1">{billingTask.description}</p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                <span>Client: {billingTask.student.name}</span>
                <span>Status: {billingTask.status}</span>
              </div>
            </div>

            <form onSubmit={handleSubmitBill} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Amount ($) *
                </label>
                <input
                  type="number"
                  value={billForm.amount}
                  onChange={(e) => setBillForm({ ...billForm, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={billForm.dueDate}
                  onChange={(e) => setBillForm({ ...billForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={billForm.description}
                  onChange={(e) => setBillForm({ ...billForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Brief description of the service..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  value={billForm.notes}
                  onChange={(e) => setBillForm({ ...billForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Optional notes..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowBillModal(false);
                    setBillingTask(null);
                    setBillForm({ amount: 0, dueDate: '', description: '', notes: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {updateLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4" />
                  )}
                  <span>Create Bill</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}