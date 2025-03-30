// routes/stripeRoutes.js
import express from 'express';
import Stripe from 'stripe';
import { authenticateUser } from '../middleware/errorHandlerMiddleware.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Default price for a recruitment post fee (in cents) if no subscription plan is provided
const DEFAULT_RECRUITMENT_POST_PRICE = 1500;

router.post('/create-checkout-session', authenticateUser, async (req, res) => {
  try {
    const { postType, subscriptionPlan } = req.body; // Now we expect subscriptionPlan as well

    // Only proceed if the post type is RECRUITMENT
    if (postType !== 'RECRUITMENT') {
      return res
        .status(400)
        .json({ error: 'Payment is only required for recruitment posts.' });
    }

    // Determine the price. If a subscription plan is provided, use that price (converted to cents).
    const priceInCents =
      subscriptionPlan && subscriptionPlan.price
        ? subscriptionPlan.price * 100
        : DEFAULT_RECRUITMENT_POST_PRICE;

    // Optionally, customize the product name to include plan details
    const productName = subscriptionPlan
      ? `Recruitment Post Fee - ${subscriptionPlan.time} posts for $${subscriptionPlan.price}`
      : 'Recruitment Post Fee';

    // Create a Stripe Checkout Session for one-time payment
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName
            },
            unit_amount: priceInCents
          },
          quantity: 1
        }
      ],
      success_url: `${process.env.CLIENT_URL}/recruitment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/recruitment-cancel`
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ error: 'Error creating checkout session' });
  }
});


export default router;
