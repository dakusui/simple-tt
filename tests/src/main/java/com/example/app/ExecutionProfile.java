package com.example.app;

import com.microsoft.playwright.BrowserType;
import com.microsoft.playwright.Playwright;

interface ExecutionProfile {
    default Smoke.Session openSession() {
        Playwright playwright = Playwright.create();
        return Smoke.Session.create(playwright, browserType(playwright), isHeadless());
    }

    default BrowserType browserType(Playwright playwright) {
        return playwright.chromium();
    }

    default boolean isHeadless() {
        return true;
    }

    static ExecutionProfile create() {
        return new ExecutionProfile() {
        };
    }
}
