import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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

  // Dropdown menu state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const portalMenuRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Admin-specific filter states
  const [adminFilters, setAdminFilters] = useState({
    user_id: 'all',
    assigned_admin_id: 'all',
    task_status: 'all',
    priority: 'all',
    has_deliverables: 'all'
  });

  // Fetch deliverables from backend (role-based)
  const fetchDeliverables = async () => {
    setLoading(true);
    setError(null);

    try {
      let response;
      
      if (userRole === 'admin') {
        // Admin view: get all tasks with deliverables
        const params = {
          status: statusFilter !== 'all' ? statusFilter : undefined,
          task_status: adminFilters.task_status !== 'all' ? adminFilters.task_status : undefined,
          search: searchTerm || undefined,
          user_id: adminFilters.user_id !== 'all' ? adminFilters.user_id : undefined,
          assigned_admin_id: adminFilters.assigned_admin_id !== 'all' ? adminFilters.assigned_admin_id : undefined,
          priority: adminFilters.priority !== 'all' ? adminFilters.priority : undefined,
          has_deliverables: adminFilters.has_deliverables !== 'all' ? adminFilters.has_deliverables === 'true' : undefined,
        };
        
        response = await taskService.getAdminTasksWithDeliverables(params);
        
        // Flatten the deliverables from all tasks for the UI
        if (response.success) {
          const flattenedDeliverables: Deliverable[] = [];
          response.data.forEach(taskData => {
            // Skip deliverables from rejected tasks for admin view
            if (taskData.task.status === 'rejected') {
              return;
            }
            
            taskData.deliverables.forEach(deliverable => {
              // Add task information to each deliverable for context
              flattenedDeliverables.push({
                ...deliverable,
                task_info: {
                  id: taskData.task.id,
                  title: taskData.task.title,
                  type: taskData.task.type,
                  status: taskData.task.status,
                  priority: taskData.task.priority,
                  deadline: taskData.task.deadline,
                  student: taskData.task.student,
                  assignedAdmin: taskData.task.assignedAdmin
                }
              });
            });
          });
          setDeliverables(flattenedDeliverables);
        }
      } else {
        // Student view: get only user's deliverables
        response = await taskService.getUserDeliverables();
        if (response.success) {
          setDeliverables(response.data);
        }
      }
      
      if (!response.success) {
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

  // Fetch deliverables on component mount and when filters change
  useEffect(() => {
    fetchDeliverables();
  }, [statusFilter, searchTerm, adminFilters, userRole]);

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

  // Enhanced file preview handler - opens documents in browser with proper auth (same structure as TaskManagement)
  const handlePreviewFile = async (file: any, context?: string) => {
    try {
      const fileName = file.name || '';
      const extension = fileName.split('.').pop()?.toLowerCase();
      const browserPreviewableTypes = [
        'pdf', 'txt', 'md', 'html', 'htm', 'xml', 'json', 'csv',
        'jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp',
        'mp4', 'webm', 'ogg', 'mov', 'mp3', 'wav'
      ];

      const token = localStorage.getItem('gradhelper_token');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

      // Check if this is a deliverable file with R2 URL that needs authentication
      if (file.url && file.url.includes('cloudflarestorage.com')) {
        // This is an R2 file that needs a signed URL
        try {
          let signedUrlResponse;
          
          // For deliverable files, find the parent deliverable
          let parentDeliverable = null;
          
          // Find which deliverable this file belongs to
          for (const deliverable of deliverables) {
            if (deliverable.files && deliverable.files.some((delivFile: any) => delivFile.id === file.id)) {
              parentDeliverable = deliverable;
              break;
            }
          }
          
          if (file.id && parentDeliverable) {
            // Use deliverable file endpoint
            const deliverableFileUrl = `${API_BASE_URL}/accounts/deliverables/${parentDeliverable.id}/files/${file.id}/?action=download`;
            signedUrlResponse = await fetch(deliverableFileUrl, {
              headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
              },
            });
          } else if (file.id) {
            // Fallback to generic endpoints if deliverable context is not available
            signedUrlResponse = await fetch(`${API_BASE_URL}/files/${file.id}/url/`, {
              headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
              },
            });
          }

          let signedUrl: string | null = null;
          if (signedUrlResponse && signedUrlResponse.ok) {
            const data = await signedUrlResponse.json();
            console.log('Signed URL response data:', data);
            signedUrl = data.download_url || data.url || data.downloadUrl || data.previewUrl || data.signed_url;
          }
          
          // If we got a signed URL, use it with proper handling
          if (signedUrl) {
            if (extension === 'pdf') {
              // For PDFs, use backend proxy to avoid CORS issues
              try {
                let proxyUrl = '';
                
                // Determine the correct proxy endpoint based on context
                if (parentDeliverable && file.id) {
                  proxyUrl = `${API_BASE_URL}/accounts/deliverables/${parentDeliverable.id}/files/${file.id}/preview/`;
                }

                if (proxyUrl) {
                  // Use backend proxy endpoint for CORS-free access
                  fetch(proxyUrl, {
                    headers: {
                      ...(token && { 'Authorization': `Bearer ${token}` }),
                      'Accept': 'application/pdf',
                    },
                  })
                  .then(response => {
                    if (!response.ok) {
                      throw new Error('Failed to fetch PDF through proxy');
                    }
                    return response.blob();
                  })
                  .then(blob => {
                    // Create a proper PDF blob with correct MIME type
                    const pdfBlob = new Blob([blob], { type: 'application/pdf' });
                    const blobUrl = URL.createObjectURL(pdfBlob);
                    
                    // Create a new window with proper PDF viewer HTML
                    const newWindow = window.open('', '_blank', 'noopener,noreferrer,width=1000,height=800');
                    if (newWindow) {
                      newWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <title>${fileName}</title>
                            <meta charset="UTF-8">
                            <style>
                              body { 
                                margin: 0; 
                                padding: 0; 
                                background: #525659;
                                font-family: Arial, sans-serif;
                              }
                              .pdf-container {
                                width: 100%;
                                height: 100vh;
                                display: flex;
                                flex-direction: column;
                              }
                              .pdf-header {
                                background: #323639;
                                color: white;
                                padding: 10px 20px;
                                font-size: 14px;
                                border-bottom: 1px solid #525659;
                              }
                              .pdf-viewer {
                                flex: 1;
                                border: none;
                            width: 100%;
                          }
                          .loading {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            height: 100vh;
                            color: white;
                          }
                        </style>
                      </head>
                      <body>
                        <div class="pdf-container">
                          <div class="pdf-header">
                            📄 ${fileName}
                          </div>
                          <embed 
                            class="pdf-viewer" 
                            src="${blobUrl}" 
                            type="application/pdf"
                            width="100%"
                            height="100%"
                          />
                        </div>
                        <script>
                          // Fallback if embed doesn't work
                          setTimeout(() => {
                            const embed = document.querySelector('embed');
                            if (embed && !embed.offsetHeight) {
                              document.body.innerHTML = \`
                                <div class="loading">
                                  <div>
                                    <h3>PDF Viewer</h3>
                                    <p>Click <a href="${blobUrl}" download="${fileName}" style="color: #4CAF50;">here</a> to download the PDF file.</p>
                                    <p>Or <a href="${blobUrl}" target="_blank" style="color: #4CAF50;">open in new tab</a>.</p>
                                  </div>
                                </div>
                              \`;
                            }
                          }, 2000);
                          
                          // Clean up blob URL when window closes
                          window.addEventListener('beforeunload', () => {
                            URL.revokeObjectURL('${blobUrl}');
                          });
                        </script>
                      </body>
                    </html>
                  `);
                  newWindow.document.close();
                  
                  // Clean up after delay as backup
                  setTimeout(() => URL.revokeObjectURL(blobUrl), 300000); // 5 minutes
                } else {
                  // If popup blocked, create download link
                  const link = document.createElement('a');
                  link.href = blobUrl;
                  link.download = fileName;
                  link.click();
                  setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
                }
              })
              .catch(() => {
                // If proxy fails, try direct signed URL
                if (signedUrl) {
                  window.open(signedUrl, '_blank', 'noopener,noreferrer');
                } else {
                  toast.error('Unable to preview PDF: No valid URL available');
                }
              });
            } else {
              // No proxy available, use direct signed URL
              if (signedUrl) {
                window.open(signedUrl, '_blank', 'noopener,noreferrer');
              } else {
                toast.error('Unable to preview PDF: No valid URL available');
              }
            }
            
            toast.success(`Opening ${fileName} with PDF viewer...`, {
              description: context ? `From: ${context}` : 'PDF file opened in browser',
            });
          } catch (error) {
            // Final fallback: Direct URL
            if (signedUrl) {
              window.open(signedUrl, '_blank', 'noopener,noreferrer');
              toast.info(`Opening ${fileName}...`, {
                description: 'PDF opened directly - may download if viewer fails',
              });
            }
          }
        } else if (extension && ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(extension)) {
          // Direct browser preview for images
          window.open(signedUrl, '_blank', 'noopener,noreferrer');
          toast.success(`Opening ${fileName} in browser...`, {
            description: context ? `From: ${context}` : `${extension.toUpperCase()} image preview`,
          });
        } else if (extension && ['txt', 'md', 'html', 'htm', 'xml', 'json', 'csv'].includes(extension)) {
          // Direct browser preview for text files
          window.open(signedUrl, '_blank', 'noopener,noreferrer');
          toast.success(`Opening ${fileName} in browser...`, {
            description: context ? `From: ${context}` : `${extension.toUpperCase()} file preview`,
          });
        } else if (extension && ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
          // For Office docs, use Google Docs Viewer
          const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(signedUrl)}&embedded=true`;
          window.open(viewerUrl, '_blank', 'noopener,noreferrer');
          toast.success(`Opening ${fileName} with document viewer...`, {
            description: context ? `From: ${context}` : `${extension.toUpperCase()} file via Google Docs Viewer`,
          });
        } else if (extension && ['mp4', 'webm', 'ogg', 'mov'].includes(extension)) {
          // Direct browser preview for videos
          window.open(signedUrl, '_blank', 'noopener,noreferrer');
          toast.success(`Opening ${fileName} in browser...`, {
            description: context ? `From: ${context}` : `${extension.toUpperCase()} video preview`,
          });
        } else {
          // For other files, try direct open (will likely download)
          window.open(signedUrl, '_blank', 'noopener,noreferrer');
          toast.info(`Opening ${fileName}...`, {
            description: 'File will download if browser preview is not supported',
          });
        }
        return;
      }
      
      // If signed URL failed, try API proxy endpoint with deliverable context
      if (file.id && parentDeliverable) {
        const proxyUrl = `${API_BASE_URL}/accounts/deliverables/${parentDeliverable.id}/files/${file.id}/?action=preview`;
        
        if (extension && ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
          // For Office docs via proxy, use Google Docs Viewer
          const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(proxyUrl)}&embedded=true`;
          window.open(viewerUrl, '_blank', 'noopener,noreferrer');
          toast.success(`Opening ${fileName} with document viewer...`, {
            description: context ? `From: ${context}` : `${extension.toUpperCase()} deliverable file via proxy + viewer`,
          });
        } else {
          window.open(proxyUrl, '_blank', 'noopener,noreferrer');
          toast.info(`Opening ${fileName} via API proxy...`, {
            description: context ? `From: ${context}` : 'Using authenticated deliverable proxy',
          });
        }
        return;
      } else if (file.id) {
        // Generic fallback proxy
        const proxyUrl = `${API_BASE_URL}/files/proxy/${file.id}/?filename=${encodeURIComponent(fileName)}`;
        
        if (extension && ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
          const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(proxyUrl)}&embedded=true`;
          window.open(viewerUrl, '_blank', 'noopener,noreferrer');
          toast.success(`Opening ${fileName} with document viewer...`, {
            description: context ? `From: ${context}` : `${extension.toUpperCase()} file via fallback proxy + viewer`,
          });
        } else {
          window.open(proxyUrl, '_blank', 'noopener,noreferrer');
          toast.info(`Opening ${fileName} via fallback proxy...`, {
            description: context ? `From: ${context}` : 'Using generic authenticated proxy',
          });
        }
        return;
      }
      
    } catch (apiError) {
      console.warn('Error getting signed URL, trying direct access:', apiError);
    }
  }
  
  // If URL doesn't contain R2 domain or isn't an authenticated file, try direct access
  if (file.url) {
    if (extension && browserPreviewableTypes.includes(extension)) {
      window.open(file.url, '_blank', 'noopener,noreferrer');
      toast.success(`Opening ${fileName} in browser...`, {
        description: context ? `From: ${context}` : `Direct ${extension?.toUpperCase()} preview`,
      });
    } else {
      window.open(file.url, '_blank', 'noopener,noreferrer');
      toast.info(`Opening ${fileName}...`, {
        description: 'File opened directly',
      });
    }
    return;
  }
  
  // Final fallback - no URL available
  toast.error('Unable to preview file', {
    description: 'No valid file URL or preview method available',
  });
  
} catch (error) {
  console.error('Error previewing file:', error);
  toast.error('Preview failed', {
    description: 'Unable to preview file. Please try downloading instead.',
  });
}
};

  // Enhanced file download handler - creates proper download with auth (same structure as TaskManagement)
  const handleDownloadFile = async (file: any, context?: string) => {
    try {
      const fileName = file.name || '';
      const token = localStorage.getItem('gradhelper_token');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

      // Check if this is a deliverable file with R2 URL that needs authentication
      if (file.url && file.url.includes('cloudflarestorage.com')) {
        // This is an R2 file that needs a signed URL
        try {
          let signedUrlResponse;
          
          // For deliverable files, find the parent deliverable
          let parentDeliverable = null;
          
          // Find which deliverable this file belongs to
          for (const deliverable of deliverables) {
            if (deliverable.files && deliverable.files.some((delivFile: any) => delivFile.id === file.id)) {
              parentDeliverable = deliverable;
              break;
            }
          }
          
          if (file.id && parentDeliverable) {
            // Use deliverable file endpoint
            const deliverableFileUrl = `${API_BASE_URL}/accounts/deliverables/${parentDeliverable.id}/files/${file.id}/?action=download`;
            signedUrlResponse = await fetch(deliverableFileUrl, {
              headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
              },
            });
          } else if (file.id) {
            // Fallback to generic endpoints if deliverable context is not available
            signedUrlResponse = await fetch(`${API_BASE_URL}/files/${file.id}/url/`, {
              headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
              },
            });
          }

          let signedUrl: string | null = null;
          if (signedUrlResponse && signedUrlResponse.ok) {
            const data = await signedUrlResponse.json();
            signedUrl = data.download_url || data.url || data.downloadUrl || data.previewUrl || data.signed_url;
          }
          
          if (signedUrl) {
            // Create a temporary link and trigger download
            const link = document.createElement('a');
            link.href = signedUrl;
            link.download = fileName;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            toast.success(`Downloading ${fileName}...`, {
              description: context ? `From: ${context}` : 'Download started',
            });
            return;
          }
          
          // If signed URL failed, try API proxy endpoint
          if (file.id && parentDeliverable) {
            const proxyUrl = `${API_BASE_URL}/accounts/deliverables/${parentDeliverable.id}/files/${file.id}/?action=download`;
            
            const link = document.createElement('a');
            link.href = proxyUrl;
            link.download = fileName;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            toast.success(`Downloading ${fileName} via proxy...`, {
              description: context ? `From: ${context}` : 'Using authenticated deliverable proxy',
            });
            return;
          } else if (file.id) {
            // Generic fallback proxy
            const proxyUrl = `${API_BASE_URL}/files/proxy/${file.id}/?filename=${encodeURIComponent(fileName)}&action=download`;
            
            const link = document.createElement('a');
            link.href = proxyUrl;
            link.download = fileName;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            toast.success(`Downloading ${fileName} via fallback proxy...`, {
              description: context ? `From: ${context}` : 'Using generic authenticated proxy',
            });
            return;
          }
          
        } catch (apiError) {
          console.warn('Error getting download URL, trying direct access:', apiError);
        }
      }
      
      // If URL doesn't contain R2 domain or isn't an authenticated file, try direct download
      if (file.url) {
        const link = document.createElement('a');
        link.href = file.url;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success(`Downloading ${fileName}...`, {
          description: context ? `From: ${context}` : 'Direct download',
        });
        return;
      }
      
      // Final fallback - no URL available
      toast.error('Unable to download file', {
        description: 'No valid download URL available',
      });
      
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Download failed', {
        description: 'Unable to download file. Please try again.',
      });
    }
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

  // Admin deliverable status update
  const handleAdminStatusUpdate = async (deliverable: any, newStatus: string) => {
    try {
      setLoading(true);
      
      const response = await taskService.updateAdminDeliverableStatus(deliverable.id, newStatus as Deliverable['status']);
      
      if (response.success) {
        // Update the deliverable in the local state
        setDeliverables(prev => prev.map(item => 
          item.id === deliverable.id 
            ? { ...item, status: newStatus as Deliverable['status'] }
            : item
        ));

        const statusMessages = {
          pending: 'marked as pending',
          in_progress: 'marked as in progress',
          completed: 'marked as completed',
          under_review: 'marked as under review',
          needs_revision: 'marked as needing revision',
          approved: 'approved successfully',
          rejected: 'rejected',
        };

        toast.success('Deliverable status updated', {
          description: response.message || `"${deliverable.title}" has been ${statusMessages[newStatus as keyof typeof statusMessages] || 'updated'}.`,
        });

        // Add notification
        addNotification({
          type: 'system',
          title: 'Deliverable Status Updated',
          message: `"${deliverable.title}" status changed to ${newStatus.replace('_', ' ')}.`,
          userId: deliverable.task_info?.student.id || user.id,
          userRole: 'student',
          data: { deliverableId: deliverable.id, newStatus }
        });
      }
    } catch (error) {
      console.error('Error updating deliverable status:', error);
      toast.error('Failed to update deliverable status', {
        description: 'Please try again or contact support if the problem persists.'
      });
    } finally {
      setLoading(false);
      setOpenMenuId(null);
    }
  };

  // Handle deliverable approval
  const handleApproveDeliverable = async (deliverable: any) => {
    try {
      setLoading(true);
      
      // For approval, we'll need to call a specific approve endpoint or update both status and approved flag
      // First mark as completed, then we should also set approved to true
      const response = await taskService.updateAdminDeliverableStatus(deliverable.id, 'approved');
      
      if (response.success) {
        // Update the deliverable in the local state with both completed status and approved flag
        setDeliverables(prev => prev.map(item => 
          item.id === deliverable.id 
            ? { ...item, status: 'approved' as Deliverable['status'], approved: true }
            : item
        ));

        toast.success('Deliverable approved successfully', {
          description: `"${deliverable.title}" has been approved and marked as completed.`,
        });

        // Add notification for approval
        addNotification({
          type: 'deliverable_approved',
          title: 'Deliverable Approved',
          message: `Your deliverable "${deliverable.title}" has been approved!`,
          userId: deliverable.task_info?.student.id || user.id,
          userRole: 'student',
          data: { deliverableId: deliverable.id, approved: true }
        });
      }
    } catch (error) {
      console.error('Error approving deliverable:', error);
      toast.error('Failed to approve deliverable', {
        description: 'Please try again or contact support if the problem persists.'
      });
    } finally {
      setLoading(false);
      setOpenMenuId(null);
    }
  };

  // Handle deliverable rejection
  const handleRejectDeliverable = async (deliverable: any) => {
    try {
      setLoading(true);
      
      // For rejection, we'll mark the deliverable as needs_revision or rejected
      const response = await taskService.updateAdminDeliverableStatus(deliverable.id, 'needs_revision');
      
      if (response.success) {
        // Update the deliverable in the local state
        setDeliverables(prev => prev.map(item => 
          item.id === deliverable.id 
            ? { ...item, status: 'needs_revision' as Deliverable['status'], approved: false }
            : item
        ));

        toast.success('Deliverable rejected successfully', {
          description: `"${deliverable.title}" has been marked as needing revision.`,
        });

        // Add notification for rejection
        addNotification({
          type: 'deliverable_rejected',
          title: 'Deliverable Rejected',
          message: `Your deliverable "${deliverable.title}" needs revision. Please check the feedback.`,
          userId: deliverable.task_info?.student.id || user.id,
          userRole: 'student',
          data: { deliverableId: deliverable.id, approved: false }
        });
      }
    } catch (error) {
      console.error('Error rejecting deliverable:', error);
      toast.error('Failed to reject deliverable', {
        description: 'Please try again or contact support if the problem persists.'
      });
    } finally {
      setLoading(false);
      setOpenMenuId(null);
    }
  };

  // Handle menu toggle
  const handleMenuToggle = (deliverableId: string) => {
    if (openMenuId === deliverableId) {
      setOpenMenuId(null);
    } else {
      const buttonElement = buttonRefs.current[deliverableId];
      if (buttonElement) {
        const rect = buttonElement.getBoundingClientRect();
        const dropdownWidth = 224;
        const dropdownHeight = 300; // Approximate height of dropdown with all options
        
        // Default position: below button, aligned to right edge
        let top = rect.bottom + window.scrollY + 4;
        let left = rect.right - dropdownWidth;
        
        // Adjust if dropdown would go off screen to the left
        if (left < 8) {
          left = 8;
        }
        
        // Adjust if dropdown would go off screen to the right
        if (left + dropdownWidth > window.innerWidth - 8) {
          left = window.innerWidth - dropdownWidth - 8;
        }
        
        // Adjust if dropdown would go below viewport
        if (rect.bottom + dropdownHeight > window.innerHeight) {
          top = rect.top + window.scrollY - dropdownHeight - 4;
          // Ensure it doesn't go above viewport
          if (top < 8) {
            top = 8;
          }
        }
        
        setMenuPosition({ top, left });
      }
      setOpenMenuId(deliverableId);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!openMenuId) return;
      
      const target = event.target as Node;
      
      // Check if clicked on a dropdown button
      const clickedOnButton = Object.values(buttonRefs.current).some(buttonRef => 
        buttonRef && buttonRef.contains(target)
      );
      
      // Check if clicked inside the portal menu
      const clickedInsidePortal = portalMenuRef.current && portalMenuRef.current.contains(target);
      
      if (!clickedOnButton && !clickedInsidePortal) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId) {
      // Small delay to prevent immediate closure when opening
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openMenuId]);

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
      deliverable.task_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deliverable.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (userRole === 'admin' && deliverable.task_info?.student.username.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || deliverable.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Enhanced Professional Header */}
      <div className="relative bg-white/90 backdrop-blur-lg border-b border-slate-200/50 sticky top-0 z-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-indigo-600/5 to-purple-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center space-x-5">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur-sm opacity-20"></div>
                <div className="relative p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl">
                  <FileText className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Deliverables Management
                </h1>
                <p className="text-slate-600 mt-2 text-lg">
                  {userRole === 'student' 
                    ? 'Track and manage all your project deliverables with ease'
                    : 'Review and approve deliverables from students efficiently'
                  }
                </p>
              </div>
            </div>
            
            {/* Enhanced Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search deliverables..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 w-72 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                  <select
                    className="pl-10 pr-8 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md appearance-none cursor-pointer"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="under_review">Under Review</option>
                    <option value="completed">Completed</option>
                    <option value="needs_revision">Needs Revision</option>
                    <option value="approved">Approved</option>
                  </select>
                </div>

                {/* Admin-specific filters */}
                {userRole === 'admin' && (
                  <>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                      <select
                        className="pl-10 pr-8 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md appearance-none cursor-pointer"
                        value={adminFilters.user_id}
                        onChange={(e) => setAdminFilters(prev => ({ ...prev, user_id: e.target.value }))}
                      >
                        <option value="all">All Students</option>
                        {/* TODO: Add dynamic user options from API */}
                      </select>
                    </div>

                    <div className="relative group">
                      <CheckSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                      <select
                        className="pl-10 pr-8 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md appearance-none cursor-pointer"
                        value={adminFilters.task_status}
                        onChange={(e) => setAdminFilters(prev => ({ ...prev, task_status: e.target.value }))}
                      >
                        <option value="all">All Task Status</option>
                        <option value="pending">Pending Tasks</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed Tasks</option>
                        <option value="cancelled">Cancelled Tasks</option>
                      </select>
                    </div>

                    <div className="relative group">
                      <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                      <select
                        className="pl-10 pr-8 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md appearance-none cursor-pointer"
                        value={adminFilters.priority}
                        onChange={(e) => setAdminFilters(prev => ({ ...prev, priority: e.target.value }))}
                      >
                        <option value="all">All Priorities</option>
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                        <option value="urgent">Urgent Priority</option>
                      </select>
                    </div>

                    <div className="relative group">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                      <select
                        className="pl-10 pr-8 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md appearance-none cursor-pointer"
                        value={adminFilters.has_deliverables}
                        onChange={(e) => setAdminFilters(prev => ({ ...prev, has_deliverables: e.target.value }))}
                      >
                        <option value="all">All Tasks</option>
                        <option value="true">With Deliverables</option>
                        <option value="false">Without Deliverables</option>
                      </select>
                    </div>
                  </>
                )}
                
                <button
                  onClick={() => fetchDeliverables()}
                  disabled={loading}
                  className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg"
                  title="Refresh deliverables"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-5 h-5" />
                  )}
                  <span className="font-medium">Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-indigo-600 rounded-full animate-spin animate-reverse"></div>
              </div>
              <div className="text-center">
                <p className="text-slate-700 font-semibold text-lg">Loading deliverables...</p>
                <p className="text-slate-500 text-sm mt-1">Please wait while we fetch your data</p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Error State */}
        {error && !loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-10 shadow-xl border border-red-100 max-w-md">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                <div className="absolute inset-0 w-20 h-20 bg-red-500/10 rounded-full animate-ping mx-auto"></div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Oops! Something went wrong</h3>
              <p className="text-slate-600 mb-8 leading-relaxed">{error}</p>
              <button
                onClick={() => fetchDeliverables()}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 mx-auto shadow-lg hover:shadow-xl"
              >
                <RefreshCw className="w-5 h-5" />
                <span className="font-medium">Try Again</span>
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Empty State */}
        {!loading && !error && filteredDeliverables.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-slate-100 max-w-lg">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="w-12 h-12 text-slate-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">No deliverables found</h3>
              <p className="text-slate-600 max-w-md leading-relaxed mb-6">
                {deliverables.length === 0 ? (
                  userRole === 'student' 
                    ? 'You haven\'t created any deliverables yet. Create tasks and add deliverables to get started on your journey!'
                    : 'No deliverables have been assigned to you for review yet. Students will submit their work here.'
                ) : (
                  searchTerm ? 
                    'No deliverables match your search criteria. Try adjusting your filters or search terms.' :
                    statusFilter === 'all' 
                      ? 'No deliverables found with current filters.'
                      : `No deliverables with status "${statusFilter.replace('_', ' ')}" found. Try a different filter.`
                )}
              </p>
              {(searchTerm || statusFilter !== 'all' || 
                (userRole === 'admin' && (adminFilters.user_id !== 'all' || adminFilters.assigned_admin_id !== 'all' || 
                  adminFilters.task_status !== 'all' || adminFilters.priority !== 'all' || adminFilters.has_deliverables !== 'all'))) ? (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    if (userRole === 'admin') {
                      setAdminFilters({
                        user_id: 'all',
                        assigned_admin_id: 'all',
                        task_status: 'all',
                        priority: 'all',
                        has_deliverables: 'all'
                      });
                    }
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                >
                  Clear Filters
                </button>
              ) : null}
            </div>
          </div>
        )}

        {/* Enhanced Professional Deliverables Grid */}
        {!loading && !error && filteredDeliverables.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8" style={{ overflow: 'visible' }}>
            {filteredDeliverables.map((item, index) => (
              <div 
                key={item.id} 
                className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 hover:shadow-2xl hover:border-blue-300/50 transition-all duration-500 hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Enhanced Card Header */}
                <div className="relative p-6 border-b border-slate-100/50 bg-gradient-to-r from-slate-50/50 to-white/50">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-3">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold border shadow-sm ${getStatusBadgeClass(item.status)}`}>
                          {item.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold border shadow-sm ${getPriorityBadgeClass(item.priority || 'medium')}`}>
                          {(item.priority || 'medium').toUpperCase()}
                        </span>
                        {item.approved !== undefined && (
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold border shadow-sm ${
                            item.approved 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {item.approved ? '✅ APPROVED' : '⏳ PENDING APPROVAL'}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2 truncate group-hover:text-blue-600 transition-colors duration-300">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-600 mb-2 font-medium">
                        📋 {item.task_info?.title || item.task_title || 'Unknown Task'}
                      </p>
                      {userRole === 'admin' && item.task_info && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm text-slate-500 bg-slate-50 rounded-lg px-3 py-1.5">
                            <User className="w-4 h-4" />
                            <span className="font-medium">{item.task_info.student.username}</span>
                            <span className="text-xs text-slate-400">({item.task_info.student.email})</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="flex items-center space-x-1">
                              <CheckSquare className="w-3 h-3" />
                              <span>Task: {item.task_info.status.replace('_', ' ')}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(item.task_info.deadline).toLocaleDateString()}</span>
                            </span>
                          </div>
                          {item.task_info.assignedAdmin && (
                            <div className="text-xs text-slate-400 flex items-center space-x-1">
                              <span>Assigned to: {item.task_info.assignedAdmin.username}</span>
                            </div>
                          )}
                        </div>
                      )}
                      {userRole === 'admin' && !item.task_info && item.student && (
                        <div className="flex items-center space-x-2 text-sm text-slate-500 bg-slate-50 rounded-lg px-3 py-1.5">
                          <User className="w-4 h-4" />
                          <span className="font-medium">{item.student.name}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEditDeliverable(item)}
                        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
                        title="Edit deliverable"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDeliverable(item)}
                        className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
                        title="Delete deliverable"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Enhanced Card Content */}
                <div className="p-6 space-y-5">
                  {/* Description */}
                  {item.description && (
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-xl p-4">
                      <p className="text-sm text-slate-700 leading-relaxed line-clamp-3">
                        {item.description}
                      </p>
                    </div>
                  )}

                  {/* Enhanced Files Section */}
                  {item.files && item.files.length > 0 && (
                    <div className="bg-white border border-slate-100 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="p-1.5 bg-blue-100 rounded-lg">
                          <Paperclip className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-semibold text-slate-800">
                          {item.files.length} Attachment{item.files.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {item.files.slice(0, 2).map((file, fileIndex) => (
                          <div key={fileIndex} className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-blue-50/20 rounded-lg border border-slate-100 hover:border-blue-200 transition-all duration-200">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className="p-1.5 bg-white rounded-lg shadow-sm">
                                <FileText className="w-4 h-4 text-slate-500" />
                              </div>
                              <span className="text-sm text-slate-700 font-medium truncate">
                                {file.name || 'Unknown File'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <button 
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200"
                                onClick={() => handleDownloadFile(file, 'deliverable files')}
                                title="Download file"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button 
                                className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-100 rounded-lg transition-all duration-200"
                                onClick={() => handlePreviewFile(file, 'deliverable files')}
                                title="Preview file"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {item.files.length > 2 && (
                          <div className="text-center py-2">
                            <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                              +{item.files.length - 2} more files
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Enhanced Metadata */}
                  <div className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-indigo-50/30 rounded-xl p-4">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-2 text-slate-600">
                        <div className="p-1.5 bg-blue-100 rounded-lg">
                          <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium">
                          {(item as any).submittedAt 
                            ? `Submitted: ${new Date((item as any).submittedAt).toLocaleDateString()}`
                            : item.dueDate 
                            ? `Due: ${new Date(item.dueDate).toLocaleDateString()}`
                            : 'No due date'
                          }
                        </span>
                      </div>
                      {(item as any).estimatedHours && (
                        <div className="flex items-center space-x-2 text-slate-600">
                          <div className="p-1.5 bg-green-100 rounded-lg">
                            <Clock className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="font-medium">{(item as any).estimatedHours}h</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Feedback */}
                  {(item as any).feedback && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="p-1.5 bg-amber-100 rounded-lg">
                          <Star className="w-4 h-4 text-amber-600" />
                        </div>
                        <h4 className="text-sm font-semibold text-amber-800">Feedback</h4>
                      </div>
                      <p className="text-sm text-amber-700 leading-relaxed">{(item as any).feedback}</p>
                    </div>
                  )}
                </div>

                {/* Enhanced Card Footer - Actions */}
                <div className="px-6 py-4 bg-gradient-to-r from-slate-50/80 to-white/80 border-t border-slate-100/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-wrap gap-2">
                      {userRole === 'admin' && (
                        <>
                          {item.status === 'under_review' && (
                            <>
                              <button 
                                className="flex items-center space-x-2 px-4 py-2.5 text-sm bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
                                onClick={() => handleAdminStatusUpdate(item, 'needs_revision')}
                              >
                                <X className="w-4 h-4" />
                                <span>Reject</span>
                              </button>
                              <button 
                                className="flex items-center space-x-2 px-4 py-2.5 text-sm bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
                                onClick={() => handleAdminStatusUpdate(item, 'approved')}
                              >
                                <CheckSquare className="w-4 h-4" />
                                <span>Approve</span>
                              </button>
                            </>
                          )}
                          {item.status === 'completed' && (
                            <button 
                              className="flex items-center space-x-2 px-4 py-2.5 text-sm bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
                              onClick={() => handleAdminStatusUpdate(item, 'needs_revision')}
                            >
                              <Edit3 className="w-4 h-4" />
                              <span>Request Changes</span>
                            </button>
                          )}
                          {item.status === 'needs_revision' && (
                            <button 
                              className="flex items-center space-x-2 px-4 py-2.5 text-sm bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
                              onClick={() => handleAdminStatusUpdate(item, 'completed')}
                            >
                              <CheckSquare className="w-4 h-4" />
                              <span>Mark Complete</span>
                            </button>
                          )}
                        </>
                      )}
                      {userRole === 'student' && item.status === 'needs_revision' && (
                        <button className="flex items-center space-x-2 px-4 py-2.5 text-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium">
                          <FileText className="w-4 h-4" />
                          <span>Resubmit</span>
                        </button>
                      )}
                    </div>
                    
                    {/* Admin Status Dropdown */}
                    {userRole === 'admin' && (
                      <div className="relative">
                        <button 
                          ref={(el) => {
                            if (el) {
                              buttonRefs.current[item.id.toString()] = el;
                            }
                          }}
                          className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleMenuToggle(item.id.toString());
                          }}
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                        

                      </div>
                    )}
                    
                    {/* Student Menu - Keep simple for now */}
                    {userRole === 'student' && (
                      <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    )}
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

      {/* Portal-based dropdown menu */}
      {openMenuId && menuPosition && createPortal(
        <div 
          ref={portalMenuRef}
          className="fixed bg-white rounded-xl shadow-2xl border border-slate-200/80 py-2 z-[9999] backdrop-blur-sm"
          style={{
            left: `${menuPosition.left}px`,
            top: `${menuPosition.top}px`,
            width: '224px',
            maxHeight: '320px',
            overflowY: 'auto'
          }}
        >
          <div className="px-4 py-3 border-b border-slate-100/80 bg-gradient-to-r from-slate-50/50 to-blue-50/30">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Update Status
            </p>
          </div>
          
          {(() => {
            const currentItem = filteredDeliverables.find(item => item.id.toString() === openMenuId);
            if (!currentItem) return null;

            return (
              <>
                {currentItem.status !== 'pending' && (
                  <button
                    className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50/80 flex items-center space-x-3 transition-all duration-200 hover:translate-x-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      handleAdminStatusUpdate(currentItem, 'pending');
                    }}
                  >
                    <div className="w-3 h-3 bg-gray-400 rounded-full shadow-sm"></div>
                    <span className="font-medium">Mark as Pending</span>
                  </button>
                )}
                
                {currentItem.status !== 'in_progress' && (
                  <button
                    className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-yellow-50/80 flex items-center space-x-3 transition-all duration-200 hover:translate-x-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      handleAdminStatusUpdate(currentItem, 'in_progress');
                    }}
                  >
                    <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-sm"></div>
                    <span className="font-medium">Mark as In Progress</span>
                  </button>
                )}
                
                {currentItem.status !== 'under_review' && (
                  <button
                    className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-blue-50/80 flex items-center space-x-3 transition-all duration-200 hover:translate-x-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      handleAdminStatusUpdate(currentItem, 'under_review');
                    }}
                  >
                    <div className="w-3 h-3 bg-blue-400 rounded-full shadow-sm"></div>
                    <span className="font-medium">Mark as Under Review</span>
                  </button>
                )}
                
                {currentItem.status !== 'completed' && (
                  <button
                    className="w-full text-left px-4 py-3 text-sm text-green-700 hover:bg-green-50/80 flex items-center space-x-3 transition-all duration-200 hover:translate-x-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      handleAdminStatusUpdate(currentItem, 'completed');
                    }}
                  >
                    <div className="w-3 h-3 bg-green-400 rounded-full shadow-sm"></div>
                    <span className="font-medium">Mark as Completed</span>
                  </button>
                )}

                {/* Approve Option - Sets deliverable as completed and approved */}
                {(currentItem.status === 'under_review' || currentItem.status === 'completed') && !currentItem.approved && (
                  <div className="border-t border-slate-100/60 mt-1 pt-1">
                    <button
                      className="w-full text-left px-4 py-3 text-sm text-green-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100/50 flex items-center space-x-3 transition-all duration-200 font-medium hover:translate-x-1"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
  
                        handleApproveDeliverable(currentItem);
                      }}
                    >
                      <div className="flex items-center justify-center w-5 h-5 bg-gradient-to-r from-green-100 to-green-200 rounded-full shadow-sm">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="font-semibold text-green-800">✨ Approve Deliverable</span>
                    </button>
                  </div>
                )}

                {/* Reject Option - Sets deliverable as needs_revision */}
                {(currentItem.status === 'under_review' || currentItem.status === 'completed') && (
                  <div className="border-t border-slate-100/60 mt-1 pt-1">
                    <button
                      className="w-full text-left px-4 py-3 text-sm text-red-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100/50 flex items-center space-x-3 transition-all duration-200 font-medium hover:translate-x-1"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
  
                        handleRejectDeliverable(currentItem);
                      }}
                    >
                      <div className="flex items-center justify-center w-5 h-5 bg-gradient-to-r from-red-100 to-red-200 rounded-full shadow-sm">
                        <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="font-semibold text-red-800">❌ Reject Deliverable</span>
                    </button>
                  </div>
                )}
                
                {currentItem.status !== 'needs_revision' && (
                  <button
                    className="w-full text-left px-4 py-3 text-sm text-orange-700 hover:bg-orange-50/80 flex items-center space-x-3 transition-all duration-200 hover:translate-x-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      handleAdminStatusUpdate(currentItem, 'rejected');
                    }}
                  >
                    <div className="w-3 h-3 bg-orange-400 rounded-full shadow-sm"></div>
                    <span className="font-medium">Reject Deliverable</span>
                  </button>
                )}
              </>
            );
          })()}
        </div>,
        document.body
      )}
      </div>
    </div>
  );
}
