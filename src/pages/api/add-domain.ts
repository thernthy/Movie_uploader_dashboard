// pages/api/ex_add_domain.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../utils/db"; // Adjust path as necessary

type Data = {
  message?: string;
  success?: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (req.method === "POST") {
    try {
      const { domain, isAllowed } = req.body;

      // Basic validation
      if (typeof domain !== "string" || typeof isAllowed !== "boolean") {
        return res.status(400).json({ message: "Invalid input data" });
      }

      // Insert domain into the database
      const result = await db.query(
        "INSERT INTO allow_domain (domain_name, status) VALUES (?, ?)",
        [domain, isAllowed ? 1 : 0],
      );

      return res
        .status(201)
        .json({ success: true, message: "Domain added successfully!" });
    } catch (error) {
      console.error("Error inserting domain:", error);
      return res.status(500).json({ message: "Failed to add domain" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
