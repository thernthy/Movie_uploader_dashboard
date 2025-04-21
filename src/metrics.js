// src/metrics.js
const fs = require("fs");
const path = require("path");

const requestCountFile = path.join(__dirname, "../request_count.txt");

function readRequestCount() {
  if (fs.existsSync(requestCountFile)) {
    return parseInt(fs.readFileSync(requestCountFile, "utf8")) || 0;
  }
  return 0;
}

function getMetrics() {
  const requestCount = readRequestCount();
  return { requests: requestCount };
}

module.exports = { getMetrics };
