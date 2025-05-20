import { exec } from 'child_process';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  exec('npx prisma db push', (error, stdout, stderr) => {
    if (error) {
      console.error(stderr);
      return res.status(500).json({ error: stderr });
    }
    console.log(stdout);
    res.status(200).json({ message: stdout });
  });
}
