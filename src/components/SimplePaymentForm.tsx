import React, { useState } from 'react';
import { Loader2, CreditCard, X, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Bill {
  id: number;
  taskTitle: string;
  amount: number;
  status: 'pending' | 'paid';
  dueDate: string;
  paidDate?: string | null;
  student: string;
  studentId: string;
  description: string;
}

interface PaymentData {
  payment_intent_id: string;
  client_secret: string;
  amount: number;
  remaining_amount?: number;
}

interface SimplePaymentFormProps {
  bill: Bill;
  paymentData: PaymentData;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
  onError: (error: string) => void;
}

export const SimplePaymentForm: React.FC<SimplePaymentFormProps> = ({
  bill,
  paymentData,
  onSuccess,
  onCancel,
  onError
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'succeeded' | 'failed'>('idle');

  const formatAmount = (amount: number | string): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(num);
  };

  const handleTestPayment = async () => {
    setIsProcessing(true);
    setPaymentStatus('processing');

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Test the payment status endpoint
      const token = localStorage.getItem('gradhelper_token');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${API_BASE_URL}/payments/${paymentData.payment_intent_id}/status/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        const statusData = await response.json();
        console.log('Payment status check result:', statusData);
        
        setPaymentStatus('succeeded');
        toast.success('Test payment completed successfully!');
        
        // Simulate successful payment
        setTimeout(() => {
          onSuccess(paymentData.payment_intent_id);
        }, 1000);
      } else {
        throw new Error('Payment status check failed');
      }
    } catch (error: any) {
      console.error('Test payment error:', error);
      setPaymentStatus('failed');
      onError(error.message || 'Test payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentStatus === 'succeeded') {
    return (
      <div className="text-center py-8">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Test Payment Successful!</h3>
        <p className="text-gray-600 mb-4">
          Your test payment of {formatAmount(paymentData.amount)} has been processed.
        </p>
        <p className="text-sm text-gray-500 mb-4">
          This is a development test. In production, real Stripe processing would occur here.
        </p>
        <button
          onClick={() => onSuccess(paymentData.payment_intent_id)}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Continue
        </button>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="text-center py-8">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Test Payment Failed</h3>
        <p className="text-gray-600 mb-4">
          There was an issue with the test payment. Please try again.
        </p>
        <div className="flex space-x-3 justify-center">
          <button
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => setPaymentStatus('idle')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Details */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Payment Details</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Task:</span>
            <span className="font-medium">{bill.taskTitle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-medium text-green-600">{formatAmount(paymentData.amount)}</span>
          </div>
          {paymentData.remaining_amount && (
            <div className="flex justify-between">
              <span className="text-gray-600">Remaining after payment:</span>
              <span className="font-medium">{formatAmount(paymentData.remaining_amount)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Debug Information */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Development Mode</h4>
        <div className="space-y-1 text-xs text-blue-700">
          <div>Payment Intent ID: {paymentData.payment_intent_id}</div>
          <div>Client Secret: {paymentData.client_secret?.substring(0, 30)}...</div>
          <div>Amount: ${paymentData.amount}</div>
          <div>Status: Ready for test payment</div>
        </div>
        <p className="text-xs text-blue-600 mt-2">
          This bypasses Stripe Elements and tests the Payment Intent API integration.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleTestPayment}
          disabled={isProcessing}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing Test...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              <span>Test Pay {formatAmount(paymentData.amount)}</span>
            </>
          )}
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h4 className="font-medium text-yellow-900 mb-2">🔧 To Enable Real Stripe Processing:</h4>
        <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
          <li>Go to <a href="https://dashboard.stripe.com/test/apikeys" target="_blank" rel="noopener noreferrer" className="underline">Stripe Dashboard</a></li>
          <li>Copy your test publishable key (starts with pk_test_...)</li>
          <li>Replace REACT_APP_STRIPE_PUBLISHABLE_KEY in .env file</li>
          <li>Set REACT_APP_DISABLE_STRIPE_ELEMENTS=false</li>
          <li>Restart the development server</li>
        </ol>
      </div>
    </div>
  );
};

interface SimplePaymentModalProps {
  bill: Bill;
  paymentData: PaymentData;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
  onError: (error: string) => void;
}

export const SimplePaymentModal: React.FC<SimplePaymentModalProps> = (props) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Development Payment Test</h3>
          <button
            onClick={props.onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <SimplePaymentForm {...props} />
        </div>
      </div>
    </div>
  );
};

export default SimplePaymentModal;