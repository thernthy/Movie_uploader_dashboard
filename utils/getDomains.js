import { db } from "./db"; // Adjust the path based on your project structure

export const getDomains = async () => {
  try {
    // Perform the database query
    const [rows] = await db.query(
      "SELECT domain_name, id FROM allow_domain WHERE status = 1",
    );
    // Return the rows as is, or you can map them if needed
    return rows;
  } catch (error) {
    console.error("Error fetching domains:", error);
    // Optionally rethrow the error or handle it as needed
    throw new Error("Failed to fetch domai");
  }
};
