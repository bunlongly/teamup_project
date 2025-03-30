// routes/stripeRoutes.js
import express from 'express';
import Stripe from 'stripe';
import { authenticateUser } from '../middleware/errorHandlerMiddleware.js'; // or your auth middleware

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Hardcoded price for a recruitment post fee (in cents, e.g. $15.00)
const RECRUITMENT_POST_PRICE = 1500;

router.post('/create-checkout-session', authenticateUser, async (req, res) => {
  try {
    const { postType } = req.body; // Expected values: "RECRUITMENT", "STATUS", etc.

    // Only proceed if the post type is RECRUITMENT
    if (postType !== 'RECRUITMENT') {
      return res
        .status(400)
        .json({ error: 'Payment is only required for recruitment posts.' });
    }

    // Create a Stripe Checkout Session for one-time payment
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Recruitment Post Fee'
            },
            unit_amount: RECRUITMENT_POST_PRICE
          },
          quantity: 1
        }
      ],
      success_url: `${process.env.CLIENT_URL}/recruitment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/recruitment-cancel`
    });

    // Return the URL for the client to redirect to Stripe's Checkout
    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ error: 'Error creating checkout session' });
  }
});

export default router;
