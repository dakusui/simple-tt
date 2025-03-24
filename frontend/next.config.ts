import type { NextConfig } from "next";
import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), "data", "test-manager");
const ANALYSES_DIR = path.join(DATA_DIR, "triages");
const TESTRUNS_DIR  = path.join(DATA_DIR, 'runs');

/** Function to run initialization logic only once at startup */
function initializeEnvironment(): void {
  console.log("🚀 Running initialization at startup...: DATA_DIR=" + DATA_DIR);
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
  productionBrowserSourceMaps: true,
  /* config options here */
};


export default nextConfig;
