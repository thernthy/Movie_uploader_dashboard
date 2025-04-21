import type { NextApiRequest, NextApiResponse } from "next";
import systeminformation from "systeminformation";

// Define a custom interface if needed
interface BandwidthMetricsResponse {
  tx_sec: number;
  rx_sec: number;
  tx_sec_mb?: number; // Optional in MB
  rx_sec_mb?: number; // Optional in MB
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BandwidthMetricsResponse | { error: string }>,
) {
  try {
    // Fetch network statistics
    const networkStats = await systeminformation.networkStats();

    // Log the networkStats for debugging
    console.log("Network Stats:", networkStats);

    // Check if networkStats array is empty
    if (networkStats.length === 0) {
      return res.status(404).json({ error: "No network stats available" });
    }

    const networkData = networkStats[0];

    // Destructure tx_sec and rx_sec with default values
    const { tx_sec = 0, rx_sec = 0 } = networkData;

    // Convert from bytes to megabytes
    const tx_sec_mb = parseFloat((tx_sec / (1024 * 1024)).toFixed(2));
    const rx_sec_mb = parseFloat((rx_sec / (1024 * 1024)).toFixed(2));

    res.status(200).json({
      tx_sec,
      rx_sec,
      tx_sec_mb,
      rx_sec_mb,
    });
  } catch (error) {
    console.error("Error fetching bandwidth metrics:", error);
    res.status(500).json({ error: "Failed to fetch bandwidth metrics" });
  }
}
