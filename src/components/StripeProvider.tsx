import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ReactNode } from 'react';

// Stripe publishable key - get from environment variables
const getStripePublishableKey = () => {
  // Primary: Get from React environment variable
  if (process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY) {
    return process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
  }
  
  // Secondary: Get from window object if set by server
  if (typeof window !== 'undefined' && (window as any).STRIPE_PUBLISHABLE_KEY) {
    return (window as any).STRIPE_PUBLISHABLE_KEY;
  }
  
  // Log error if no key found
  console.error('STRIPE_PUBLISHABLE_KEY not found in environment variables');
  
  // Return null to prevent Stripe initialization with invalid key
  return null;
};

const stripePublishableKey = getStripePublishableKey();

// Only create stripePromise if we have a valid key
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

interface StripeProviderProps {
  children: ReactNode;
}

// Basic Stripe provider for the app context
export function StripeProvider({ children }: StripeProviderProps) {
  // Don't render Elements if Stripe is not properly configured
  if (!stripePromise) {
    console.error('Stripe not initialized - check REACT_APP_STRIPE_PUBLISHABLE_KEY in environment');
    return <>{children}</>;
  }

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
  // Don't render Elements if Stripe is not properly configured
  if (!stripePromise) {
    console.error('Stripe not initialized - check REACT_APP_STRIPE_PUBLISHABLE_KEY in environment');
    return <>{children}</>;
  }

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