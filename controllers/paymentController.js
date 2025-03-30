// controllers/paymentController.js
import Stripe from 'stripe';
import { StatusCodes } from 'http-status-codes';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (req, res) => {
  try {
    // Amount should be defined in cents; for example, $10 becomes 1000.
    const { amount, currency = 'usd' } = req.body;
    if (!amount) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'Amount is required' });
    }

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      // You can add additional options such as metadata if needed.
    });

    res.status(StatusCodes.OK).json({
      clientSecret: paymentIntent.client_secret,
      message: 'Payment intent created',
    });
  } catch (error) {
    console.error('Stripe Error:', error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Failed to create payment intent', error: error.message });
  }
};
