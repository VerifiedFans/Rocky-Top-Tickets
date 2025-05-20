// pages/api/prisma-push.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("Method Not Allowed");
  }

  try {
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "Event" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255),
      description TEXT,
      startDate TIMESTAMP,
      endDate TIMESTAMP,
      createdAt TIMESTAMP DEFAULT now(),
      updatedAt TIMESTAMP DEFAULT now()
    )`;

    res.status(200).json({ message: "Tables created successfully!" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  } finally {
    await prisma.$disconnect();
  }
}
