import { exec } from "child_process";
import path from "path";

export default function handler(req, res) {
  const scriptPath = path.join(
    process.cwd(),
    "src/pages/api/laste_videos_folder.py",
  );

  exec(`python ${scriptPath}`, (error, stdout, stderr) => {
    if (error) {
      res.status(500).json({ error: stderr });
    } else {
      try {
        const result = JSON.parse(stdout);
        res.status(200).json(result);
      } catch (e) {
        res.status(200).json({ output: stdout });
      }
    }
  });
}
