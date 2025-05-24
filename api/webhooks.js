// pages/api/webhooks.js
import { buffer } from 'micro';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 🧾 Handle payment success
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const seatIds = session.metadata.seatIds?.split(',') || [];
    const email = session.metadata.email;

    try {
      const reservation = await prisma.reservation.create({
        data: {
          email,
          status: 'PAID',
          totalAmount: session.amount_total / 100,
          paidAt: new Date(),
          checkoutSessionId: session.id,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour default expiry
          reservedSeats: {
            create: seatIds.map(seatId => ({
              seat: { connect: { id: seatId } },
            })),
          },
        },
      });

      console.log(`✅ Reservation created: ${reservation.id}`);
    } catch (err) {
      console.error('Reservation failed:', err);
    }
  }

  res.status(200).json({ received: true });
}
