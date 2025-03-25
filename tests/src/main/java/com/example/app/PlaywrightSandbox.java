package com.example.app;

import com.microsoft.playwright.Browser;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;

import java.net.URISyntaxException;
import java.nio.file.Path;
import java.nio.file.Paths;

public class PlaywrightSandbox {
    public PlaywrightSandbox() {
    }

    /**
     * This is an entry-point class of the Java 8 example project.
     *
     * @param args Arguments passed through the command line.
     */
    public static void main(String... args) throws URISyntaxException {
        try (Playwright playwright = Playwright.create()) {
            try (Browser browser = playwright.chromium().launch()) {
                Page page = browser.newPage();
                try {
                    page.navigate("http://localhost:3000/dashboard");
                    System.out.println(page.title());
                } finally {
                    Path p = mavenModuleRootFor(PlaywrightSandbox.class).resolve("example.png");
                    page.screenshot(new Page.ScreenshotOptions().setPath(p));
                }
            }
        }
    }

    private static Path mavenModuleRootFor(Class<PlaywrightSandbox> klass) throws URISyntaxException {
        return Paths.get(klass.getProtectionDomain().getCodeSource().getLocation().toURI()).getParent().getParent();
    }

}
