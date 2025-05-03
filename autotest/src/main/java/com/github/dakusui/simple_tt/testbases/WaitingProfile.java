package com.github.dakusui.simple_tt.testbases;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.LoadState;

public interface WaitingProfile {
  void locator(Page page, String selector, Page.LocatorOptions options) throws Throwable;
  
  void click(Page page, String selector, Page.ClickOptions options) throws Throwable;
  
  void count(Page page, Locator locator) throws Throwable;
  
  void click(Page page, Locator locator, Locator.ClickOptions options) throws Throwable;
  
  void fill(Page page, Locator locator, String value, Locator.FillOptions options) throws Throwable;
  
  static WaitingProfile createStandardProfile() {
    return new WaitingProfile() {
      @Override
      public void locator(Page page, String selector, Page.LocatorOptions options) {
        page.waitForLoadState(LoadState.LOAD);
      }
      
      @Override
      public void click(Page page, String selector, Page.ClickOptions options) {
        page.waitForLoadState(LoadState.LOAD);
      }
      
      @Override
      public void count(Page page, Locator locator) {
        System.out.println("Locator: Intercepting count method: " + locator);
        BrowserSession.waitForStableIntValue(locator::count, 10_000, 4, 400);
      }
      
      @Override
      public void click(Page page, Locator locator, Locator.ClickOptions options) throws Throwable {
        System.out.println("Locator: Intercepting fill method: " + locator);
        page.waitForLoadState(LoadState.LOAD);
      }
      
      @Override
      public void fill(Page page, Locator locator, String value, Locator.FillOptions options) throws Throwable{
        // The last resort...
        Thread.sleep(400);
        // locator.focus(); didn't work
        //page.waitForLoadState(LoadState.LOAD); NG alone
        //locator.waitFor(); NG alone
        //NG even in combination
        //page.waitForLoadState(LoadState.LOAD);
        //locator.waitFor();
      
      }
    };
  }
}
