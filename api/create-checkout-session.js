// pages/api/create-checkout-session.js
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { seatIds, email } = req.body;

  try {
    // Fetch seat data to create Stripe line items
    const seats = await prisma.seat.findMany({
      where: { id: { in: seatIds } },
    });

    if (!seats.length) {
      return res.status(400).json({ error: 'No valid seats found' });
    }

    const line_items = seats.map(seat => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `Seat ${seat.seatNumber}`,
        },
        unit_amount: Math.round(seat.price * 100),
      },
      quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cancel`,
      metadata: {
        seatIds: seatIds.join(','),
        email
      }
    });

    res.status(200).json({ sessionId: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Stripe session creation failed' });
  } finally {
    await prisma.$disconnect();
  }
}
