import { useState } from 'react';
import { 
  Plus, 
  FileText, 
  Calendar, 
  Upload, 
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { taskService } from '../services/taskService';
import { toast } from "sonner";

interface AddDeliverableProps {
  taskId: string;
  taskTitle: string;
  onClose: () => void;
  onAdd: (deliverable: any) => void;
}

export function AddDeliverable({ taskId, taskTitle, onClose, onAdd }: AddDeliverableProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    estimatedHours: '',
    requirements: '',
    files: [] as File[]
  });

  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim() || !formData.description.trim() || !formData.dueDate) {
      toast.error('Missing required fields', {
        description: 'Please fill in title, description, and due date'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Show loading toast
      toast.loading('Adding deliverable...', { id: 'add-deliverable' });

      const response = await taskService.addDeliverable(taskId, {
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate,
        priority: formData.priority,
        estimatedHours: formData.estimatedHours,
        requirements: formData.requirements,
        files: formData.files,
      });

      if (response.success) {
        toast.success('Deliverable added successfully!', {
          id: 'add-deliverable',
          description: `"${formData.title}" has been added to the task.`
        });
        
        // Call the parent callback with the new deliverable
        onAdd(response.data);
        onClose();
      } else {
        throw new Error('Failed to add deliverable');
      }
    } catch (error) {
      console.error('Error adding deliverable:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to add deliverable';
      
      toast.error('Failed to add deliverable', {
        id: 'add-deliverable',
        description: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...newFiles]
      }));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...newFiles]
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-red-600' }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-white/20 animate-in slide-in-from-bottom-4 duration-500">
        {/* Enhanced Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-purple-600/90 backdrop-blur-sm"></div>
          <div className="relative flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">Create New Deliverable</h2>
                <p className="text-blue-100 text-lg">
                  Adding deliverable for: <span className="font-semibold text-white">{taskTitle}</span>
                </p>
              </div>
            </div>
            <button 
              className="p-3 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 group"
              onClick={onClose}
            >
              <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>
        </div>

        {/* Enhanced Form */}
        <form id="deliverable-form" onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[calc(90vh-200px)] overflow-y-auto custom-scrollbar">
          {/* Deliverable Details Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Deliverable Details</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Deliverable Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                  placeholder="e.g., Literature Review, Code Implementation, Research Report"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="date"
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Priority Level</label>
                <select
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md appearance-none cursor-pointer"
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                >
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Estimated Hours <span className="text-slate-500">(optional)</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="number"
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                    placeholder="e.g., 15"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData({...formData, estimatedHours: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md resize-none"
                rows={4}
                placeholder="Describe what needs to be delivered, key requirements, and any specific instructions..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700">
                Requirements & Specifications <span className="text-slate-500">(optional)</span>
              </label>
              <textarea
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md resize-none"
                rows={3}
                placeholder="List specific requirements, formatting guidelines, word count, etc..."
                value={formData.requirements}
                onChange={(e) => setFormData({...formData, requirements: e.target.value})}
              />
            </div>
          </div>

          {/* Enhanced File Upload Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                <Upload className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Attach Supporting Files</h3>
                <p className="text-slate-600 text-sm">
                  Upload reference materials, templates, or supporting documents
                </p>
              </div>
            </div>

            <div 
              className={`relative border-2 border-dashed transition-all duration-300 rounded-2xl p-8 text-center ${
                dragActive 
                  ? 'border-blue-400 bg-blue-50/50 scale-105' 
                  : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                  dragActive ? 'bg-blue-100 scale-110' : 'bg-slate-100'
                }`}>
                  <Upload className={`w-8 h-8 transition-colors duration-300 ${
                    dragActive ? 'text-blue-600' : 'text-slate-500'
                  }`} />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-700">
                    <span className="text-blue-600 hover:text-blue-700 cursor-pointer">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    PDF, DOC, DOCX, TXT, PNG, JPG, JPEG up to 10MB each
                  </p>
                </div>
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                  onChange={handleFileInput}
                />
              </div>
            </div>

            {formData.files.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-slate-900">
                    Uploaded Files ({formData.files.length})
                  </h4>
                  <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    {(formData.files.reduce((acc, file) => acc + file.size, 0) / 1024 / 1024).toFixed(1)} MB total
                  </span>
                </div>
                <div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar">
                  {formData.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-xl border border-slate-200 hover:border-blue-300 transition-all duration-200 group">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <FileText className="w-5 h-5 text-slate-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{file.name}</p>
                          <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                        onClick={() => removeFile(index)}
                        title="Remove file"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </form>

        {/* Enhanced Footer */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-lg border-t border-slate-200/50 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <AlertCircle className="w-4 h-4" />
              <span>Fields marked with * are required</span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                type="button" 
                className="px-6 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="deliverable-form"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Deliverable...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Create Deliverable
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
      `}</style>
    </div>
  );
}