import { useState } from 'react';
import { MessageCircle, Star, MoreHorizontal, UserMinus, UserX, Shield, ShieldCheck } from 'lucide-react';
import { toast } from "sonner";

interface Student {
  id: number;
  name: string;
  email: string;
  avatar: string;
  activeTasks: number;
  completedTasks: number;
  totalSpent: number;
  rating: number;
  status: 'active' | 'suspended' | 'deactivated';
  joinDate: string;
}

interface ConfirmationModal {
  isOpen: boolean;
  type: 'suspend' | 'deactivate' | 'activate' | null;
  student: Student | null;
}

export function StudentsView() {
  const [students, setStudents] = useState<Student[]>([
    {
      id: 1,
      name: "John Smith",
      email: "john@university.edu",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      activeTasks: 2,
      completedTasks: 5,
      totalSpent: 850,
      rating: 4.8,
      status: 'active',
      joinDate: '2024-01-15'
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah@university.edu",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
      activeTasks: 1,
      completedTasks: 8,
      totalSpent: 1200,
      rating: 4.9,
      status: 'active',
      joinDate: '2023-11-22'
    },
    {
      id: 3,
      name: "Mike Wilson",
      email: "mike@university.edu",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      activeTasks: 0,
      completedTasks: 3,
      totalSpent: 450,
      rating: 4.2,
      status: 'suspended',
      joinDate: '2024-02-10'
    }
  ]);

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [confirmationModal, setConfirmationModal] = useState<ConfirmationModal>({
    isOpen: false,
    type: null,
    student: null
  });

  const handleMenuToggle = (studentId: number) => {
    setOpenMenuId(openMenuId === studentId ? null : studentId);
  };

  const handleSuspendStudent = (student: Student) => {
    setConfirmationModal({
      isOpen: true,
      type: 'suspend',
      student
    });
    setOpenMenuId(null);
  };

  const handleDeactivateStudent = (student: Student) => {
    setConfirmationModal({
      isOpen: true,
      type: 'deactivate',
      student
    });
    setOpenMenuId(null);
  };

  const handleActivateStudent = (student: Student) => {
    setConfirmationModal({
      isOpen: true,
      type: 'activate',
      student
    });
    setOpenMenuId(null);
  };

  const handleConfirmAction = () => {
    if (!confirmationModal.student || !confirmationModal.type) return;

    const { student, type } = confirmationModal;
    
    setStudents(prev => prev.map(s => 
      s.id === student.id 
        ? { ...s, status: type === 'activate' ? 'active' : type as 'suspended' | 'deactivated' }
        : s
    ));

    const actionMessages = {
      suspend: `${student.name} has been suspended`,
      deactivate: `${student.name}'s account has been deactivated`,
      activate: `${student.name}'s account has been reactivated`
    };

    const actionDescriptions = {
      suspend: 'The student can no longer post new tasks but can complete existing ones',
      deactivate: 'The student cannot access their account or any services',
      activate: 'The student can now access all features normally'
    };

    toast.success(actionMessages[type], {
      description: actionDescriptions[type]
    });

    setConfirmationModal({ isOpen: false, type: null, student: null });
  };

  const handleCancelAction = () => {
    setConfirmationModal({ isOpen: false, type: null, student: null });
  };

  const getStatusBadgeProps = (status: string) => {
    switch (status) {
      case 'active':
        return { className: 'badge badge-success', text: 'Active' };
      case 'suspended':
        return { className: 'badge badge-warning', text: 'Suspended' };
      case 'deactivated':
        return { className: 'badge badge-danger', text: 'Deactivated' };
      default:
        return { className: 'badge', text: status };
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Students</h2>
          <p className="card-description">Manage student accounts and performance</p>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            {students.map((student) => {
              const statusBadge = getStatusBadgeProps(student.status);
              return (
                <div key={student.id} className="student-item">
                  <div className="student-header">
                    <div className="student-info">
                      <div className="avatar w-10 h-10">
                        <img src={student.avatar} alt={student.name} />
                      </div>
                      <div className="student-details">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <h4>{student.name}</h4>
                          <span className={statusBadge.className}>
                            {statusBadge.text}
                          </span>
                        </div>
                        <p className="student-email">{student.email}</p>
                        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                          Joined: {new Date(student.joinDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="student-stats">
                      <div className="student-stats-row">
                        <span>{student.activeTasks} active</span>
                        <span>{student.completedTasks} completed</span>
                        <span>${student.totalSpent} total</span>
                        <div className="flex items-center gap-1">
                          <Star className="star" />
                          <span>{student.rating}</span>
                        </div>
                      </div>
                      <div className="student-actions">
                        <button className="btn btn-outline btn-sm">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message
                        </button>
                        <button className="btn btn-outline btn-sm">View Tasks</button>
                        
                        <div style={{ position: 'relative' }}>
                          <button 
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleMenuToggle(student.id)}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          
                          {openMenuId === student.id && (
                            <>
                              <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: '0.5rem',
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '0.5rem',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                zIndex: 10,
                                minWidth: '180px',
                                padding: '0.5rem'
                              }}>
                                {student.status === 'active' && (
                                  <>
                                    <button 
                                      className="w-full text-left px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded flex items-center gap-2"
                                      onClick={() => handleSuspendStudent(student)}
                                    >
                                      <UserMinus className="w-4 h-4" />
                                      Suspend Account
                                    </button>
                                    
                                    <button 
                                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center gap-2"
                                      onClick={() => handleDeactivateStudent(student)}
                                    >
                                      <UserX className="w-4 h-4" />
                                      Deactivate Account
                                    </button>
                                  </>
                                )}
                                
                                {(student.status === 'suspended' || student.status === 'deactivated') && (
                                  <button 
                                    className="w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded flex items-center gap-2"
                                    onClick={() => handleActivateStudent(student)}
                                  >
                                    <ShieldCheck className="w-4 h-4" />
                                    Reactivate Account
                                  </button>
                                )}
                                
                                <div style={{ borderTop: '1px solid #e2e8f0', margin: '0.5rem 0' }} />
                                
                                <button 
                                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                                >
                                  <Shield className="w-4 h-4" />
                                  View Details
                                </button>
                              </div>
                              
                              <div
                                style={{
                                  position: 'fixed',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  zIndex: 5
                                }}
                                onClick={() => setOpenMenuId(null)}
                              />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmationModal.isOpen && confirmationModal.student && (
        <div className="feedback-modal-overlay">
          <div className="feedback-modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>
                {confirmationModal.type === 'suspend' && 'Suspend Student Account'}
                {confirmationModal.type === 'deactivate' && 'Deactivate Student Account'}
                {confirmationModal.type === 'activate' && 'Reactivate Student Account'}
              </h3>
            </div>
            
            <div className="modal-content">
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ marginBottom: '1rem' }}>
                  {confirmationModal.type === 'suspend' && (
                    <UserMinus 
                      className="w-12 h-12 mx-auto text-orange-500" 
                      style={{ marginBottom: '1rem' }}
                    />
                  )}
                  {confirmationModal.type === 'deactivate' && (
                    <UserX 
                      className="w-12 h-12 mx-auto text-red-500" 
                      style={{ marginBottom: '1rem' }}
                    />
                  )}
                  {confirmationModal.type === 'activate' && (
                    <ShieldCheck 
                      className="w-12 h-12 mx-auto text-green-500" 
                      style={{ marginBottom: '1rem' }}
                    />
                  )}
                </div>
                
                <p style={{ marginBottom: '1rem', color: '#374151' }}>
                  Are you sure you want to{' '}
                  <strong>
                    {confirmationModal.type === 'activate' ? 'reactivate' : confirmationModal.type}
                  </strong>{' '}
                  <strong>{confirmationModal.student.name}</strong>'s account?
                </p>
                
                <div style={{ 
                  backgroundColor: '#f9fafb', 
                  padding: '0.75rem', 
                  borderRadius: '0.5rem',
                  fontSize: '14px',
                  color: '#6b7280',
                  textAlign: 'left'
                }}>
                  {confirmationModal.type === 'suspend' && (
                    <>
                      <strong>Suspension effects:</strong>
                      <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                        <li>Cannot post new tasks</li>
                        <li>Can complete existing tasks</li>
                        <li>Can access chat and messages</li>
                        <li>Account can be reactivated anytime</li>
                      </ul>
                    </>
                  )}
                  {confirmationModal.type === 'deactivate' && (
                    <>
                      <strong>Deactivation effects:</strong>
                      <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                        <li>Complete loss of account access</li>
                        <li>Cannot login or use services</li>
                        <li>All active tasks will be paused</li>
                        <li>Account can be reactivated by admin</li>
                      </ul>
                    </>
                  )}
                  {confirmationModal.type === 'activate' && (
                    <>
                      <strong>Reactivation effects:</strong>
                      <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                        <li>Full access to all features</li>
                        <li>Can post and manage tasks</li>
                        <li>Previous data will be restored</li>
                        <li>Student will receive notification</li>
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={handleCancelAction}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className={`btn ${
                  confirmationModal.type === 'suspend' ? 'btn-warning' : 
                  confirmationModal.type === 'deactivate' ? 'btn-danger' : 
                  'btn-success'
                }`}
                onClick={handleConfirmAction}
              >
                {confirmationModal.type === 'suspend' && 'Suspend Account'}
                {confirmationModal.type === 'deactivate' && 'Deactivate Account'}
                {confirmationModal.type === 'activate' && 'Reactivate Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}