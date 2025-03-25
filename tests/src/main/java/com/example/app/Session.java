package com.example.app;

import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserType;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;

record Session(Playwright playwright, Browser browser, Page page) {
    Session close() {
        playwright.close();
        return this;
    }

    static Session create(Playwright playwright, BrowserType browserType, boolean isHeadless) {
        Browser browser = browserType.launch(new BrowserType.LaunchOptions().setHeadless(isHeadless));
        return new Session(playwright,
                           browser,
                           browser.newPage());
    }
}
