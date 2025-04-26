package com.github.dakusui.simple_tt.tests;

import com.github.dakusui.simple_tt.testbases.AppConductor;
import com.github.dakusui.simple_tt.testbases.BrowserSession;
import com.github.dakusui.simple_tt.testbases.TestBase;
import com.microsoft.playwright.Page;
import jp.co.moneyforward.autotest.actions.web.TableQuery;
import jp.co.moneyforward.autotest.framework.action.Scene;
import jp.co.moneyforward.autotest.framework.annotations.*;
import jp.co.moneyforward.autotest.framework.annotations.AutotestExecution.Spec;
import org.junit.jupiter.api.TestInstance;

import java.util.Date;

import static com.github.dakusui.simple_tt.cliches.valid8j.web.Valid8JExpectations.value;
import static com.github.valid8j.fluent.Expectations.assertStatement;
import static java.lang.System.currentTimeMillis;
import static jp.co.moneyforward.autotest.actions.web.TableQuery.Term.term;
import static jp.co.moneyforward.autotest.actions.web.TableQuery.select;
import static jp.co.moneyforward.autotest.framework.testengine.PlanningStrategy.DEPENDENCY_BASED;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@AutotestExecution(defaultExecution = @Spec(
    beforeEach = "screenshot",
    value = {"toDashboard", "clickFirstItemInDashboard", "enterTriageForTheItem"},
    afterEach = "screenshot",
    planExecutionWith = DEPENDENCY_BASED))
public class SimplerSmoke extends TestBase implements SimplettSelectorProfile, BrowserSession, AppConductor {
  @Named
  @Given("datasetIsLoaded")
  @Export({"session", "page"})
  @ClosedBy("closeSession")
  public Scene openSession() {
    return BrowserSession.super.openSession();
  }
  
  @Given({"openSession"})
  @Export("page")
  @Named
  public void toDashboard(Page page) {
    page.navigate("http://localhost:3000/dashboard");
  }
  
  @Named
  @When({"toDashboard"})
  public void thenTestSuiteOfFirstElementInTestSuiteTableIs_First_(Page page) {
    assertStatement(value(page).tableQuery(select("Test Suite")
                                               .from(testSuitesTable())
                                               .where(term("#", "0"))
                                               .$())
                               .locatorElementAt(0)
                               .textContent()
                               .toBe()
                               .containing("First"));
  }
  
  @Given({"toDashboard"})
  @Named
  public void clickFirstItemInDashboard(Page page) {
    TableQuery.select("#")
              .from(testSuitesTable())
              .where(term("#", "0"))
              .$()
              .perform(page)
              .getFirst()
              .click();
  }
  
  @Given({"clickFirstItemInDashboard"})
  @Named
  public void clickFirstItemInTestRuns(Page page) {
    System.out.println("page:" + page);
    TableQuery.select("runId")
              .from(testRunsTable())
              .where(term("runId", "0"))
              .$()
              .perform(page)
              .getFirst()
              .click();
  }
  
  @Given({"clickFirstItemInTestRuns"})
  @Named
  public void enterTriageForTheItem(Page page) {
    page.locator(triageTextArea())
        .fill("Hello:" + new Date(currentTimeMillis()));
    
    page.locator(saveChangesButton()).click();
  }
}
