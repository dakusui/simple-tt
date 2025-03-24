package com.example.app;

import com.microsoft.playwright.Browser;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;
import com.microsoft.playwright.options.AriaRole;

import java.nio.file.Paths;

public class PlaywrightSandbox {
    public PlaywrightSandbox() {
    }

    /**
     * This is an entry-point class of the Java 8 example project.
     *
     * @param args Arguments passed through the command line.
     */
    public static void main(String... args) {
        try (Playwright playwright = Playwright.create()) {
            try (Browser browser = playwright.chromium().launch()) {
                Page page = browser.newPage();
                try {
                    page.navigate("http://localhost:3000/dashboard");
                    System.out.println(page.title());
                } finally {
                    page.screenshot(new Page.ScreenshotOptions().setPath(Paths.get("target/example.png")));
                }
            }
        }
    }
}
