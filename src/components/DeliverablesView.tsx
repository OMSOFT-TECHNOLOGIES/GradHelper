import { useState, useEffect, useRef } from 'react';
import { useNotifications } from './NotificationContext';
import { 
  CheckSquare, 
  Edit3, 
  FileText, 
  X, 
  Loader2, 
  AlertCircle, 
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Trash2,
  Eye,
  Download,
  Paperclip,
  Star,
  MoreHorizontal,
  Plus,
  Save,
  XCircle,
  Upload,
  ExternalLink
} from 'lucide-react';
import { taskService, Deliverable } from '../services/taskService';
import { toast } from "sonner";
import '../styles/deliverables.css';

interface DeliverablesViewProps {
  userRole: 'student' | 'admin';
  user: any;
}

export function DeliverablesView({ userRole, user }: DeliverablesViewProps) {
  const { addNotification } = useNotifications();
  
  // Modal states
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState<any>(null);
  const [feedback, setFeedback] = useState('');
  const [newStatus, setNewStatus] = useState('');
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'pending'
  });

  // File handling state for edit modal
  const [editFiles, setEditFiles] = useState<File[]>([]);
  const [editExistingFiles, setEditExistingFiles] = useState<any[]>([]);
  const [filesToRemove, setFilesToRemove] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // API state management
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch user's deliverables from backend
  const fetchDeliverables = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await taskService.getUserDeliverables();
      
      if (response.success) {
        setDeliverables(response.data);
      } else {
        throw new Error('Failed to fetch deliverables');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch deliverables';
      setError(errorMessage);
      
      toast.error('Failed to load deliverables', {
        description: errorMessage,
        action: {
          label: 'Retry',
          onClick: () => fetchDeliverables(),
        },
      });
      
      console.error('Error fetching deliverables:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch deliverables on component mount
  useEffect(() => {
    fetchDeliverables();
  }, []);

  const handleStatusUpdate = (deliverable: any, status: string) => {
    if (status === 'needs_revision') {
      setSelectedDeliverable(deliverable);
      setNewStatus(status);
      setShowFeedbackModal(true);
    } else {
      updateDeliverableStatus(deliverable, status, '');
    }
  };

  const handleFeedbackSubmit = () => {
    if (selectedDeliverable) {
      updateDeliverableStatus(selectedDeliverable, newStatus, feedback);
      setShowFeedbackModal(false);
      setFeedback('');
      setSelectedDeliverable(null);
      setNewStatus('');
    }
  };

  const updateDeliverableStatus = async (deliverable: any, status: string, feedbackText: string) => {
    try {
      // Update local state optimistically
      setDeliverables(prev =>
        prev.map(item =>
          item.id === deliverable.id
            ? { ...item, status: status as any, feedback: feedbackText || item.feedback }
            : item
        )
      );

      // TODO: Add API call to update deliverable status on backend
      // await taskService.updateDeliverableStatus(deliverable.id, status, feedbackText);

      // Send notification to student
      const notificationTitle = status === 'completed' 
        ? 'Deliverable Approved' 
        : status === 'needs_revision'
        ? 'Deliverable Needs Revision'
        : 'Deliverable Updated';

      const notificationMessage = status === 'completed'
        ? `Your "${deliverable.title}" has been approved!`
        : status === 'needs_revision'
        ? `Your "${deliverable.title}" needs revision. Please check the feedback.`
        : `Your "${deliverable.title}" status has been updated.`;

      addNotification({
        type: status === 'completed' ? 'deliverable_approved' : 
              status === 'needs_revision' ? 'deliverable_rejected' : 'deliverable_feedback',
        title: notificationTitle,
        message: notificationMessage,
        userId: deliverable.studentId,
        userRole: 'student',
        data: { deliverableId: deliverable.id, taskId: deliverable.taskId }
      });

      // Also notify admin if it's a status change
      if (userRole === 'admin') {
        addNotification({
          type: 'system',
          title: 'Deliverable Status Updated',
          message: `You updated "${deliverable.title}" status to ${status.replace('_', ' ')}.`,
          userId: user.id,
          userRole: 'admin',
          data: { deliverableId: deliverable.id, taskId: deliverable.taskId }
        });
      }

      toast.success('Deliverable status updated successfully');
    } catch (error) {
      console.error('Error updating deliverable status:', error);
      toast.error('Failed to update deliverable status');
      // Revert optimistic update
      fetchDeliverables();
    }
  };

  // Handle edit deliverable
  const handleEditDeliverable = (deliverable: any) => {
    setSelectedDeliverable(deliverable);
    setEditForm({
      title: deliverable.title || '',
      description: deliverable.description || '',
      dueDate: deliverable.dueDate ? new Date(deliverable.dueDate).toISOString().split('T')[0] : '',
      priority: deliverable.priority || 'medium',
      status: deliverable.status || 'pending'
    });
    
    // Initialize file states
    setEditFiles([]);
    setEditExistingFiles(deliverable.files || []);
    setFilesToRemove([]);
    
    setShowEditModal(true);
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
    // Show confirmation dialog for staging file removal
    const confirmed = window.confirm(
      `Remove "${fileName}" from this deliverable?\n\nThe file will be deleted when you save the deliverable.`
    );
    
    if (!confirmed) {
      toast.info('File removal cancelled', {
        description: `"${fileName}" will remain in the deliverable.`
      });
      return; // User cancelled, exit early
    }

    setFilesToRemove(prev => [...prev, fileId]);
    setEditExistingFiles(prev => prev.filter(f => f.id !== fileId));
    toast.success(`${fileName} will be removed when you save`);
  };

  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 ** 2) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 ** 3) return `${(size / (1024 ** 2)).toFixed(1)} MB`;
    return `${(size / (1024 ** 3)).toFixed(1)} GB`;
  };

  // Update deliverable
  const handleUpdateDeliverable = async () => {
    if (!selectedDeliverable) return;

    try {
      setLoading(true);

      // Get auth token from localStorage
      const token = localStorage.getItem('gradhelper_token');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

      let response;

      // Use FormData when files are present, JSON when no files (like PostTask)
      if (editFiles.length > 0 || filesToRemove.length > 0) {
        const formData = new FormData();
        
        // Debug: Log form data before adding to FormData
        console.log('EditForm data:', editForm);
        console.log('Edit files:', editFiles.length);
        console.log('Files to remove:', filesToRemove.length);
        console.log('Existing files:', editExistingFiles.length);
        console.log('Selected deliverable:', selectedDeliverable);
        
        // Validate editForm has required data
        if (!editForm.title || !editForm.description) {
          console.error('Missing required form data:', { 
            title: editForm.title, 
            description: editForm.description 
          });
        }
        
        // Add all basic form fields with explicit string conversion
        formData.append('title', String(editForm.title || ''));
        formData.append('description', String(editForm.description || ''));
        formData.append('dueDate', String(editForm.dueDate || ''));
        formData.append('priority', String(editForm.priority || 'medium'));
        formData.append('status', String(editForm.status || 'pending'));
        
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
        editFiles.forEach((file, index) => {
          console.log(`Adding file ${index}:`, file.name, file.size, file.type);
          formData.append('files', file);
        });
        
        // Debug: Log FormData contents
        console.log('Updating deliverable with FormData (files present)');
        console.log('FormData entries:');
        
        // List all the keys we're adding for debugging
        const formDataKeys = ['title', 'description', 'dueDate', 'priority', 'status'];
        formDataKeys.forEach(key => {
          console.log(`${key}:`, formData.get(key));
        });
        
        if (remainingFiles.length > 0) {
          console.log('existingAttachments:', formData.get('existingAttachments'));
        }
        if (filesToRemove.length > 0) {
          console.log('removeAttachments:', formData.get('removeAttachments'));
        }
        
        console.log(`Total attachments being uploaded: ${editFiles.length}`);
        
        // Validate FormData has required fields
        const requiredFields = ['title', 'description', 'priority', 'status'];
        const missingFields = requiredFields.filter(field => !formData.get(field));
        if (missingFields.length > 0) {
          console.warn('Missing required fields in FormData:', missingFields);
        }
        
        // Validate deliverable ID exists
        if (!selectedDeliverable.id) {
          console.error('Missing deliverable ID:', selectedDeliverable);
          throw new Error('Deliverable ID is required for update');
        }
        
        const updateUrl = `${API_BASE_URL}/deliverables/${selectedDeliverable.id}/`;
        console.log('Update form:', Object.fromEntries(formData.entries()));
        
        response = await fetch(updateUrl, {
          method: 'PUT',
          headers: {
            ...(token && { 'Authorization': `Bearer ${token}` }),
            // Don't set Content-Type for FormData - browser sets it with boundary
          },
          body: formData,
        });
      } else {
        // No file changes, use JSON (like PostTask)
        const deliverableData = {
          title: editForm.title,
          description: editForm.description,
          dueDate: editForm.dueDate,
          priority: editForm.priority,
          status: editForm.status,
          updatedAt: new Date().toISOString()
        };
        
        console.log('Updating deliverable with JSON (no file changes)');
        console.log('Deliverable data:', deliverableData);
        
        response = await fetch(`${API_BASE_URL}/deliverables/${selectedDeliverable.id}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
          body: JSON.stringify(deliverableData),
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
        // Refresh deliverables to get updated data with properly parsed files from server
        console.log('Refreshing deliverables after successful update to get parsed file data...');
        await fetchDeliverables();
        console.log('Deliverables refreshed with parsed files');

        // Close modal and reset state
        setShowEditModal(false);
        setSelectedDeliverable(null);
        setEditFiles([]);
        setEditExistingFiles([]);
        setFilesToRemove([]);
        
        toast.success('Deliverable updated successfully', {
          description: `Updated deliverable${editFiles.length > 0 ? ` with ${editFiles.length} new files` : ''}${filesToRemove.length > 0 ? ` and removed ${filesToRemove.length} files` : ''}`
        });
        
        addNotification({
          type: 'system',
          title: 'Deliverable Updated', 
          message: `"${editForm.title}" has been updated successfully.`,
          userId: user.id,
          userRole: userRole,
          data: { deliverableId: selectedDeliverable.id }
        });
      } else {
        // Handle API errors with detailed information (like PostTask)
        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          body: result
        });
        
        let errorMessage = 'Failed to update deliverable';
        
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
      console.error('Deliverable update error:', error);
      toast.error('Network error', {
        description: 'Unable to connect to the server. Please check your connection and try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete deliverable
  const handleDeleteDeliverable = (deliverable: any) => {
    setSelectedDeliverable(deliverable);
    setShowDeleteModal(true);
  };

  // Delete deliverable
  const handleConfirmDelete = async () => {
    if (!selectedDeliverable) return;

    try {
      setLoading(true);
      
      // Get auth token from localStorage
      const token = localStorage.getItem('gradhelper_token');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

      // API call to delete deliverable
      const response = await fetch(`${API_BASE_URL}/deliverables/${selectedDeliverable.id}/`, {
        method: 'DELETE',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      // Check if response is JSON or HTML (error handling)
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
      
      console.log('Delete API Response:', response.status, result);

      if (response.ok) {
        // Update local state - remove the deleted deliverable
        setDeliverables(prev => 
          prev.filter(item => item.id !== selectedDeliverable.id)
        );

        setShowDeleteModal(false);
        setSelectedDeliverable(null);
        
        toast.success('Deliverable deleted successfully', {
          description: `"${selectedDeliverable.title}" has been permanently removed.`
        });
        
        addNotification({
          type: 'system',
          title: 'Deliverable Deleted',
          message: `"${selectedDeliverable.title}" has been deleted.`,
          userId: user.id,
          userRole: userRole,
          data: { deliverableId: selectedDeliverable.id }
        });
      } else {
        // Handle API errors with detailed information
        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          body: result
        });
        
        let errorMessage = 'Failed to delete deliverable';
        
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
        
        toast.error(`Delete failed (${response.status})`, {
          description: errorMessage
        });
      }
      
    } catch (error) {
      console.error('Deliverable deletion error:', error);
      toast.error('Network error', {
        description: 'Unable to connect to the server. Please check your connection and try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter deliverables based on search and status
  const filteredDeliverables = deliverables.filter(deliverable => {
    const matchesSearch = searchTerm === '' || 
      deliverable.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (deliverable as any).taskTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || deliverable.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'under_review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'needs_revision':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get priority badge class
  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* Professional Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Deliverables Management</h1>
                <p className="text-slate-600 mt-1">
                  {userRole === 'student' 
                    ? 'Track and manage all your project deliverables'
                    : 'Review and approve deliverables from students'
                  }
                </p>
              </div>
            </div>
            
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search deliverables..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-64 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <select
                  className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="under_review">Under Review</option>
                  <option value="completed">Completed</option>
                  <option value="needs_revision">Needs Revision</option>
                </select>
              </div>
              
              <button
                onClick={() => fetchDeliverables()}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
                title="Refresh deliverables"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                ) : (
                  <RefreshCw className="w-4 h-4 text-slate-600" />
                )}
                <span className="text-slate-600">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-slate-600 font-medium">Loading deliverables...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center bg-white rounded-xl p-8 shadow-sm border border-red-100">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Failed to load deliverables</h3>
              <p className="text-slate-600 mb-6">{error}</p>
              <button
                onClick={() => fetchDeliverables()}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredDeliverables.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center bg-white rounded-xl p-8 shadow-sm border border-slate-100">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No deliverables found</h3>
              <p className="text-slate-600 max-w-md">
                {deliverables.length === 0 ? (
                  userRole === 'student' 
                    ? 'You haven\'t created any deliverables yet. Create tasks and add deliverables to get started.'
                    : 'No deliverables have been assigned to you for review yet.'
                ) : (
                  searchTerm ? 
                    'No deliverables match your search criteria. Try adjusting your filters.' :
                    statusFilter === 'all' 
                      ? 'No deliverables found.'
                      : `No deliverables with status "${statusFilter.replace('_', ' ')}" found.`
                )}
              </p>
            </div>
          </div>
        )}

        {/* Professional Deliverables Grid */}
        {!loading && !error && filteredDeliverables.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredDeliverables.map((item) => (
              <div key={item.id} className="group bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-blue-200 transition-all duration-300 overflow-hidden">
                {/* Card Header */}
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(item.status)}`}>
                          {item.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityBadgeClass((item as any).priority || 'medium')}`}>
                          {((item as any).priority || 'medium').toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1 truncate group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-600 mb-2">
                        Task: {(item as any).taskTitle || item.title || 'Unknown Task'}
                      </p>
                      {userRole === 'admin' && item.student && (
                        <div className="flex items-center space-x-1 text-sm text-slate-500">
                          <User className="w-3 h-3" />
                          <span>{item.student.name}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEditDeliverable(item)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        title="Edit deliverable"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDeliverable(item)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Delete deliverable"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  {/* Description */}
                  {item.description && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {/* Files Section */}
                  {item.files && item.files.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Paperclip className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-700">
                          {item.files.length} file{item.files.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {item.files.slice(0, 2).map((file, fileIndex) => (
                          <div key={fileIndex} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                              <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                              <span className="text-sm text-slate-700 truncate">
                                {file.name || 'Unknown File'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 flex-shrink-0">
                              <button className="p-1 text-slate-400 hover:text-blue-600 transition-colors">
                                <Download className="w-3 h-3" />
                              </button>
                              <button className="p-1 text-slate-400 hover:text-green-600 transition-colors">
                                <Eye className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {item.files.length > 2 && (
                          <p className="text-xs text-slate-500 px-2">
                            +{item.files.length - 2} more files
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Due Date */}
                  <div className="flex items-center space-x-4 text-sm text-slate-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {(item as any).submittedAt 
                          ? `Submitted: ${new Date((item as any).submittedAt).toLocaleDateString()}`
                          : item.dueDate 
                          ? `Due: ${new Date(item.dueDate).toLocaleDateString()}`
                          : 'No due date'
                        }
                      </span>
                    </div>
                    {(item as any).estimatedHours && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{(item as any).estimatedHours}h</span>
                      </div>
                    )}
                  </div>

                  {/* Feedback */}
                  {(item as any).feedback && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <h4 className="text-sm font-medium text-yellow-800 mb-1">Feedback:</h4>
                      <p className="text-sm text-yellow-700">{(item as any).feedback}</p>
                    </div>
                  )}
                </div>

                {/* Card Footer - Actions */}
                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {userRole === 'admin' && (
                        <>
                          {item.status === 'under_review' && (
                            <>
                              <button 
                                className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                onClick={() => handleStatusUpdate(item, 'needs_revision')}
                              >
                                <X className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                              <button 
                                className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                onClick={() => handleStatusUpdate(item, 'completed')}
                              >
                                <CheckSquare className="w-3 h-3" />
                                <span>Approve</span>
                              </button>
                            </>
                          )}
                          {item.status === 'completed' && (
                            <button 
                              className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                              onClick={() => handleStatusUpdate(item, 'needs_revision')}
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Request Changes</span>
                            </button>
                          )}
                          {item.status === 'needs_revision' && (
                            <button 
                              className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                              onClick={() => handleStatusUpdate(item, 'completed')}
                            >
                              <CheckSquare className="w-3 h-3" />
                              <span>Mark Complete</span>
                            </button>
                          )}
                        </>
                      )}
                      {userRole === 'student' && item.status === 'needs_revision' && (
                        <button className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                          <FileText className="w-3 h-3" />
                          <span>Resubmit</span>
                        </button>
                      )}
                    </div>
                    
                    <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      {/* Professional Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Edit3 className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Provide Feedback</h3>
                  <p className="text-sm text-slate-600">Help the student improve their work</p>
                </div>
              </div>
              <button 
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                onClick={() => setShowFeedbackModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-slate-700 mb-4">
                Providing feedback for: <span className="font-medium text-slate-900">"{selectedDeliverable?.title}"</span>
              </p>
              <textarea
                className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                rows={4}
                placeholder="Enter constructive feedback to help the student improve..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200 bg-slate-50">
              <button 
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-all"
                onClick={() => setShowFeedbackModal(false)}
              >
                Cancel
              </button>
              <button 
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleFeedbackSubmit}
                disabled={!feedback.trim()}
              >
                <Save className="w-4 h-4" />
                <span>Send Feedback</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Professional Edit Modal */}
      {showEditModal && selectedDeliverable && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Edit3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Edit Deliverable</h3>
                  <p className="text-sm text-slate-600">Update deliverable details</p>
                </div>
              </div>
              <button 
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                onClick={() => {
                  setShowEditModal(false);
                  setEditFiles([]);
                  setEditExistingFiles([]);
                  setFilesToRemove([]);
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                <input
                  type="text"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter deliverable title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter deliverable description"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={editForm.status}
                  onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="under_review">Under Review</option>
                  <option value="completed">Completed</option>
                  <option value="needs_revision">Needs Revision</option>
                </select>
              </div>
              
              {/* File Management Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700">Deliverable Files</label>
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
                onClick={() => {
                  setShowEditModal(false);
                  setEditFiles([]);
                  setEditExistingFiles([]);
                  setFilesToRemove([]);
                }}
              >
                Cancel
              </button>
              <button 
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
                onClick={handleUpdateDeliverable}
                disabled={loading || !editForm.title.trim()}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Update Deliverable</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Professional Delete Modal */}
      {showDeleteModal && selectedDeliverable && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Delete Deliverable</h3>
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
                    Are you sure you want to delete this deliverable?
                  </p>
                  <p className="text-sm text-red-600 mt-1">
                    "{selectedDeliverable.title}" will be permanently removed.
                  </p>
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
                <span>Delete Deliverable</span>
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}