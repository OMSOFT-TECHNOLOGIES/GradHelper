import React, { useState, useEffect } from 'react';
import { 
  useStripe, 
  useElements, 
  PaymentElement,
  Elements 
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Loader2, CreditCard, X, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// Initialize Stripe - get publishable key from environment
const getStripeKey = () => {
  return process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 
         'pk_test_51Q9T2IB7dvML7UXZxEFRcnRsVHxRFAhP7VVHhUAQaT7dMgOhOEVZu2PH7pY6y7QbqG1rTsU8FT6HXAVhZh0v0Zyx00vEoKHzWd';
};

const stripePromise = loadStripe(getStripeKey());

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

interface StripePaymentFormProps {
  bill: Bill;
  paymentData: PaymentData;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
  onError: (error: string) => void;
}

const PaymentFormContent: React.FC<StripePaymentFormProps> = ({
  bill,
  paymentData,
  onSuccess,
  onCancel,
  onError
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'succeeded' | 'failed'>('idle');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      console.error('Stripe not ready:', { stripe: !!stripe, elements: !!elements });
      toast.error('Payment system is not ready. Please try again.');
      return;
    }

    // Check if PaymentElement is mounted
    const paymentElement = elements.getElement('payment');
    if (!paymentElement) {
      console.error('PaymentElement not found');
      toast.error('Payment form is not ready. Please try again.');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.origin}/dashboard/billing`,
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('Payment confirmation error:', error);
        setPaymentStatus('failed');
        onError(error.message || 'Payment failed');
        toast.error(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setPaymentStatus('succeeded');
        toast.success('Payment completed successfully!');
        onSuccess(paymentIntent.id);
      } else {
        console.log('Payment Intent status:', paymentIntent?.status);
        // Handle other statuses like requires_action
        if (paymentIntent?.status === 'requires_action') {
          toast.info('Additional authentication required');
        }
      }
    } catch (err: any) {
      console.error('Payment processing error:', err);
      setPaymentStatus('failed');
      onError(err.message || 'Payment processing failed');
      toast.error('Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAmount = (amount: number | string): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(num);
  };

  if (paymentStatus === 'succeeded') {
    return (
      <div className="text-center py-8">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h3>
        <p className="text-gray-600 mb-4">
          Your payment of {formatAmount(paymentData.amount)} has been processed successfully.
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
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Failed</h3>
        <p className="text-gray-600 mb-4">
          There was an issue processing your payment. Please try again.
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
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <div className="space-y-4">
        <PaymentElement 
          options={{
            layout: 'tabs',
          }}
          onReady={() => {
            console.log('PaymentElement is ready');
          }}
          onLoadError={(error) => {
            console.error('PaymentElement load error:', error);
            toast.error('Payment form failed to load. Please check your connection and try again.');
            onError('Payment form failed to load');
          }}
        />
      </div>

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
          type="submit"
          disabled={!stripe || !elements || isProcessing}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              <span>Pay {formatAmount(paymentData.amount)}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

interface StripePaymentModalProps {
  bill: Bill;
  paymentData: PaymentData;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
  onError: (error: string) => void;
}

export const StripePaymentModal: React.FC<StripePaymentModalProps> = (props) => {
  const [stripeError, setStripeError] = useState<string | null>(null);

  const options = {
    clientSecret: props.paymentData.client_secret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#2563eb',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#dc2626',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  // Validate client secret format
  const isValidClientSecret = props.paymentData.client_secret && 
    props.paymentData.client_secret.startsWith('pi_') && 
    props.paymentData.client_secret.includes('_secret_');

  if (!isValidClientSecret) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Payment Setup Error</h3>
            <button
              onClick={props.onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Invalid Payment Configuration</h4>
            <p className="text-gray-600 mb-4">
              The payment setup is invalid. Please contact support or try again later.
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Client Secret: {props.paymentData.client_secret || 'Missing'}
            </p>
            <button
              onClick={props.onCancel}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Complete Payment</h3>
          <button
            onClick={props.onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {/* Debug Information */}
          <div className="mb-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
            <div><strong>Debug Info:</strong></div>
            <div>Client Secret: {props.paymentData.client_secret?.substring(0, 20)}...</div>
            <div>Payment Intent ID: {props.paymentData.payment_intent_id}</div>
            <div>Amount: ${props.paymentData.amount}</div>
            <div>Stripe Key: {getStripeKey().substring(0, 20)}...</div>
          </div>
          
          {stripeError ? (
            <div className="text-center py-4">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Payment System Error</h4>
              <p className="text-gray-600 mb-4">{stripeError}</p>
              <p className="text-sm text-gray-500 mb-4">
                This is likely due to a Stripe configuration issue. For testing, you can simulate the payment.
              </p>
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={props.onCancel}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStripeError(null)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => {
                    console.log('Simulating payment success for testing');
                    props.onSuccess(props.paymentData.payment_intent_id);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Test Payment
                </button>
              </div>
            </div>
          ) : (
            <Elements 
              stripe={stripePromise} 
              options={options}
            >
              <PaymentFormContent {...props} />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
};

export default StripePaymentModal;