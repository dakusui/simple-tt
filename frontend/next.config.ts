import type { NextConfig } from "next";
import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), "data");
const ANALYSES_DIR = path.join(DATA_DIR, "triage-diagnoses");
const TESTRUNS_DIR  = path.join(DATA_DIR, 'test-runs');

/** Function to run initialization logic only once at startup */
function initializeEnvironment(): void {
  console.log("🚀 Running initialization at startup...");
  if (!fs.existsSync(ANALYSES_DIR)) {
    fs.mkdirSync(ANALYSES_DIR, { recursive: true });
  }
  if (!fs.existsSync(TESTRUNS_DIR)) {
    fs.mkdirSync(TESTRUNS_DIR, { recursive: true });
  }
}

// Ensure initialization runs at startup
initializeEnvironment();

const nextConfig: NextConfig = {
  /* config options here */
};

module.exports = {
  experimental: {
  },
  productionBrowserSourceMaps: true
};

export default nextConfig;
