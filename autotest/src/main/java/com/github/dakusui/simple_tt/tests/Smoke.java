package com.github.dakusui.simple_tt.tests;

import com.github.dakusui.simple_tt.testbases.AppConductor;
import com.github.dakusui.simple_tt.testbases.BrowserSession;
import com.github.dakusui.simple_tt.testbases.TestBase;
import com.microsoft.playwright.Page;
import jp.co.moneyforward.autotest.framework.action.Scene;
import jp.co.moneyforward.autotest.framework.annotations.*;
import jp.co.moneyforward.autotest.framework.annotations.AutotestExecution.Spec;
import org.junit.jupiter.api.TestInstance;

import static com.github.dakusui.simple_tt.cliches.valid8j.web.Valid8JExpectations.value;
import static com.github.dakusui.simple_tt.core.TestUtils.navigateToDashboard;
import static com.github.dakusui.simple_tt.core.TestUtils.navigateToHello;
import static jp.co.moneyforward.autotest.actions.web.TableQuery.Term.term;
import static jp.co.moneyforward.autotest.actions.web.TableQuery.select;
import static jp.co.moneyforward.autotest.framework.testengine.PlanningStrategy.DEPENDENCY_BASED;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@AutotestExecution(defaultExecution = @Spec(
    beforeEach = "screenshot",
    value = {"toHello", "toDashboard"},
    afterEach = "screenshot",
    planExecutionWith = DEPENDENCY_BASED))
public class Smoke extends TestBase implements BrowserSession, AppConductor {
  @Named
  @DependsOn("datasetIsLoaded")
  @Export({"session", "page"})
  @ClosedBy("closeSession")
  public Scene openSession() {
    return BrowserSession.super.openSession();
  }
  
  @DependsOn({"openSession"})
  @Export("page")
  @Named
  public void toHello(@From("page") Page page) {
    navigateToHello().perform(page, null);
  }
  
  @DependsOn({"openSession"})
  @Export("page")
  @Named
  public Scene toDashboard() {
    return Scene.begin("page")
                .add(navigateToDashboard())
                .end();
  }

  @Named
  @When({"toDashboard"})
  public Scene thenTestSuiteOfFirstElementInTestSuiteTableIs_First_() {
    return Scene.begin()
                .assertion((Page r) -> value(r).tableQuery(select("Test Suite")
                                                               .from("body table")
                                                               .where(term("#", "0"))
                                                               .$())
                                               .locatorElementAt(0)
                                               .textContent()
                                               .toBe()
                                               .containing("First"))
                .end();
  }
}
