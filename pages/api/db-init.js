// pages/api/db-init.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Only GET allowed' });
  }

  try {
    const event = await prisma.event.findMany();
    res.status(200).json({ message: 'Database connected and tables exist.', events: event });
  } catch (error) {
    console.error('Schema not found or database not connected.');
    res.status(500).json({ error: error.message });
  } finally {
    await prisma.$disconnect();
  }
}
