package com.github.dakusui.simple_tt.core;

import com.microsoft.playwright.BrowserType;
import com.microsoft.playwright.Playwright;

public interface ExecutionProfile {
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
