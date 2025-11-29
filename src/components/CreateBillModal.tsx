import { useState, useMemo } from 'react';
import { X, Search, ChevronDown, DollarSign, User, Calendar, FileText, CheckCircle, Hash } from 'lucide-react';

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
    dueDate: '',
    notes: 'Payment terms and conditions'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreatingBill, setIsCreatingBill] = useState(false);

  // Debug logging
  console.log('CreateBillModal - availableTasks:', availableTasks);
  console.log('CreateBillModal - availableTasks length:', availableTasks?.length);

  const handleTaskSelect = (task: any) => {
    // Safely extract student name
    let studentName = '';
    if (typeof task.student === 'string') {
      studentName = task.student;
    } else if (task.student && typeof task.student === 'object') {
      studentName = task.student.name || task.student.username || 'Unknown Student';
    }

    // Safely extract student ID
    let studentId = '';
    if (typeof task.student === 'object' && task.student?.id) {
      studentId = task.student.id;
    } else if (task.studentId) {
      studentId = task.studentId;
    }

    setFormData(prev => ({
      ...prev,
      taskId: task.id,
      taskTitle: task.title,
      student: studentName,
      studentId: studentId
    }));
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const filteredTasks = useMemo(() => {
    if (!searchTerm) return availableTasks;
    
    return availableTasks.filter(task => {
      const studentName = typeof task.student === 'string' ? task.student : task.student?.name || '';
      return (
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.task_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [availableTasks, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.taskId) {
      alert('Please select a task before creating the bill.');
      return;
    }

    if (!formData.description.trim()) {
      alert('Please provide a bill description.');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    if (!formData.dueDate) {
      alert('Please select a due date.');
      return;
    }
    
    try {
      setIsCreatingBill(true);
      await onCreateBill({
        ...formData,
        amount: parseFloat(formData.amount),
        notes: formData.notes || 'Payment terms and conditions'
      });
    } catch (error) {
      console.error('Error creating bill:', error);
      alert('Failed to create bill. Please try again.');
    } finally {
      setIsCreatingBill(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] h-[800px] overflow-hidden flex flex-col">
        {/* Professional Header with Gradient */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Create New Bill</h2>
                <p className="text-blue-100 text-sm">Generate invoice for completed work</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Professional Form Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 p-6 overflow-y-auto min-h-0">
            <div className="space-y-6">
              {/* Task Selection Section */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 mb-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <label className="text-sm font-semibold text-gray-800">Select Task</label>
                </div>
                <div className="relative">
                  {/* Selected task display */}
                  {formData.taskId ? (
                    <div 
                      className="w-full p-4 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-xl cursor-pointer hover:from-green-100 hover:to-green-200 transition-all duration-200 group"
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
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-green-800">Task Selected</span>
                          </div>
                          <p className="text-sm text-green-700 font-medium">{formData.taskTitle}</p>
                          <p className="text-xs text-green-600">Student: {formData.student || 'Unknown Student'}</p>
                        </div>
                        <X className="w-5 h-5 text-green-600 group-hover:text-green-800 transition-colors" />
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-sm placeholder-gray-500"
                        placeholder="Search tasks by title, student, subject, or task number..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setIsDropdownOpen(true);
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                      />
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <ChevronDown 
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      />
                    </div>
                  )}

                  {/* Enhanced Dropdown List - Always show all tasks */}
                  {isDropdownOpen && !formData.taskId && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl z-[60] max-h-80 overflow-y-auto">
                      {!availableTasks || availableTasks.length === 0 ? (
                        <div className="p-6 text-center">
                          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 font-medium">No tasks available ({availableTasks?.length || 0} tasks loaded)</p>
                          <p className="text-xs text-gray-400 mt-1">Complete some tasks to create bills</p>
                        </div>
                      ) : (
                        <div className="py-2">
                          {/* Show filtered tasks if searching, otherwise show all tasks */}
                          {searchTerm && filteredTasks.length === 0 ? (
                            <div className="p-4 text-center">
                              <p className="text-gray-500 font-medium">No tasks found matching "{searchTerm}"</p>
                              <p className="text-xs text-gray-400 mt-1">Try different search terms or clear search</p>
                            </div>
                          ) : (
                            <>
                              {/* Debug info */}
                              <div className="p-2 text-xs text-gray-400 border-b">
                                Debug: Showing {searchTerm ? filteredTasks.length : availableTasks.length} tasks
                                {searchTerm && ` (filtered from ${availableTasks.length})`}
                              </div>
                              
                              {/* Render tasks */}
                              {(searchTerm ? filteredTasks : availableTasks).map(task => (
                                <div
                                  key={task.id}
                                  className="mx-2 p-4 hover:bg-blue-50 cursor-pointer rounded-lg transition-all duration-200 border-b border-gray-100 last:border-b-0"
                                  onClick={() => handleTaskSelect(task)}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <h4 className="font-medium text-gray-900 truncate">{task.title}</h4>
                                        {task.task_number && (
                                          <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-md border border-blue-300 flex-shrink-0">
                                            {task.task_number}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-1">
                                        <div className="flex items-center space-x-1">
                                          <User className="w-3 h-3" />
                                          <span>{typeof task.student === 'string' ? task.student : task.student?.name || task.student?.username || 'Unknown Student'}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                          <Hash className="w-3 h-3" />
                                          <span>{task.subject || 'Not specified'}</span>
                                        </div>
                                      </div>
                                      {task.description && (
                                        <p className="text-xs text-gray-500 line-clamp-2">
                                          {task.description.length > 120 ? `${task.description.substring(0, 120)}...` : task.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </>
                          )}
                        </div>
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

              {/* Bill Details Section - Only show when task is selected */}
              {formData.taskId && (
                <>
                  {/* Student Information */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 mb-3">
                      <User className="w-5 h-5 text-blue-600" />
                      <label className="text-sm font-semibold text-gray-800">Student Information</label>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{formData.student || 'Unknown Student'}</p>
                      <p className="text-xs text-gray-500">Task: {formData.taskTitle}</p>
                    </div>
                  </div>

                  {/* Bill Description */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 mb-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <label className="text-sm font-semibold text-gray-800">Bill Description</label>
                    </div>
                    <textarea
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-sm resize-none"
                      rows={4}
                      placeholder="Provide a detailed description of the work completed and services provided..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      required
                    />
                    <p className="text-xs text-gray-500">Be specific about deliverables, hours worked, and value provided.</p>
                  </div>

                  {/* Amount and Due Date Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Amount */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 mb-3">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <label className="text-sm font-semibold text-gray-800">Bill Amount</label>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          className="w-full pl-8 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 text-sm"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          value={formData.amount}
                          onChange={(e) => setFormData({...formData, amount: e.target.value})}
                          required
                        />
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    {/* Due Date */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 mb-3">
                        <Calendar className="w-5 h-5 text-orange-600" />
                        <label className="text-sm font-semibold text-gray-800">Due Date</label>
                      </div>
                      <input
                        type="date"
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200 text-sm"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 mb-3">
                      <FileText className="w-5 h-5 text-purple-600" />
                      <label className="text-sm font-semibold text-gray-800">Payment Notes</label>
                    </div>
                    <textarea
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 text-sm resize-none"
                      rows={3}
                      placeholder="Payment terms, conditions, and additional notes..."
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    />
                    <p className="text-xs text-gray-500">Include payment terms, late fees, and other important conditions.</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Professional Action Buttons */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {formData.taskId ? (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Task selected and ready to bill</span>
                  </div>
                ) : (
                  <span>Select a task to create a bill</span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  type="button" 
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 hover:border-gray-400 transition-all duration-200"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                    formData.taskId && !isCreatingBill
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transform hover:-translate-y-0.5' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!formData.taskId || isCreatingBill}
                >
                  {isCreatingBill ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Bill...</span>
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4" />
                      <span>Create Professional Bill</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}