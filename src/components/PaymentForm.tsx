import { useState } from 'react';
import {
  useStripe,
  useElements,
  PaymentElement,
  AddressElement
} from '@stripe/react-stripe-js';
import { useNotifications } from './NotificationContextAPI';
import { 
  CreditCard, 
  Lock, 
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

interface PaymentFormProps {
  bill: {
    id: number;
    taskTitle: string;
    amount: number;
    description: string;
    student: string;
  };
  onSuccess: (billId: number) => void;
  onCancel: () => void;
}

export function PaymentForm({ bill, onSuccess, onCancel }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { addNotification } = useNotifications();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage('Stripe has not loaded yet. Please try again.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Since we're using mock client secrets, we'll simulate the payment process
      // In production, this would actually process the payment through Stripe
      
      // Check if this is a demo payment (mock client secret)
      const isDemoPayment = true; // Always true in our demo

      if (isDemoPayment) {
        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate successful payment for demo
        setPaymentSuccess(true);
        
        addNotification({
          type: 'payment_received',
          title: 'Demo Payment Successful',
          message: `Demo payment of $${bill.amount} for "${bill.taskTitle}" has been processed successfully.`,
          userId: 'current-user',
          userRole: 'student'
        });

        // Call success handler after showing success state
        setTimeout(() => {
          onSuccess(bill.id);
        }, 2000);
      } else {
        // Production payment processing would go here
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/payment-success`,
          },
          redirect: 'if_required'
        });

        if (error) {
          setErrorMessage(error.message || 'An error occurred during payment');
          addNotification({
            type: 'error',
            title: 'Payment Failed',
            message: error.message || 'Payment could not be processed',
            userId: 'current-user',
            userRole: 'student'
          });
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
          setPaymentSuccess(true);
          
          addNotification({
            type: 'payment_received',
            title: 'Payment Successful',
            message: `Payment of $${bill.amount} for "${bill.taskTitle}" has been processed successfully.`,
            userId: 'current-user',
            userRole: 'student'
          });

          setTimeout(() => {
            onSuccess(bill.id);
          }, 2000);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred');
      addNotification({
        type: 'error',
        title: 'Payment Error',
        message: 'An unexpected error occurred during payment processing',
        userId: 'current-user',
        userRole: 'student'
      });
    }

    setIsProcessing(false);
  };

  if (paymentSuccess) {
    return (
      <div className="payment-success">
        <div className="success-content">
          <div className="success-icon">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h3>Payment Successful!</h3>
          <p>Your payment of <strong>${bill.amount}</strong> has been processed successfully.</p>
          <div className="success-details">
            <p className="text-sm text-muted-foreground">
              Task: {bill.taskTitle}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-form-container">
      <div className="payment-header">
        <div className="payment-header-content">
          <div className="payment-header-icon">
            <CreditCard className="w-6 h-6" />
          </div>
          <div className="payment-header-text">
            <h3>Complete Payment</h3>
            <p>Secure payment powered by Stripe</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="payment-close-btn"
          disabled={isProcessing}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="payment-details">
        {/* Demo Mode Notice */}
        <div className="demo-notice">
          <Info className="w-4 h-4" />
          <div>
            <p className="demo-notice-title">Demo Mode Active</p>
            <p className="demo-notice-text">
              This is a demonstration of the payment flow. No real charges will be made.
            </p>
          </div>
        </div>

        <div className="payment-summary">
          <h4>Payment Summary</h4>
          <div className="summary-row">
            <span>Task:</span>
            <span className="summary-value">{bill.taskTitle}</span>
          </div>
          <div className="summary-row">
            <span>Description:</span>
            <span className="summary-value text-sm">{bill.description}</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total Amount:</span>
            <span className="summary-amount">${bill.amount}</span>
          </div>
        </div>

        {errorMessage && (
          <div className="payment-error">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="payment-form">
          <div className="payment-element-container">
            <label className="payment-label">Payment Information</label>
            <PaymentElement 
              options={{
                layout: {
                  type: 'tabs',
                  defaultCollapsed: false,
                }
              }}
            />
          </div>

          <div className="address-element-container">
            <label className="payment-label">Billing Address</label>
            <AddressElement 
              options={{
                mode: 'billing',
                allowedCountries: ['US', 'CA', 'GB', 'AU']
              }}
            />
          </div>

          <div className="payment-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary payment-submit-btn"
              disabled={!stripe || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processing Demo Payment...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Pay ${bill.amount} (Demo)
                </>
              )}
            </button>
          </div>

          <div className="payment-security-notice">
            <Lock className="w-4 h-4" />
            <span>Your payment information is secure and encrypted</span>
          </div>
        </form>
      </div>
    </div>
  );
}