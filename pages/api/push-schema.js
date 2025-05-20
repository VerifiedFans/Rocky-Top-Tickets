// pages/api/push-schema.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Prisma logic here
    const { exec } = require('child_process');
    exec('npx prisma db push', (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({ error: stderr });
      }
      return res.status(200).json({ message: 'Schema pushed!', output: stdout });
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
