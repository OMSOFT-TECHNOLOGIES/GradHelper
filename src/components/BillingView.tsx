import { useState } from 'react';
import { useNotifications } from './NotificationContext';
import { CreateBillModal } from './CreateBillModal';
import { CreditCard, Plus } from 'lucide-react';

interface BillingViewProps {
  userRole: 'student' | 'admin';
  user: any;
}

export function BillingView({ userRole, user }: BillingViewProps) {
  const { addNotification } = useNotifications();
  const [showBillModal, setShowBillModal] = useState(false);
  const [bills, setBills] = useState([
    {
      id: 1,
      taskTitle: "Database Design Assignment",
      taskId: "task-2",
      amount: 150,
      status: "paid",
      dueDate: "2025-01-20",
      paidDate: "2025-01-18",
      student: "Sarah Johnson",
      studentId: "student-2",
      description: "Complete database design with ER diagram and normalization"
    },
    {
      id: 2,
      taskTitle: "Machine Learning Research Paper",
      taskId: "task-1",
      amount: 300,
      status: "pending",
      dueDate: "2025-02-01",
      paidDate: null,
      student: "John Smith",
      studentId: "student-1",
      description: "Research paper with literature review and methodology"
    }
  ]);

  const availableTasks = [
    {
      id: "task-1",
      title: "Machine Learning Research Paper",
      student: "John Smith",
      studentId: "student-1"
    },
    {
      id: "task-3",
      title: "Web Development Project",
      student: "Mike Wilson", 
      studentId: "student-3"
    }
  ];

  const handleCreateBill = (billData: any) => {
    const newBill = {
      id: Date.now(),
      ...billData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setBills(prev => [newBill, ...prev]);
    
    // Send notification to student
    addNotification({
      type: 'payment_received',
      title: 'New Bill Created',
      message: `A new bill of $${billData.amount} has been created for "${billData.taskTitle}".`,
      userId: billData.studentId,
      userRole: 'student',
      data: { billId: newBill.id, taskId: billData.taskId }
    });

    setShowBillModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="card-title">Billing</h2>
              <p className="card-description">
                {userRole === 'student' 
                  ? 'View and manage your payment history'
                  : 'Manage student billing and payments'
                }
              </p>
            </div>
            {userRole === 'admin' && (
              <button 
                className="btn btn-primary"
                onClick={() => setShowBillModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Bill
              </button>
            )}
          </div>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            {bills.map((bill) => (
              <div key={bill.id} className="bill-item">
                <div className="bill-header">
                  <div className="bill-info">
                    <h4 className="bill-title">{bill.taskTitle}</h4>
                    {userRole === 'admin' && (
                      <p className="bill-student">Student: {bill.student}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{bill.description}</p>
                    <div className="bill-dates">
                      <span>Due: {new Date(bill.dueDate).toLocaleDateString()}</span>
                      {bill.paidDate && (
                        <span>Paid: {new Date(bill.paidDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="bill-amount-section">
                    <p className="bill-amount">${bill.amount}</p>
                    <span className={`badge ${bill.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                      {bill.status}
                    </span>
                    {bill.status === 'pending' && userRole === 'student' && (
                      <button className="btn btn-sm btn-primary mt-2">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Bill Modal */}
      {showBillModal && (
        <CreateBillModal
          availableTasks={availableTasks}
          onClose={() => setShowBillModal(false)}
          onCreateBill={handleCreateBill}
        />
      )}
    </div>
  );
}