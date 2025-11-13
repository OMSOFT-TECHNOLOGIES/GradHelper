import { useState, useMemo } from 'react';
import { X, Search, ChevronDown } from 'lucide-react';

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

  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleTaskSelect = (task: any) => {
    setFormData(prev => ({
      ...prev,
      taskId: task.id,
      taskTitle: task.title,
      student: task.student,
      studentId: task.studentId
    }));
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const filteredTasks = useMemo(() => {
    if (!searchTerm) return availableTasks;
    
    return availableTasks.filter(task => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.subject?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableTasks, searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.taskId) {
      alert('Please select a task before creating the bill.');
      return;
    }
    
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
                <div style={{ position: 'relative' }}>
                  {/* Selected task display or search input */}
                  {formData.taskId ? (
                    <div 
                      className="form-input"
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        backgroundColor: '#f8f9fa'
                      }}
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          taskId: '',
                          taskTitle: '',
                          student: '',
                          studentId: ''
                        }));
                        setIsDropdownOpen(true);
                      }}
                    >
                      <span>{formData.taskTitle} - {formData.student}</span>
                      <X className="w-4 h-4 text-gray-500" />
                    </div>
                  ) : (
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Search tasks by title, student, or subject..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setIsDropdownOpen(true);
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        style={{ paddingLeft: '40px', paddingRight: '40px' }}
                      />
                      <Search className="w-4 h-4 text-gray-400" style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)'
                      }} />
                      <ChevronDown 
                        className="w-4 h-4 text-gray-400"
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          cursor: 'pointer'
                        }}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      />
                    </div>
                  )}

                  {/* Dropdown list */}
                  {isDropdownOpen && !formData.taskId && (
                    <div className="searchable-dropdown-list">
                      {filteredTasks.length === 0 ? (
                        <div className="searchable-dropdown-empty">
                          {searchTerm ? 'No tasks found matching your search' : 'No tasks available'}
                        </div>
                      ) : (
                        filteredTasks.map(task => (
                          <div
                            key={task.id}
                            className="searchable-dropdown-item"
                            onClick={() => handleTaskSelect(task)}
                          >
                            <div className="searchable-dropdown-item-title">
                              {task.title}
                            </div>
                            <div className="searchable-dropdown-item-meta">
                              Student: {task.student} • Subject: {task.subject || 'Not specified'}
                            </div>
                            {task.description && (
                              <div className="searchable-dropdown-item-description">
                                {task.description}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Click outside handler */}
                {isDropdownOpen && (
                  <div
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 40
                    }}
                    onClick={() => setIsDropdownOpen(false)}
                  />
                )}
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