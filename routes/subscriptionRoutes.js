// routes/subscriptionRoutes.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateUser } from '../middleware/errorHandlerMiddleware.js';

const prisma = new PrismaClient();
const router = express.Router();

/**
 * GET /api/subscription
 * Returns the subscription details for the authenticated user.
 */
router.get('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const subscription = await prisma.subscription.findUnique({
      where: { userId }
    });
    if (!subscription) {
      // Return a default object if no subscription exists.
      return res.json({ remainingPosts: 0 });
    }
    res.json(subscription);
  } catch (error) {
    console.error('Error fetching subscription details:', error);
    res.status(500).json({ error: 'Error fetching subscription details' });
  }
});

/**
 * POST /api/subscription/create-or-update
 * Called after a successful purchase to create or update the user's subscription.
 * Expects a request body like: { subscriptionPlan: { time: 5, price: 70 } }
 */
router.post('/create-or-update', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { subscriptionPlan } = req.body; // e.g., { time: 5, price: 70 }
    const subscription = await prisma.subscription.upsert({
      where: { userId },
      update: { remainingPosts: subscriptionPlan.time },
      create: { userId, remainingPosts: subscriptionPlan.time }
    });
    res.json(subscription);
  } catch (error) {
    console.error('Error creating/updating subscription:', error);
    res.status(500).json({ error: 'Error creating/updating subscription' });
  }
});

/**
 * PUT /api/subscription
 * Decrements the remainingPosts by a given number.
 * Expects a request body like: { decrementBy: 1 }
 */
router.put('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { decrementBy } = req.body;
    const subscription = await prisma.subscription.findUnique({
      where: { userId }
    });
    if (!subscription || subscription.remainingPosts <= 0) {
      return res.status(400).json({
        error: 'You do not have any remaining recruitment posts.'
      });
    }
    const updatedSubscription = await prisma.subscription.update({
      where: { userId },
      data: {
        remainingPosts: { decrement: decrementBy }
      }
    });
    res.json(updatedSubscription);
  } catch (error) {
    console.error('Error updating subscription details:', error);
    res.status(500).json({ error: 'Error updating subscription details' });
  }
});

export default router;
