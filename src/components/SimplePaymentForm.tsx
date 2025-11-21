import React, { useState, useEffect } from 'react';
import { 
  useStripe, 
  useElements, 
  PaymentElement,
  Elements 
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Loader2, CreditCard, X, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { toast } from 'sonner';

// Initialize Stripe - get publishable key from environment
const getStripeKey = () => {
  const key = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    console.warn('REACT_APP_STRIPE_PUBLISHABLE_KEY not found in environment variables');
    // Return a test key for development if no key is configured
    return 'pk_test_51QJvNDB7dvML7UXZWyGJo6mKZtAdGVH4PwBFyGa4Wz4pzH1kK0V8kKCgxx2MjMBvJAylSh7lANPJ80rZrz8Ch5OB00vFU0zFNF';
  }
  return key;
};

const stripeKey = getStripeKey();
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

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

// Payment Element appearance configuration
const paymentElementOptions = {
  layout: 'tabs' as const,
  paymentMethodOrder: ['card'],
  defaultValues: {
    billingDetails: {
      name: '',
      email: '',
      phone: '',
      address: {
        country: 'US',
      },
    },
  },
  fields: {
    billingDetails: {
      name: 'auto' as const,
      email: 'auto' as const,
      phone: 'auto' as const,
      address: 'auto' as const,
    },
  },
};

const PaymentFormContent: React.FC<SimplePaymentFormProps> = ({
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
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const formatAmount = (amount: number | string): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(num);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      console.error('Stripe not ready:', { stripe: !!stripe, elements: !!elements });
      toast.error('Payment system is not ready. Please try again.');
      return;
    }

    setIsProcessing(true);
    setIsLoading(true);
    setPaymentStatus('processing');
    setMessage(null);

    try {
      // Confirm payment with PaymentElement
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
          payment_method_data: {
            billing_details: {
              name: bill.student,
              email: '', // Will be filled by PaymentElement
              phone: '', // Will be filled by PaymentElement
              address: {
                country: 'US', // Default country
              },
            },
          },
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('Payment confirmation error:', error);
        setPaymentStatus('failed');
        setMessage(error.message || 'Payment failed');
        onError(error.message || 'Payment failed');
        toast.error(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setPaymentStatus('succeeded');
        toast.success('Payment completed successfully!');
        
        // Update payment status on server (optional - UI already updated)
        try {
          const token = localStorage.getItem('gradhelper_token');
          const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
          
          fetch(`${API_BASE_URL}/payments/${paymentData.payment_intent_id}/confirm/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token && { 'Authorization': `Bearer ${token}` }),
            },
            body: JSON.stringify({
              payment_intent_id: paymentIntent.id,
              status: 'succeeded'
            }),
          }).catch(err => console.warn('Server update failed:', err));
        } catch (updateError) {
          console.warn('Failed to update payment status on server:', updateError);
        }
        
        setTimeout(() => {
          onSuccess(paymentIntent.id);
        }, 1000);
      } else {
        console.log('Payment Intent status:', paymentIntent?.status);
        // Handle other statuses like requires_action
        if (paymentIntent?.status === 'requires_action') {
          toast.info('Additional authentication required');
          setPaymentStatus('failed');
          onError('Additional authentication required');
        } else {
          setPaymentStatus('failed');
          onError(`Unexpected payment status: ${paymentIntent?.status}`);
        }
      }
    } catch (err: any) {
      console.error('Payment processing error:', err);
      setPaymentStatus('failed');
      onError(err.message || 'Payment processing failed');
      toast.error('Payment processing failed');
    } finally {
      setIsProcessing(false);
      setIsLoading(false);
    }
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
          {message || 'There was an issue processing your payment. Please try again.'}
        </p>
        <div className="flex space-x-3 justify-center">
          <button
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setPaymentStatus('idle');
              setMessage(null);
            }}
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

      {/* Payment Form Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-gray-900">
          <CreditCard className="w-5 h-5 text-blue-600" />
          <label className="text-sm font-semibold">Payment Information</label>
        </div>
        
        <div className="payment-element-container">
          {isLoading && (
            <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading payment form...</span>
            </div>
          )}
          <div className={`${isLoading ? 'hidden' : 'block'}`}>
            <PaymentElement 
              id="payment-element"
              options={paymentElementOptions}
              onReady={() => {
                setIsLoading(false);
                console.log('PaymentElement is ready');
              }}
              onLoadError={(error) => {
                console.error('PaymentElement load error:', error);
                toast.error('Payment form failed to load. Please check your connection and try again.');
                setMessage('Payment form failed to load');
                setIsLoading(false);
              }}
            />
          </div>
        </div>
        
        {message && (
          <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}
      </div>

      {/* Security Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
        <div className="flex items-center space-x-2 mb-2">
          <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
            <Lock className="w-3 h-3 text-blue-600" />
          </div>
          <h4 className="font-semibold text-blue-900">256-bit SSL Encrypted</h4>
        </div>
        <p className="text-sm text-blue-800 leading-relaxed">
          Your payment is secured by Stripe with bank-level encryption. We never store your card details on our servers.
        </p>
        <div className="flex items-center space-x-4 mt-2 text-xs text-blue-600">
          <span className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>PCI DSS Compliant</span>
          </span>
          <span className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>SOC 2 Certified</span>
          </span>
        </div>
      </div>

      {/* Test Card Info (Development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-medium text-yellow-900 mb-2">💳 Test Card Numbers</h4>
          <div className="text-xs text-yellow-800 space-y-1">
            <div><strong>Success:</strong> 4242 4242 4242 4242</div>
            <div><strong>Decline:</strong> 4000 0000 0000 0002</div>
            <div><strong>3D Secure:</strong> 4000 0027 6000 3184</div>
            <div><strong>Exp:</strong> Any future date | <strong>CVC:</strong> Any 3 digits</div>
          </div>
        </div>
      )}

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
          type="submit"
          disabled={!stripe || !elements || isProcessing || isLoading}
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

// Main component wrapper with Stripe Elements
export const SimplePaymentForm: React.FC<SimplePaymentFormProps> = (props) => {
  // Check if Stripe is properly configured
  if (!stripePromise) {
    return (
      <div className="text-center py-8">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Stripe Configuration Error</h3>
        <p className="text-gray-600 mb-4">
          The Stripe payment system is not properly configured.
        </p>
        <p className="text-xs text-gray-500 mb-4">
          Missing: REACT_APP_STRIPE_PUBLISHABLE_KEY
        </p>
        <div className="flex space-x-3 justify-center">
          <button
            onClick={props.onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              console.log('Simulating payment success due to Stripe configuration issue');
              toast.success('Payment simulated successfully (Stripe not configured)');
              props.onSuccess(props.paymentData.payment_intent_id);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Simulate Payment
          </button>
        </div>
      </div>
    );
  }

  // Validate client secret format
  const isValidClientSecret = props.paymentData.client_secret && 
    props.paymentData.client_secret.startsWith('pi_') && 
    props.paymentData.client_secret.includes('_secret_');

  if (!isValidClientSecret) {
    return (
      <div className="text-center py-8">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Invalid Payment Configuration</h3>
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
    );
  }

  const options = {
    clientSecret: props.paymentData.client_secret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#2563eb',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#dc2626',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        spacingUnit: '6px',
        borderRadius: '8px',
        focusBoxShadow: '0 0 0 2px rgba(37, 99, 235, 0.2)',
      },
      rules: {
        '.Input': {
          padding: '12px',
          fontSize: '16px',
        },
        '.Input:focus': {
          boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.2)',
        },
        '.Tab': {
          padding: '12px 16px',
          fontSize: '14px',
        },
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentFormContent {...props} />
    </Elements>
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
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
              <div><strong>Debug Info:</strong></div>
              <div>Client Secret: {props.paymentData.client_secret?.substring(0, 20)}...</div>
              <div>Payment Intent ID: {props.paymentData.payment_intent_id}</div>
              <div>Amount: ${props.paymentData.amount}</div>
              <div>Stripe Key: {getStripeKey()?.substring(0, 20) || 'Not configured'}...</div>
            </div>
          )}
          
          <SimplePaymentForm {...props} />
        </div>
      </div>
    </div>
  );
};

export default SimplePaymentModal;