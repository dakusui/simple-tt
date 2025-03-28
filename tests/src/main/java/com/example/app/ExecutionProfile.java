package com.example.app;

import com.microsoft.playwright.BrowserType;
import com.microsoft.playwright.Playwright;

interface ExecutionProfile {
    default Session openSession() {
        Playwright playwright = Playwright.create();
        return Session.create(playwright, browserType(playwright), isHeadless());
    }

    default BrowserType browserType(Playwright playwright) {
        return playwright.chromium();
    }

    default boolean isHeadless() {
        return false;
    }

    static ExecutionProfile create() {
        return new ExecutionProfile() {
        };
    }
}
