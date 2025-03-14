import { Browser, chromium, Page } from "playwright";
import { Done, func, Given, Then, When } from "../utils/gwt-async";
import { expect } from "playwright/test";

// Define the base URL of your Next.js app
const BASE_URL = "http://localhost:3000";

type BrowserContext = { browser: Browser; page: Page };

async function openNewContextAsync(): Promise<BrowserContext> {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  return { browser, page } as BrowserContext;
}

await Given<void, BrowserContext>()(
  () => openNewContextAsync(),
  When<BrowserContext, Page>(
    func(async (context: BrowserContext) => {
      const p = context.page;
      await p.goto(`${BASE_URL}/status`);
      return p;
    }).explain("Open the status page"),
    Then<Page>(func(async (page: Page) => {
      await expect(page).not.toBeNull();
    }).explain("The page should not be null")),
    Then<Page>(func(async (page: Page) => {
      await page.screenshot({ path: "status.png" });
    }).explain("Take a screenshot of the page"))
  )
)(Done<BrowserContext>(c => c.browser.close()));
