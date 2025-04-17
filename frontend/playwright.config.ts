import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests', // Store test files here
  timeout: 30000, // 30s timeout per test
  expect: { timeout: 5000 }, // Assertion timeout
  webServer: {
    command: 'npm run dev', // Start Next.js for testing
    port: 3000, // Ensure it's running on this port
    timeout: 120000, // Wait up to 2 minutes
    reuseExistingServer: true, // Don't restart if already running
  },
  use: {
    baseURL: 'http://localhost:3000', // Base URL for tests
    browserName: 'chromium', // Default browser
    headless: false, // Run in headless mode
    viewport: { width: 1280, height: 720 }, // Default viewport
  },
});
