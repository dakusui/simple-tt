package com.github.dakusui.simple_tt.core;

import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserType;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;

public record Session(Playwright playwright, Browser browser, Page page) {
  public Session close() {
    try {
      browser.close();
    } finally {
      playwright.close();
    }
    return this;
  }
  
  static Session create(Playwright playwright, BrowserType browserType, boolean isHeadless) {
    Browser browser = browserType.launch(new BrowserType.LaunchOptions()
                                             .setTimeout(5_000)
                                             .setHeadless(isHeadless));
    return new Session(playwright,
                       browser,
                       browser.newPage());
  }
}
