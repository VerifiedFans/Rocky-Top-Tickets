// pages/api/prisma-deploy.js
import { exec } from "child_process";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("Method Not Allowed");
  }

  const { command } = req.body;

  if (!command) {
    return res.status(400).json({ error: "No command provided" });
  }

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      res.status(500).json({ error: stderr });
      return;
    }
    console.log(`stdout: ${stdout}`);
    res.status(200).json({ output: stdout });
  });
}
