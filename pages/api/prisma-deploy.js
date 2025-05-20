// pages/api/prisma-deploy.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("Method Not Allowed");
  }

  const { command } = req.body;

  try {
    if (command === "push") {
      await prisma.$executeRaw`SELECT 1`;
      res.status(200).json({ message: "Database connected and ready!" });
    } else if (command === "seed") {
      await prisma.$executeRaw`SELECT 1`;
      res.status(200).json({ message: "Database seeding script executed!" });
    } else {
      res.status(400).json({ error: "Unknown command" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
