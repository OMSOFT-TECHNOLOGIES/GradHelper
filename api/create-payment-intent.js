// Sample backend API endpoint for creating Stripe Payment Intents
// This would be implemented in your backend (Node.js, Python, etc.)

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createPaymentIntent(req, res) {
  try {
    const { amount, currency, billId, taskId, studentId, metadata } = req.body;

    // Validate request
    if (!amount || !currency || !billId) {
      return res.status(400).json({
        error: 'Missing required parameters'
      });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        billId: billId.toString(),
        taskId: taskId || '',
        studentId: studentId || '',
        ...metadata
      },
      description: `Payment for ${metadata?.taskTitle || 'TheGradHelper Service'}`,
      receipt_email: req.body.customerEmail, // Optional: send receipt to customer
    });

    // Optionally, save payment intent details to your database
    // await savePaymentIntent({
    //   stripePaymentIntentId: paymentIntent.id,
    //   billId,
    //   taskId,
    //   studentId,
    //   amount,
    //   currency,
    //   status: 'pending'
    // });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      error: 'Failed to create payment intent'
    });
  }
}

// Webhook endpoint to handle Stripe events
async function handleStripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful!');
      
      // Update your database to mark the bill as paid
      // await updateBillStatus(paymentIntent.metadata.billId, 'paid');
      
      // Send confirmation email or notification to student
      // await sendPaymentConfirmation(paymentIntent);
      
      break;
    
    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object;
      console.log('PaymentIntent failed!');
      
      // Handle failed payment
      // await updateBillStatus(failedPaymentIntent.metadata.billId, 'failed');
      
      break;
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
}

module.exports = {
  createPaymentIntent,
  handleStripeWebhook
};

/*
SETUP INSTRUCTIONS:

1. Install Stripe SDK:
   npm install stripe

2. Set environment variables:
   STRIPE_SECRET_KEY=sk_test_your_secret_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

3. Frontend environment variables:
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

4. Express.js route setup:
   const { createPaymentIntent, handleStripeWebhook } = require('./api/create-payment-intent');
   
   app.post('/api/create-payment-intent', createPaymentIntent);
   app.post('/api/webhook', express.raw({type: 'application/json'}), handleStripeWebhook);

5. Stripe Dashboard Setup:
   - Add webhook endpoint: https://yourdomain.com/api/webhook
   - Listen for events: payment_intent.succeeded, payment_intent.payment_failed
   - Copy webhook signing secret to your environment variables

6. Test payments using Stripe test cards:
   - Successful payment: 4242424242424242
   - Declined payment: 4000000000000002
   - Requires authentication: 4000002500003155
*/