package com.github.dakusui.simple_tt.core;

import com.github.dakusui.simple_tt.testbases.BrowserSession;
import com.github.dakusui.simple_tt.testbases.WaitingProfile;
import com.github.valid8j.pcond.forms.Printables;
import com.microsoft.playwright.Page;
import jp.co.moneyforward.autotest.framework.action.Act;

import static jp.co.moneyforward.autotest.framework.utils.InsdogUtils.func;
import static jp.co.moneyforward.autotest.framework.utils.InsdogUtils.page;

public enum TestUtils {
  ;
  
  public static Act<Session, Page> pageFromSession() {
    return func(Session::page).describe("pageFromSession");
  }
  
  public static Act<Page, Page> navigateToDashboard() {
    return page(page -> page.navigate("http://localhost:3000/dashboard")).describe("toDashboard");
  }
  
  public static Act<Page, Page> navigateToHello() {
    return page(page -> page.navigate("http://localhost:3000/hello")).describe("toHello");
  }
  
  public static Act.Func<Page, Page> toWaitingPageFunction() {
    return func(Printables.function("toWaitingPage",
                                    (Page page) -> BrowserSession.toWaitingPage(page,
                                                                                WaitingProfile.createStandardProfile())));
  }
}
