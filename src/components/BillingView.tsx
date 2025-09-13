import { useState } from 'react';
import { useNotifications } from './NotificationContext';
import { CreateBillModal } from './CreateBillModal';
import { MockPaymentForm } from './MockPaymentForm';
import { CreditCard, Plus, Loader2 } from 'lucide-react';
import { toast } from "sonner";

interface BillingViewProps {
  userRole: 'student' | 'admin';
  user: any;
}

interface Bill {
  id: number;
  taskTitle: string;
  taskId: string;
  amount: number;
  status: 'paid' | 'pending';
  dueDate: string;
  paidDate: string | null;
  student: string;
  studentId: string;
  description: string;
}

export function BillingView({ userRole, user }: BillingViewProps) {
  const { addNotification } = useNotifications();
  const [showBillModal, setShowBillModal] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [bills, setBills] = useState<Bill[]>([
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
    const newBill: Bill = {
      id: Date.now(),
      ...billData,
      status: 'pending',
      paidDate: null
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

  const handlePayNow = async (bill: Bill) => {
    setIsCreatingPayment(true);
    setSelectedBill(bill);

    try {
      // Show demo mode notification
      addNotification({
        type: 'info',
        title: 'Demo Payment Mode',
        message: 'This is a demonstration of the payment flow. No real charges will be made.',
        userId: user.id,
        userRole: 'student'
      });
      
      // Simulate setup delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setShowPaymentForm(true);
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Payment Error',
        message: error.message || 'Failed to initialize payment. Please try again.',
        userId: user.id,
        userRole: 'student'
      });
      setSelectedBill(null);
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const handlePaymentSuccess = (billId: number) => {
    setBills(prev => prev.map(bill => 
      bill.id === billId 
        ? { ...bill, status: 'paid' as const, paidDate: new Date().toISOString() }
        : bill
    ));
    
    setShowPaymentForm(false);
    setSelectedBill(null);

    addNotification({
      type: 'payment_received',
      title: 'Payment Processed',
      message: 'Your payment has been successfully processed.',
      userId: user.id,
      userRole: 'student'
    });
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
    setSelectedBill(null);
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
                      <button 
                        className="btn btn-sm btn-primary mt-2"
                        onClick={() => handlePayNow(bill)}
                        disabled={isCreatingPayment && selectedBill?.id === bill.id}
                      >
                        {isCreatingPayment && selectedBill?.id === bill.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Setting up...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pay Now
                          </>
                        )}
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

      {/* Payment Form Modal */}
      {showPaymentForm && selectedBill && (
        <div className="payment-modal-overlay">
          <div className="payment-modal">
            <MockPaymentForm
              bill={selectedBill}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
}