export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { exec } = await import('child_process');
    const util = await import('util');
    const execProm = util.promisify(exec);

    const { stdout, stderr } = await execProm('npx prisma db push');

    if (stderr) {
      console.error(stderr);
      return res.status(500).json({ error: 'Prisma error', details: stderr });
    }

    return res.status(200).json({ message: 'Schema pushed!', output: stdout });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Unexpected error', details: error.message });
  }
}
