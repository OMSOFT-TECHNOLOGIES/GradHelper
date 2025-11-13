import { useState } from 'react';
import { useNotifications } from './NotificationContext';
import { 
  CreditCard, 
  Lock, 
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

interface MockPaymentFormProps {
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

export function MockPaymentForm({ bill, onSuccess, onCancel }: MockPaymentFormProps) {
  const { addNotification } = useNotifications();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'US'
  });

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    // Format card number
    if (field === 'cardNumber') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').slice(0, 19);
    }
    
    // Format expiry date
    if (field === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);
    }
    
    // Format CVV
    if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }
    
    // Format zip code
    if (field === 'zip') {
      formattedValue = value.replace(/\D/g, '').slice(0, 5);
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 13) {
      errors.push('Please enter a valid card number');
    }
    
    if (!formData.expiryDate || formData.expiryDate.length < 5) {
      errors.push('Please enter a valid expiry date');
    }
    
    if (!formData.cvv || formData.cvv.length < 3) {
      errors.push('Please enter a valid CVV');
    }
    
    if (!formData.name.trim()) {
      errors.push('Please enter the cardholder name');
    }
    
    if (!formData.address.trim()) {
      errors.push('Please enter your address');
    }
    
    if (!formData.city.trim()) {
      errors.push('Please enter your city');
    }
    
    if (!formData.zip.trim()) {
      errors.push('Please enter your ZIP code');
    }

    if (errors.length > 0) {
      setErrorMessage(errors[0]);
      return false;
    }
    
    setErrorMessage(null);
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Simulate successful payment
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

    } catch (err: any) {
      setErrorMessage('An unexpected error occurred');
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
              This is a demonstration of the payment flow. No real charges will be made. You can use test card: 4242 4242 4242 4242
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
          {/* Card Information */}
          <div className="form-section">
            <h5 className="section-title">Card Information</h5>
            
            <div className="mock-stripe-element">
              <div className="element-row">
                <input
                  type="text"
                  placeholder="1234 1234 1234 1234"
                  value={formData.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  className="card-input full-width"
                />
              </div>
              <div className="element-row">
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  className="card-input"
                />
                <input
                  type="text"
                  placeholder="CVC"
                  value={formData.cvv}
                  onChange={(e) => handleInputChange('cvv', e.target.value)}
                  className="card-input"
                />
              </div>
            </div>

            <div className="form-group">
              <input
                type="text"
                placeholder="Full name on card"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {/* Billing Address */}
          <div className="form-section">
            <h5 className="section-title">Billing Address</h5>
            
            <div className="form-group">
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <input
                type="text"
                placeholder="Address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-row">
              <input
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="form-input"
              />
              <input
                type="text"
                placeholder="State"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className="form-input"
              />
              <input
                type="text"
                placeholder="ZIP"
                value={formData.zip}
                onChange={(e) => handleInputChange('zip', e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <select
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="form-input"
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
              </select>
            </div>
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
              disabled={isProcessing}
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