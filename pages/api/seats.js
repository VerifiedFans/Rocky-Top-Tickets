// pages/api/seats.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const seats = await prisma.seat.findMany({
      include: {
        row: {
          select: {
            rowNumber: true,
            section: {
              select: {
                name: true,
              }
            }
          }
        }
      }
    });

    const formatted = seats.map(seat => ({
      id: seat.id,
      seatNumber: seat.seatNumber,
      available: seat.available,
      price: seat.price,
      row: seat.row.rowNumber,
      section: seat.row.section.name,
    }));

    res.status(200).json({ seats: formatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load seats' });
  } finally {
    await prisma.$disconnect();
  }
}
