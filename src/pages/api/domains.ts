// pages/api/domains.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getDomains } from "../../../utils/getDomains"; // Adjust the path as necessary

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const domains = await getDomains();
    res.status(200).json(domains);
  } catch (error) {
    console.error("Failed to fetch domains:", error);
    res.status(500).json({ error: "Failed to fetch domains" });
  }
}
