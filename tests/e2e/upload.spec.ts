import { test, expect } from '@playwright/test';

test.describe('UploadPage', () => {
  test('should display the page correctly', async ({ page }) => {
    await page.goto('/upload');
    await expect(page.locator('h1')).toHaveText('Upload Test Run');
    await expect(page.locator('input[type="file"]')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Upload' })).toBeVisible();
  });

  test('should successfully upload a valid JSON file', async ({ page }) => {
    await page.goto('/upload');

    // Upload file
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('input[type="file"]').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles("tests/resources/api-test-1.json");

    // Mock API response
    await page.route('/api/upload', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ fileName: 'api-test-1.json (playwright)' }),
      });
    });

    // Click upload button
    await page.locator('button', { hasText: 'Upload' }).click();

    // Check for success message
   await expect(page.locator('#__next > div > p')).toHaveText(/Upload successful/);
  });
});
