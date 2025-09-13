import { useState } from 'react';
import { 
  Plus, 
  FileText, 
  Calendar, 
  Upload, 
  X,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newDeliverable = {
      id: Date.now(),
      taskId,
      taskTitle,
      ...formData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      submittedAt: null,
      feedback: null
    };

    onAdd(newDeliverable);
    onClose();
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
    <div className="add-deliverable-overlay">
      <div className="add-deliverable-modal">
        <div className="modal-header">
          <div className="modal-title-section">
            <h2>Add Deliverable</h2>
            <p>Create a new deliverable for: <strong>{taskTitle}</strong></p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="deliverable-form">
          <div className="form-section">
            <h3>Deliverable Details</h3>
            
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Deliverable Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Literature Review, Code Implementation"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Due Date</label>
                <div className="input-with-icon">
                  <Calendar className="input-icon" />
                  <input
                    type="date"
                    className="form-input"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-input"
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

              <div className="form-group">
                <label className="form-label">Estimated Hours</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g., 15"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData({...formData, estimatedHours: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="Describe what needs to be delivered, key requirements, and any specific instructions..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Requirements & Specifications</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="List specific requirements, formatting guidelines, word count, etc..."
                value={formData.requirements}
                onChange={(e) => setFormData({...formData, requirements: e.target.value})}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Attach Files</h3>
            <p className="section-description">
              Upload any reference materials, templates, or supporting documents
            </p>

            <div 
              className={`file-upload-area ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="file-upload-content">
                <Upload className="upload-icon" />
                <p className="upload-text">
                  <span>Click to upload</span> or drag and drop
                </p>
                <p className="upload-hint">
                  PDF, DOC, DOCX, TXT, or images up to 10MB each
                </p>
                <input
                  type="file"
                  className="file-input"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                  onChange={handleFileInput}
                />
              </div>
            </div>

            {formData.files.length > 0 && (
              <div className="uploaded-files">
                <h4>Uploaded Files</h4>
                <div className="file-list">
                  {formData.files.map((file, index) => (
                    <div key={index} className="file-item">
                      <FileText className="file-icon" />
                      <div className="file-info">
                        <p className="file-name">{file.name}</p>
                        <p className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button
                        type="button"
                        className="remove-file"
                        onClick={() => removeFile(index)}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Deliverable
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}