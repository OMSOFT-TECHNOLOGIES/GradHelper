import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ReactNode } from 'react';

// Stripe publishable key - replace with your actual key from Stripe Dashboard
// For development: use your test publishable key (starts with pk_test_)
// For production: use your live publishable key (starts with pk_live_)
const getStripePublishableKey = () => {
  // Try to get from environment variables if available
  if (typeof window !== 'undefined' && (window as any).STRIPE_PUBLISHABLE_KEY) {
    return (window as any).STRIPE_PUBLISHABLE_KEY;
  }
  
  // Fallback for development - replace with your actual test key
  return 'pk_test_51234567890abcdef_test_key_replace_with_your_actual_key';
};

const stripePublishableKey = getStripePublishableKey();

const stripePromise = loadStripe(stripePublishableKey);

interface StripeProviderProps {
  children: ReactNode;
}

// Basic Stripe provider for the app context
export function StripeProvider({ children }: StripeProviderProps) {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
}

// Payment-specific Elements provider with clientSecret
interface PaymentElementsProviderProps {
  children: ReactNode;
  clientSecret: string;
  amount?: number;
}

export function PaymentElementsProvider({ children, clientSecret, amount }: PaymentElementsProviderProps) {
  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#1e3a8a',
        colorBackground: '#ffffff',
        colorText: '#1e293b',
        colorDanger: '#dc2626',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '6px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}