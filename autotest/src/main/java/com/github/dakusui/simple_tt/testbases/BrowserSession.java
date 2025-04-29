package com.github.dakusui.simple_tt.testbases;

import com.github.dakusui.osynth.ObjectSynthesizer;
import com.github.dakusui.simple_tt.core.ExecutionProfile;
import com.github.dakusui.simple_tt.core.Session;
import com.github.dakusui.simple_tt.core.TestUtils;
import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.LoadState;
import jp.co.moneyforward.autotest.actions.web.Screenshot;
import jp.co.moneyforward.autotest.framework.action.Scene;
import jp.co.moneyforward.autotest.framework.annotations.*;

import java.util.function.IntSupplier;

import static com.github.dakusui.osynth.ObjectSynthesizer.methodCall;
import static com.github.dakusui.simple_tt.core.TestUtils.pageFromSession;
import static jp.co.moneyforward.autotest.framework.utils.InsdogUtils.func;

public interface BrowserSession {
  static Page toWaitingPage(Page page) {
    return new ObjectSynthesizer().addInterface(Page.class)
                                  .handle(methodCall("locator", String.class, Page.LocatorOptions.class)
                                              .with((ignored, args) -> {
                                                page.waitForLoadState(LoadState.LOAD);
                                                var locator = page.locator((String) args[0], (Page.LocatorOptions) args[1]);
                                                System.out.println("Intercepted: Page#locator: " + locator);
                                                return toWaitingLocator(page, locator);
                                              }))
                                  .handle(methodCall("click", String.class)
                                              .with((ignored, args) -> {
                                                page.waitForLoadState(LoadState.LOAD);
                                                page.click((String) args[0]);
                                                page.waitForLoadState(LoadState.LOAD);
                                                return null;
                                              }))
                                  .fallbackTo(page)
                                  .synthesize()
                                  .castTo(Page.class);
  }
  
  static Locator toWaitingLocator(Page page, Locator locator) {
    return new ObjectSynthesizer().addInterface(Locator.class)
                                  .handle(methodCall("count").with((ignored, args) -> {
                                    System.out.println("Locator: Intercepting count method: " + locator);
                                    waitForStableIntValue(locator::count, 10_000, 3, 100);
                                    return locator.count();
                                  }))
                                  .handle(methodCall("click", Locator.ClickOptions.class).with((ignored, args) -> {
                                    System.out.println("Locator: Intercepting click method: " + locator);
                                    page.waitForLoadState(LoadState.LOAD);
                                    locator.click((Locator.ClickOptions) args[0]);
                                    return null;
                                  }))
                                  .handle(methodCall("fill", String.class, Locator.FillOptions.class).with((ignored, args) -> {
                                    System.out.println("Locator: Intercepting fill method: " + locator);
                                    // The last resort...
                                    Thread.sleep(200);
                                    // locator.focus(); didn't work
                                    //page.waitForLoadState(LoadState.LOAD); NG alone
                                    //locator.waitFor(); NG alone
                                    //NG even in combination
                                    //page.waitForLoadState(LoadState.LOAD);
                                    //locator.waitFor();
                                    locator.fill((String)args[0], (Locator.FillOptions) args[1]);
                                    return null;
                                  }))
                                  .fallbackTo(locator)
                                  .synthesize()
                                  .castTo(Locator.class);
  }
  
  static void waitForStableIntValue(
      IntSupplier supplier,
      int timeoutMillis,
      int stableThreshold,
      int checkIntervalMillis
  ) {
    int stableCount = 0;
    int previous = -1;
    int waited = 0;
    
    while (waited < timeoutMillis) {
      int current = supplier.getAsInt();
      
      if (current == previous) {
        stableCount++;
      } else {
        stableCount = 0;
      }
      
      if (stableCount >= stableThreshold) return;
      
      previous = current;
      
      try {
        Thread.sleep(checkIntervalMillis);
      } catch (InterruptedException e) {
        throw new RuntimeException("Interrupted while waiting for stable int value", e);
      }
      
      waited += checkIntervalMillis;
    }
    
    throw new RuntimeException("Timeout waiting for stable int value: last = " + previous);
  }
  
  @Named
  @Export({"session", "page"})
  @ClosedBy("closeSession")
  default Scene openSession() {
    return Scene.begin()
                .add("session",
                     func(d -> ExecutionProfile.create()
                                               .openSession()).describe("BrowserSession#openSession"))
                .add("page", pageFromSession().andThen(TestUtils.toWaitingPageFunction()), "session")
                .end();
  }
  
  @Named
  @Given("openSession")
  default Scene closeSession() {
    return Scene.begin()
                .add("NONE", func(Session::close).describe("Session#closeSession"), "session")
                .end();
  }
  
  @Named
  @Given("openSession")
  default Scene screenshot() {
    return Scene.begin()
                .add("page", pageFromSession().andThen(new Screenshot()), "session")
                .end();
  }
}
