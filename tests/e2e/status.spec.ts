import { test, expect } from '@playwright/test';

test.describe('Status Page', () => {
  test('should load status page and display expected content', async ({ page }) => {
    // Navigate to the status page
    await page.goto('/status');

    // // Verify page title
    // await expect(page).toHaveTitle(/statuses/i);

    // Check if a status header exists
    const statusHeader = page.getByRole('heading', { name: /Recent/ });
    await expect(statusHeader).toBeVisible();

    // Check if there is a status message
    const statusMessage = page.getByTestId('status-message-0');

    await expect(statusMessage).toBeVisible();
    await expect(statusMessage).not.toBeEmpty();
  });
});
