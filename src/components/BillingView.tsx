import { useState, useEffect } from 'react';
import { useNotifications } from './NotificationContext';
import { CreateBillModal } from './CreateBillModal';
import { MockPaymentForm } from './MockPaymentForm';
import { StripePaymentModal } from './StripePaymentForm';
import { SimplePaymentModal } from './SimplePaymentForm';
import { 
  CreditCard, 
  Plus, 
  Loader2, 
  DollarSign, 
  Calendar, 
  User, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Receipt,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Download,
  FileText,
  Edit,
  Trash2,
  MoreHorizontal,
  X,
  Save
} from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [bills, setBills] = useState<Bill[]>([]);
  const [stripePaymentUrl, setStripePaymentUrl] = useState<string | null>(null);
  
  // New states for admin operations
  const [showBillDetails, setShowBillDetails] = useState(false);
  const [showEditBill, setShowEditBill] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedBillForAction, setSelectedBillForAction] = useState<Bill | null>(null);
  const [editingBill, setEditingBill] = useState<Partial<Bill>>({});
  const [operationLoading, setOperationLoading] = useState(false);
  
  const [availableTasks, setAvailableTasks] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [showPartialPayment, setShowPartialPayment] = useState(false);
  const [partialAmount, setPartialAmount] = useState<string>('');
  const [currentPaymentIntent, setCurrentPaymentIntent] = useState<string | null>(null);
  const [showStripePayment, setShowStripePayment] = useState(false);
  const [currentPaymentData, setCurrentPaymentData] = useState<any>(null);  // Format amount to proper currency display
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Fetch bills from API
  const fetchBills = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('gradhelper_token');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      
      let endpoint = `${API_BASE_URL}/admin/bills/`;
      if (userRole === 'student') {
        // Student endpoint for authenticated user's bills
        endpoint = `${API_BASE_URL}/bills/`;
      }

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      let result;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const htmlText = await response.text();
        console.error('Server returned HTML instead of JSON:', htmlText);
        throw new Error('Server error - received HTML response instead of JSON');
      }
      
      console.log('Bills API Response:', response.status, result);

      if (response.ok) {
        // Handle different response structures
        const rawBillsData = result.results || result.data || result || [];
        const billsArray = Array.isArray(rawBillsData) ? rawBillsData : [];
        
        console.log('Raw bills data:', rawBillsData);
        console.log('Bills array:', billsArray);
        
        // Transform API data to match our Bill interface
        const transformedBills: Bill[] = billsArray.map((bill: any, index: number) => {
          // Parse amount more carefully
          let amount = 0;
          if (typeof bill.amount === 'string') {
            // Remove any currency symbols and parse
            amount = parseFloat(bill.amount.replace(/[^0-9.-]/g, '')) || 0;
          } else if (typeof bill.amount === 'number') {
            amount = bill.amount;
          }
          
          console.log(`Bill ${index}:`, bill, 'Parsed amount:', amount);
          
          return {
            id: Number(bill.id) || Date.now() + index,
            taskTitle: String(bill.taskTitle || bill.task_title || 'Unknown Task'),
            taskId: String(bill.taskId || bill.task_id || ''),
            amount: amount,
            status: (bill.status === 'paid' ? 'paid' : 'pending') as 'paid' | 'pending',
            dueDate: String(bill.dueDate || bill.due_date || new Date().toISOString()),
            paidDate: bill.paidDate || bill.paid_date || null,
            student: String(bill.student || bill.student_name || 'Unknown Student'),
            studentId: String(bill.studentId || bill.student_id || ''),
            description: String(bill.description || bill.notes || 'No description available')
          };
        });
        
        // Remove duplicates based on ID
        const uniqueBills = transformedBills.filter((bill, index, self) => 
          index === self.findIndex(b => b.id === bill.id)
        );
        
        console.log('Transformed bills:', uniqueBills);
        setBills(uniqueBills);
      } else {
        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          body: result
        });
        
        let errorMessage = 'Failed to fetch bills';
        if (result.detail) {
          errorMessage = result.detail;
        } else if (result.message) {
          errorMessage = result.message;
        } else if (result.error) {
          errorMessage = result.error;
        }
        
        throw new Error(errorMessage);
      }
      
    } catch (error) {
      console.error('Bills fetch error:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch bills');
      toast.error('Failed to load bills', {
        description: 'Please check your connection and try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load bills on component mount
  useEffect(() => {
    if (userRole) {
      fetchBills();
    }
  }, [userRole]);

  // Handle payment return from Stripe
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const billId = urlParams.get('bill_id');
    const sessionId = urlParams.get('session_id');
    
    if (paymentStatus === 'success' && billId) {
      // Payment successful - verify with backend
      const billIdNum = parseInt(billId);
      verifyPaymentStatus(billIdNum, sessionId || undefined).then((result) => {
        if (result?.status === 'paid') {
          toast.success('Payment Successful!', {
            description: 'Your payment has been processed and verified successfully.'
          });
        } else {
          toast.success('Payment Successful!', {
            description: 'Your payment has been processed successfully.'
          });
        }
      }).catch(() => {
        // Even if verification fails, payment was successful
        toast.success('Payment Successful!', {
          description: 'Your payment has been processed successfully.'
        });
      });
      
      addNotification({
        type: 'payment_received',
        title: 'Payment Processed',
        message: 'Your payment has been successfully processed.',
        userId: user.id,
        userRole: 'student'
      });
      
      // Refresh bills to get updated status
      setTimeout(() => {
        fetchBills();
      }, 1000);
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
    } else if (paymentStatus === 'cancelled' && billId) {
      // Payment cancelled
      toast.info('Payment Cancelled', {
        description: 'Your payment was cancelled. You can try again anytime.'
      });
      
      addNotification({
        type: 'info',
        title: 'Payment Cancelled',
        message: 'Your payment was cancelled. No charges were made.',
        userId: user.id,
        userRole: 'student'
      });
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user.id, userRole]);

  // Refresh bills function
  const handleRefresh = () => {
    fetchBills();
  };

  // Get bill details by ID
  const getBillDetails = async (billId: number) => {
    try {
      setOperationLoading(true);
      const token = localStorage.getItem('gradhelper_token');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${API_BASE_URL}/admin/bills/${billId}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      let result;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        throw new Error('Server returned non-JSON response');
      }

      if (response.ok) {
        return result;
      } else {
        throw new Error(result.detail || result.message || 'Failed to fetch bill details');
      }
    } catch (error) {
      console.error('Get bill details error:', error);
      toast.error('Failed to fetch bill details', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      throw error;
    } finally {
      setOperationLoading(false);
    }
  };

  // Update bill
  const updateBill = async (billId: number, updateData: Partial<Bill>) => {
    try {
      setOperationLoading(true);
      const token = localStorage.getItem('gradhelper_token');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${API_BASE_URL}/admin/bills/${billId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(updateData),
      });

      let result;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        throw new Error('Server returned non-JSON response');
      }

      if (response.ok) {
        await fetchBills(); // Refresh the bills list
        toast.success('Bill updated successfully');
        return result;
      } else {
        throw new Error(result.detail || result.message || 'Failed to update bill');
      }
    } catch (error) {
      console.error('Update bill error:', error);
      toast.error('Failed to update bill', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      throw error;
    } finally {
      setOperationLoading(false);
    }
  };

  // Update bill status only
  const updateBillStatus = async (billId: number, status: 'paid' | 'pending') => {
    try {
      setOperationLoading(true);
      const token = localStorage.getItem('gradhelper_token');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${API_BASE_URL}/admin/bills/${billId}/status/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ status }),
      });

      let result;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        throw new Error('Server returned non-JSON response');
      }

      if (response.ok) {
        await fetchBills(); // Refresh the bills list
        toast.success(`Bill status updated to ${status}`);
        return result;
      } else {
        throw new Error(result.detail || result.message || 'Failed to update bill status');
      }
    } catch (error) {
      console.error('Update bill status error:', error);
      toast.error('Failed to update bill status', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      throw error;
    } finally {
      setOperationLoading(false);
    }
  };

  // Delete bill
  const deleteBill = async (billId: number) => {
    try {
      setOperationLoading(true);
      const token = localStorage.getItem('gradhelper_token');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${API_BASE_URL}/admin/bills/${billId}/`, {
        method: 'DELETE',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        await fetchBills(); // Refresh the bills list
        toast.success('Bill deleted successfully');
      } else {
        let result;
        try {
          result = await response.json();
        } catch {
          result = { message: 'Failed to delete bill' };
        }
        throw new Error(result.detail || result.message || 'Failed to delete bill');
      }
    } catch (error) {
      console.error('Delete bill error:', error);
      toast.error('Failed to delete bill', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      throw error;
    } finally {
      setOperationLoading(false);
    }
  };

  // Fetch payment history for student
  const fetchPaymentHistory = async (page: number = 1, limit: number = 10) => {
    try {
      const token = localStorage.getItem('gradhelper_token');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${API_BASE_URL}/payments/history/?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data; // Should contain payments array and pagination info
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch payment history');
      }
    } catch (error) {
      console.error('Payment history fetch error:', error);
      throw error;
    }
  };

  // Verify payment status with backend
  const verifyPaymentStatus = async (billId: number, sessionId?: string) => {
    try {
      const token = localStorage.getItem('gradhelper_token');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${API_BASE_URL}/payments/verify-payment/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          billId: billId,
          ...(sessionId && { sessionId })
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Payment verification result:', result);
        
        if (result.status === 'paid') {
          // Update local bill status
          setBills(prev => prev.map(bill => 
            bill.id === billId 
              ? { ...bill, status: 'paid' as const, paidDate: new Date().toISOString() }
              : bill
          ));
        }
        
        return result;
      } else {
        console.error('Payment verification failed:', response.status);
      }
    } catch (error) {
      console.error('Payment verification error:', error);
    }
  };

  // Handler functions for UI actions
  const handleViewBill = async (bill: Bill) => {
    try {
      setSelectedBillForAction(bill);
      const detailedBill = await getBillDetails(bill.id);
      console.log('Detailed bill:', detailedBill);
      setShowBillDetails(true);
    } catch (error) {
      // Error already handled in getBillDetails
    }
  };

  const handleEditBill = (bill: Bill) => {
    setSelectedBillForAction(bill);
    setEditingBill({
      taskTitle: bill.taskTitle,
      amount: bill.amount,
      dueDate: bill.dueDate.split('T')[0], // Format for date input
      status: bill.status,
      description: bill.description
    });
    setShowEditBill(true);
  };

  const handleDeleteBill = (bill: Bill) => {
    setSelectedBillForAction(bill);
    setShowDeleteConfirm(true);
  };

  const handleStatusToggle = async (bill: Bill) => {
    const newStatus = bill.status === 'paid' ? 'pending' : 'paid';
    await updateBillStatus(bill.id, newStatus);
  };

  const confirmDelete = async () => {
    if (selectedBillForAction) {
      await deleteBill(selectedBillForAction.id);
      setShowDeleteConfirm(false);
      setSelectedBillForAction(null);
    }
  };

  const submitEditBill = async () => {
    if (selectedBillForAction && editingBill) {
      await updateBill(selectedBillForAction.id, editingBill);
      setShowEditBill(false);
      setSelectedBillForAction(null);
      setEditingBill({});
    }
  };

  const handleCreateBill = async (billData: any) => {
    try {
      // Send notification to student
      addNotification({
        type: 'payment_received',
        title: 'New Bill Created',
        message: `A new bill of ${formatAmount(billData.amount)} has been created for "${billData.taskTitle}".`,
        userId: billData.studentId,
        userRole: 'student',
        data: { billId: billData.id, taskId: billData.taskId }
      });

      setShowBillModal(false);
      
      // Refresh bills to get updated data from server
      await fetchBills();
      
      toast.success('Bill created successfully', {
        description: `Bill for "${billData.taskTitle}" has been created.`
      });
    } catch (error) {
      console.error('Error after bill creation:', error);
      toast.error('Bill created but failed to refresh list', {
        description: 'Please refresh the page to see the latest bills.'
      });
    }
  };

  // Create Payment Intent for Stripe integration
  const createPaymentIntent = async (billId: number, amount?: number) => {
    try {
      const token = localStorage.getItem('gradhelper_token');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${API_BASE_URL}/bills/${billId}/payment/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          ...(amount && { amount: amount })
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data; // Should contain client_secret and payment_intent_id
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment intent');
      }
    } catch (error) {
      console.error('Payment intent creation error:', error);
      throw error;
    }
  };

  // Check payment status
  const checkPaymentStatus = async (paymentIntentId: string) => {
    try {
      const token = localStorage.getItem('gradhelper_token');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${API_BASE_URL}/payments/${paymentIntentId}/status/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data; // Should contain status and payment details
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to check payment status');
      }
    } catch (error) {
      console.error('Payment status check error:', error);
      throw error;
    }
  };

  const handlePayNow = async (bill: Bill, partialAmount?: number) => {
    setIsCreatingPayment(true);
    setSelectedBill(bill);

    try {
      // Create payment intent using the new endpoint
      const paymentData = await createPaymentIntent(bill.id, partialAmount);
      
      if (paymentData.client_secret && paymentData.payment_intent_id) {
        // Store payment intent ID for tracking
        localStorage.setItem('current_payment_intent', paymentData.payment_intent_id);
        setCurrentPaymentIntent(paymentData.payment_intent_id);
        
        // Store payment data and show Stripe payment form
        setCurrentPaymentData(paymentData);
        setShowStripePayment(true);
        
        toast.success('Payment ready - complete your payment');
        
        // Show payment details in console for debugging
        console.log('Payment Intent created:', {
          payment_intent_id: paymentData.payment_intent_id,
          client_secret: paymentData.client_secret,
          amount: paymentData.amount,
          remaining_amount: paymentData.remaining_amount
        });
        
      } else {
        throw new Error('No client secret received from server');
      }
      
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      
      toast.error('Payment initialization failed', {
        description: error.message || 'Unable to start payment process. Please try again.'
      });
      
      addNotification({
        type: 'system',
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

  // Handle partial payment
  const handlePartialPayment = async () => {
    if (!selectedBill || !partialAmount) {
      toast.error('Please enter a valid amount');
      return;
    }

    const amount = parseFloat(partialAmount);
    if (amount <= 0 || amount > parseFloat(selectedBill.amount.toString())) {
      toast.error('Invalid payment amount');
      return;
    }

    await handlePayNow(selectedBill, amount);
    setShowPartialPayment(false);
    setPartialAmount('');
  };

  // Load payment history
  const loadPaymentHistory = async () => {
    try {
      setLoading(true);
      const historyData = await fetchPaymentHistory();
      setPaymentHistory(historyData?.payments || []);
      setShowPaymentHistory(true);
    } catch (error) {
      console.error('Failed to load payment history:', error);
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  // Test payment confirmation (for when Stripe Elements fail)
  const handleTestPaymentConfirmation = async (bill: Bill, paymentIntentId: string) => {
    try {
      setOperationLoading(true);
      
      // Simulate payment confirmation by checking status
      const status = await checkPaymentStatus(paymentIntentId);
      
      if (status && (status.status === 'succeeded' || status.status === 'requires_confirmation')) {
        toast.success('Payment test completed successfully!');
        
        addNotification({
          type: 'payment_received',
          title: 'Test Payment Completed',
          message: `Test payment for ${bill.taskTitle} was processed.`,
          userId: user.id,
          userRole: 'student'
        });
        
        // Clean up
        localStorage.removeItem('current_payment_intent');
        setCurrentPaymentIntent(null);
        setShowStripePayment(false);
        setCurrentPaymentData(null);
        
        // Refresh bills
        fetchBills();
      } else {
        toast.info(`Payment status: ${status?.status || 'unknown'}`);
      }
    } catch (error) {
      console.error('Test payment error:', error);
      toast.error('Test payment failed');
    } finally {
      setOperationLoading(false);
    }
  };

  // Handle successful Stripe payment
  const handleStripePaymentSuccess = async (paymentIntentId: string) => {
    try {
      setShowStripePayment(false);
      setCurrentPaymentData(null);
      
      // Verify payment status
      const status = await checkPaymentStatus(paymentIntentId);
      
      if (status.status === 'succeeded') {
        toast.success('Payment completed successfully!');
        
        addNotification({
          type: 'payment_received',
          title: 'Payment Completed',
          message: `Payment of ${formatAmount(status.amount)} was processed successfully.`,
          userId: user.id,
          userRole: 'student'
        });
        
        // Clean up
        localStorage.removeItem('current_payment_intent');
        setCurrentPaymentIntent(null);
        
        // Refresh bills
        fetchBills();
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error('Payment completed but verification failed. Please refresh the page.');
    }
  };

  // Handle Stripe payment cancellation
  const handleStripePaymentCancel = () => {
    setShowStripePayment(false);
    setCurrentPaymentData(null);
    setSelectedBill(null);
    toast.info('Payment cancelled');
  };

  // Handle Stripe payment error
  const handleStripePaymentError = (error: string) => {
    console.error('Stripe payment error:', error);
    
    addNotification({
      type: 'system',
      title: 'Payment Error',
      message: error || 'Payment processing failed. Please try again.',
      userId: user.id,
      userRole: 'student'
    });
  };

  // Periodic payment status check for current payment intent
  useEffect(() => {
    const paymentIntentId = localStorage.getItem('current_payment_intent');
    if (paymentIntentId) {
      setCurrentPaymentIntent(paymentIntentId);
      
      const checkStatus = async () => {
        try {
          const status = await checkPaymentStatus(paymentIntentId);
          console.log('Payment status check:', status);
          
          if (status.status === 'succeeded') {
            localStorage.removeItem('current_payment_intent');
            setCurrentPaymentIntent(null);
            
            toast.success('Payment completed successfully!');
            fetchBills();
          }
        } catch (error) {
          console.error('Payment status check failed:', error);
        }
      };
      
      // Check immediately and then every 5 seconds
      checkStatus();
      const interval = setInterval(checkStatus, 5000);
      
      // Clean up after 5 minutes
      const cleanup = setTimeout(() => {
        clearInterval(interval);
        localStorage.removeItem('current_payment_intent');
        setCurrentPaymentIntent(null);
      }, 5 * 60 * 1000);
      
      return () => {
        clearInterval(interval);
        clearTimeout(cleanup);
      };
    }
  }, []);

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

  // Calculate billing statistics
  const getBillingStats = () => {
    const filteredBills = userRole === 'admin' ? bills : bills.filter(bill => bill.studentId === user.id);
    const totalAmount = filteredBills.reduce((sum, bill) => sum + bill.amount, 0);
    const paidAmount = filteredBills.filter(bill => bill.status === 'paid').reduce((sum, bill) => sum + bill.amount, 0);
    const pendingAmount = filteredBills.filter(bill => bill.status === 'pending').reduce((sum, bill) => sum + bill.amount, 0);
    const paidCount = filteredBills.filter(bill => bill.status === 'paid').length;
    const pendingCount = filteredBills.filter(bill => bill.status === 'pending').length;

    return {
      total: totalAmount,
      paid: paidAmount,
      pending: pendingAmount,
      paidCount,
      pendingCount,
      totalCount: filteredBills.length
    };
  };

  // Filter bills based on search and status
  const filteredBills = bills.filter(bill => {
    const matchesSearch = searchTerm === '' || 
      bill.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
    const matchesUser = userRole === 'admin' || bill.studentId === user.id;
    
    return matchesSearch && matchesStatus && matchesUser;
  });

  const stats = getBillingStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Enhanced Professional Header */}
      <div className="relative bg-white/90 backdrop-blur-lg border-b border-slate-200/50 sticky top-0 z-20">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 via-blue-600/5 to-purple-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center space-x-5">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl blur-sm opacity-20"></div>
                <div className="relative p-4 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl shadow-xl">
                  <Receipt className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Billing & Payments
                </h1>
                <p className="text-slate-600 mt-2 text-lg">
                  {userRole === 'student' 
                    ? 'View and manage your payment history with detailed insights'
                    : 'Comprehensive billing management and payment tracking system'
                  }
                </p>
              </div>
            </div>
            
            {/* Enhanced Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-green-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search bills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 w-72 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-300 transition-all duration-300 shadow-sm hover:shadow-md"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-green-500 transition-colors" />
                  <select
                    className="pl-10 pr-8 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-300 transition-all duration-300 shadow-sm hover:shadow-md appearance-none cursor-pointer"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                {userRole === 'admin' && (
                  <button 
                    className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl hover:from-green-600 hover:to-blue-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
                    onClick={() => setShowBillModal(true)}
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create Bill</span>
                  </button>
                )}
                
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center space-x-2 px-5 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 rounded-xl hover:bg-white hover:border-green-300 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 shadow-sm hover:shadow-md font-medium disabled:opacity-50"
                  title="Refresh bills"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-5 h-5" />
                  )}
                  <span>Refresh</span>
                </button>

                {userRole === 'student' && (
                  <button
                    onClick={loadPaymentHistory}
                    disabled={loading}
                    className="flex items-center space-x-2 px-5 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 rounded-xl hover:bg-white hover:border-blue-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 shadow-sm hover:shadow-md font-medium disabled:opacity-50"
                    title="View payment history"
                  >
                    <Receipt className="w-5 h-5" />
                    <span>Payment History</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Enhanced Statistics Cards - Admin Only */}
        {userRole === 'admin' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Bills</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalCount}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Amount</p>
                  <p className="text-3xl font-bold text-slate-900">{formatAmount(stats.total)}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Paid ({stats.paidCount})</p>
                  <p className="text-3xl font-bold text-green-600">{formatAmount(stats.paid)}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Pending ({stats.pendingCount})</p>
                  <p className="text-3xl font-bold text-orange-600">{formatAmount(stats.pending)}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full opacity-20 animate-pulse"></div>
                <Loader2 className="w-8 h-8 text-green-600 animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Loading Bills</h3>
                <p className="text-slate-500">Please wait while we fetch your billing information...</p>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-red-200/50 p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Unable to Load Bills</h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">{error}</p>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Try Again</span>
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Bills Grid */}
        {!loading && !error && filteredBills.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 md:gap-6">
            {filteredBills.map((bill, index) => (
              <div 
                key={bill.id} 
                className="group bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-green-200 transition-all duration-300 overflow-hidden"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Card Header */}
                <div className="p-5 border-b border-slate-100">
                  {/* Status and Amount Row */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      bill.status === 'paid' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {bill.status === 'paid' ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          PAID
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 mr-1" />
                          PENDING
                        </>
                      )}
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {formatAmount(bill.amount)}
                    </span>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2 leading-tight">
                    {bill.taskTitle}
                  </h3>
                  
                  {/* Student Info for Admin */}
                  {userRole === 'admin' && (
                    <div className="flex items-center space-x-2 text-sm text-slate-600 mb-3">
                      <User className="w-4 h-4" />
                      <span>{bill.student}</span>
                    </div>
                  )}
                  
                  {/* Description */}
                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {bill.description}
                  </p>
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-3">
                  {/* Due Date */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-2 text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">Due Date</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {new Date(bill.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {/* Paid Date */}
                  {bill.paidDate && (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Paid Date</span>
                      </div>
                      <span className="text-sm font-semibold text-green-700">
                        {new Date(bill.paidDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Footer - Actions */}
                <div className="p-5 bg-slate-50/50 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    {/* Status Indicator */}
                    <div className="flex items-center space-x-2">
                      {currentPaymentIntent && (
                        <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">
                          <Clock className="w-3 h-3 animate-pulse" />
                          <span>Processing...</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      {bill.status === 'paid' ? (
                        <div className="flex items-center space-x-2 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Complete</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-orange-600">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">Pending</span>
                        </div>
                      )}
                      
                      {/* Student Payment Actions */}
                      {bill.status === 'pending' && userRole === 'student' && (
                        <button 
                          className="flex items-center space-x-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                          onClick={() => handlePayNow(bill)}
                          disabled={isCreatingPayment && selectedBill?.id === bill.id}
                        >
                          {isCreatingPayment && selectedBill?.id === bill.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Setting up...</span>
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-4 h-4" />
                              <span>Pay Now</span>
                            </>
                          )}
                        </button>
                      )}
                      
                      {/* Admin Actions */}
                      {userRole === 'admin' && (
                        <div className="flex items-center space-x-2">
                          <button 
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            onClick={() => handleEditBill(bill)}
                            title="Edit bill"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          <button 
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            onClick={() => handleDeleteBill(bill)}
                            title="Delete bill"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <button 
                            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            onClick={() => handleViewBill(bill)}
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !loading && !error ? (
          /* Enhanced Empty State */
          <div className="flex items-center justify-center py-20">
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-slate-100 max-w-lg">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto">
                  <Receipt className="w-12 h-12 text-slate-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">No bills found</h3>
              <p className="text-slate-600 max-w-md leading-relaxed mb-6">
                {searchTerm ? 
                  'No bills match your search criteria. Try adjusting your search terms or filters.' :
                  userRole === 'student' 
                    ? 'You don\'t have any bills yet. Bills will appear here when administrators create them for your tasks.'
                    : 'No bills have been created yet. Create your first bill to start tracking payments.'
                }
              </p>
              {(searchTerm || statusFilter !== 'all') ? (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                >
                  Clear Filters
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <MockPaymentForm
              bill={selectedBill}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          </div>
        </div>
      )}

      {/* Bill Details Modal */}
      {showBillDetails && selectedBillForAction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900">Bill Details</h3>
              <button
                onClick={() => {
                  setShowBillDetails(false);
                  setSelectedBillForAction(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Task Title</label>
                  <p className="text-lg font-semibold text-slate-900">{selectedBillForAction.taskTitle}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Amount</label>
                  <p className="text-lg font-semibold text-green-600">{formatAmount(selectedBillForAction.amount)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Status</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-semibold ${
                    selectedBillForAction.status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {selectedBillForAction.status === 'paid' ? 'Paid' : 'Pending'}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Student</label>
                  <p className="text-lg font-semibold text-slate-900">{selectedBillForAction.student}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Due Date</label>
                  <p className="text-lg font-semibold text-slate-900">
                    {new Date(selectedBillForAction.dueDate).toLocaleDateString()}
                  </p>
                </div>
                {selectedBillForAction.paidDate && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Paid Date</label>
                    <p className="text-lg font-semibold text-green-600">
                      {new Date(selectedBillForAction.paidDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Description</label>
                <p className="text-slate-900 mt-1">{selectedBillForAction.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Bill Modal */}
      {showEditBill && selectedBillForAction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900">Edit Bill</h3>
              <button
                onClick={() => {
                  setShowEditBill(false);
                  setSelectedBillForAction(null);
                  setEditingBill({});
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Task Title</label>
                <input
                  type="text"
                  value={editingBill.taskTitle || ''}
                  onChange={(e) => setEditingBill({ ...editingBill, taskTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingBill.amount || ''}
                  onChange={(e) => setEditingBill({ ...editingBill, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Due Date</label>
                <input
                  type="date"
                  value={editingBill.dueDate || ''}
                  onChange={(e) => setEditingBill({ ...editingBill, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select
                  value={editingBill.status || 'pending'}
                  onChange={(e) => setEditingBill({ ...editingBill, status: e.target.value as 'paid' | 'pending' })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  value={editingBill.description || ''}
                  onChange={(e) => setEditingBill({ ...editingBill, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditBill(false);
                    setSelectedBillForAction(null);
                    setEditingBill({});
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitEditBill}
                  disabled={operationLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {operationLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedBillForAction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 text-center mb-2">Delete Bill</h3>
              <p className="text-slate-600 text-center mb-6">
                Are you sure you want to delete the bill for "{selectedBillForAction.taskTitle}"? 
                This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedBillForAction(null);
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={operationLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {operationLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>Delete Bill</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment History Modal */}
      {showPaymentHistory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900">Payment History</h3>
              <button
                onClick={() => {
                  setShowPaymentHistory(false);
                  setPaymentHistory([]);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {paymentHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-200 rounded-lg">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-600">Date</th>
                        <th className="border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-600">Bill</th>
                        <th className="border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-600">Amount</th>
                        <th className="border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-600">Status</th>
                        <th className="border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-600">Payment ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map((payment, index) => (
                        <tr key={payment.id || index} className="hover:bg-slate-50">
                          <td className="border border-slate-200 px-4 py-3 text-sm text-slate-900">
                            {new Date(payment.created_at || payment.date).toLocaleDateString()}
                          </td>
                          <td className="border border-slate-200 px-4 py-3 text-sm text-slate-900">
                            {payment.bill_title || payment.taskTitle || 'N/A'}
                          </td>
                          <td className="border border-slate-200 px-4 py-3 text-sm font-medium text-green-600">
                            {formatAmount(payment.amount)}
                          </td>
                          <td className="border border-slate-200 px-4 py-3 text-sm">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              payment.status === 'succeeded' 
                                ? 'bg-green-100 text-green-800' 
                                : payment.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="border border-slate-200 px-4 py-3 text-xs text-slate-500 font-mono">
                            {payment.payment_intent_id || payment.id}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Receipt className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No payment history found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Partial Payment Modal */}
      {showPartialPayment && selectedBill && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900">Partial Payment</h3>
              <button
                onClick={() => {
                  setShowPartialPayment(false);
                  setPartialAmount('');
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Bill Total</label>
                <p className="text-lg font-semibold text-slate-900">{formatAmount(selectedBill.amount)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Task</label>
                <p className="text-sm text-slate-900">{selectedBill.taskTitle}</p>
              </div>
              <div>
                <label htmlFor="partialAmount" className="block text-sm font-medium text-slate-700 mb-2">
                  Payment Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="partialAmount"
                    type="number"
                    value={partialAmount}
                    onChange={(e) => setPartialAmount(e.target.value)}
                    placeholder="0.00"
                    min="0.01"
                    max={selectedBill.amount.toString()}
                    step="0.01"
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Maximum: {formatAmount(selectedBill.amount)}
                </p>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowPartialPayment(false);
                    setPartialAmount('');
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePartialPayment}
                  disabled={!partialAmount || parseFloat(partialAmount || '0') <= 0 || isCreatingPayment}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isCreatingPayment ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4" />
                  )}
                  <span>Pay {partialAmount ? formatAmount(parseFloat(partialAmount)) : ''}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal - Stripe Elements or Simple Test */}
      {showStripePayment && selectedBill && currentPaymentData && (
        process.env.REACT_APP_DISABLE_STRIPE_ELEMENTS === 'true' ? (
          <SimplePaymentModal
            bill={selectedBill}
            paymentData={currentPaymentData}
            onSuccess={handleStripePaymentSuccess}
            onCancel={handleStripePaymentCancel}
            onError={handleStripePaymentError}
          />
        ) : (
          <StripePaymentModal
            bill={selectedBill}
            paymentData={currentPaymentData}
            onSuccess={handleStripePaymentSuccess}
            onCancel={handleStripePaymentCancel}
            onError={handleStripePaymentError}
          />
        )
      )}
    </div>
  );
}