import { useState } from 'react';
import { X } from 'lucide-react';

interface CreateBillModalProps {
  availableTasks: any[];
  onClose: () => void;
  onCreateBill: (billData: any) => void;
}

export function CreateBillModal({ availableTasks, onClose, onCreateBill }: CreateBillModalProps) {
  const [formData, setFormData] = useState({
    taskId: '',
    taskTitle: '',
    student: '',
    studentId: '',
    description: '',
    amount: '',
    dueDate: ''
  });

  const handleTaskSelect = (taskId: string) => {
    const task = availableTasks.find(t => t.id === taskId);
    if (task) {
      setFormData(prev => ({
        ...prev,
        taskId: task.id,
        taskTitle: task.title,
        student: task.student,
        studentId: task.studentId
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateBill({
      ...formData,
      amount: parseFloat(formData.amount)
    });
  };

  return (
    <div className="feedback-modal-overlay">
      <div className="feedback-modal" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h3>Create New Bill</h3>
          <button className="modal-close" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-content">
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Select Task</label>
                <select
                  className="form-input"
                  value={formData.taskId}
                  onChange={(e) => handleTaskSelect(e.target.value)}
                  required
                >
                  <option value="">Choose a task...</option>
                  {availableTasks.map(task => (
                    <option key={task.id} value={task.id}>
                      {task.title} - {task.student}
                    </option>
                  ))}
                </select>
              </div>

              {formData.taskId && (
                <>
                  <div className="form-group">
                    <label className="form-label">Student</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.student}
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bill Description</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      placeholder="Describe the work and services provided..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Amount ($)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                      required
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={!formData.taskId}
            >
              Create Bill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}