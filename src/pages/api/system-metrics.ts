import type { NextApiRequest, NextApiResponse } from "next";
import { exec } from "child_process";
import util from "util";
import path from "path";

const execPromise = util.promisify(exec);

interface SystemMetricsResponse {
  cpuUsed: number;
  ramUsed: number;
  hddUsed: number;
  hddCapacity: number;
  requests: number; // Placeholder for actual request metric
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SystemMetricsResponse | { error: string }>
) {
  if (req.method === "GET") {
    try {
      // Define the absolute path to the Python script
      const scriptPath =
        "/var/www/monsterVideoUploader/src/pages/api/get_system_metrics.py";

      // Execute the Python script
      const { stdout, stderr } = await execPromise(`python3 "${scriptPath}"`);

      if (stderr) {
        throw new Error(stderr);
      }

      // Parse the output from the Python script
      const metrics: SystemMetricsResponse = JSON.parse(stdout);

      res.status(200).json(metrics);
    } catch (error) {
      console.error("Error fetching system metrics:", error);
      res.status(500).json({ error: "Failed to fetch system metrics" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
