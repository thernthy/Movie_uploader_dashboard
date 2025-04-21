const disk = require("diskusage");
const path = require("path");

async function getDiskSpace() {
  try {
    const { available, free, total } = await disk.check(path.resolve("/"));
    console.log("Disk Space Information:", {
      total,
      free,
      available,
    });
  } catch (error) {
    console.error("Error fetching disk space information:", error);
  }
}

getDiskSpace();
