package com.github.dakusui.simple_tt.testbases;

import com.github.dakusui.actionunit.core.Context;
import com.github.dakusui.actionunit.visitors.ReportingActionPerformer;
import com.github.dakusui.osynth.ObjectSynthesizer;
import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.LoadState;
import jp.co.moneyforward.autotest.framework.action.Scene;
import jp.co.moneyforward.autotest.framework.annotations.Named;
import jp.co.moneyforward.autotest.framework.core.AutotestRunner;

import java.util.LinkedHashMap;
import java.util.function.IntSupplier;

import static com.github.dakusui.osynth.ObjectSynthesizer.methodCall;
import static java.util.Collections.synchronizedMap;
import static jp.co.moneyforward.autotest.framework.internal.InternalUtils.createContext;

public abstract class TestBase implements AutotestRunner {
  final Context context = createContext();
  
  public static Page toWaitingPage(Page page) {
    return new ObjectSynthesizer().addInterface(Page.class)
                                  .handle(methodCall("locator", String.class, Page.LocatorOptions.class)
                                              .with((ignored, args) -> {
                                                page.waitForLoadState(LoadState.LOAD);
                                                var locator = page.locator((String) args[0], (Page.LocatorOptions) args[1]);
                                                System.out.println("Page: Intercepting locator method: " + locator);
                                                return toWaitingLocator(page, locator);
                                              }))
                                  .handle(methodCall("click")
                                              .with((ignored, args) -> {
                                                page.click((String) args[0]);
                                                page.waitForLoadState(LoadState.LOAD);
                                                return null;
                                              }))
                                  .fallbackTo(page)
                                  .synthesize()
                                  .castTo(Page.class);
  }
  
  private static Locator toWaitingLocator(Page page, Locator locator) {
    return new ObjectSynthesizer().addInterface(Locator.class)
                                  .handle(methodCall("count").with((ignored, args) -> {
                                    System.out.println("Locator: Intercepting count method: " + locator);
                                    waitForStableIntValue(locator::count, 5000, 3, 150);
                                    return locator.count();
                                  }))
                                  .handle(methodCall("click", Locator.ClickOptions.class).with((ignored, args) -> {
                                    System.out.println("Locator: Intercepting click method: " + locator);
                                    page.waitForLoadState(LoadState.LOAD);
                                    locator.click((Locator.ClickOptions) args[0]);
                                    return null;
                                  }))
                                  .fallbackTo(locator)
                                  .synthesize()
                                  .castTo(Locator.class);
  }
  
  @Named
  public Scene nop() {
    return Scene.begin().end();
  }
  
  @Override
  public ReportingActionPerformer actionPerformer() {
    return new ReportingActionPerformer(context, synchronizedMap(new LinkedHashMap<>()));
  }
  
  
  public static void waitForStableIntValue(
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
  
}
