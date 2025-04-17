package com.github.dakusui.simple_tt.tests;

import com.github.dakusui.processstreamer.launchers.CurlClient;
import com.github.dakusui.simple_tt.core.Session;
import com.github.dakusui.simple_tt.core.TestBase;
import com.microsoft.playwright.Page;
import jp.co.moneyforward.autotest.framework.action.Scene;
import jp.co.moneyforward.autotest.framework.annotations.*;
import jp.co.moneyforward.autotest.framework.annotations.AutotestExecution.Spec;
import org.junit.jupiter.api.TestInstance;

import static com.github.dakusui.simple_tt.cliches.valid8j.web.Valid8JExpectations.value;
import static com.github.dakusui.simple_tt.core.TestUtils.navigateToDashboard;
import static com.github.dakusui.simple_tt.core.TestUtils.navigateToHello;
import static com.github.valid8j.fluent.Expectations.assertStatement;
import static com.github.valid8j.fluent.Expectations.require;
import static java.util.stream.Collectors.joining;
import static jp.co.moneyforward.autotest.actions.web.TableQuery.Term.term;
import static jp.co.moneyforward.autotest.actions.web.TableQuery.select;
import static jp.co.moneyforward.autotest.framework.testengine.PlanningStrategy.DEPENDENCY_BASED;
import static jp.co.moneyforward.autotest.framework.utils.InsdogUtils.sink;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@AutotestExecution(defaultExecution = @Spec(
    beforeEach = "screenshot",
    value = {"toHello", "toDashboard", "toDashboard$simplerStyle"},
    afterEach = "screenshot",
    planExecutionWith = DEPENDENCY_BASED))
public class Smoke extends TestBase {
  @Named
  public Scene nop() {
    return Scene.begin().end();
  }
  
  @Named
  public Scene unloadDatasets() {
    return Scene.begin().end();
  }
  
  @Named
  public Scene loadDatasets() {
    return Scene.begin().end();
  }
  
  @Named
  public Scene killAll() {
    return Scene.begin().end();
  }
  
  @Named
  @DependsOn("openSession")
  @PreparedBy("nop")
  public Scene ensureServerIsRunning() {
    return Scene.begin("session")
                .add(sink((Session s) -> require(value(CurlClient.begin()
                                                                 .option("-s")
                                                                 .option("-w", "%{http_code}")
//                                                                 .option("-o", "/dev/null")
                                                                 .url(s.healthCheckEndpointUrl())
                                                                 .perform()
                                                                 .collect(joining()))
                                                     .toBe()
                                                     .endingWith("200"))))
                .end();
  }
  
  @DependsOn({"openSession", "ensureServerIsRunning"})
  @Export("page")
  @Named
  public Scene toHello() {
    return Scene.begin("page")
                .add(navigateToHello())
                .end();
  }
  
  @DependsOn({"ensureServerIsRunning", "openSession"})
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
  
  @DependsOn({"ensureServerIsRunning", "openSession"})
  @Export("page")
  @Named
  public void toDashboard$simplerStyle(Page page) {
    page.navigate("http://localhost:3000/dashboard");
  }
  
  @Named
  @When({"toDashboard$simplerStyle"})
  public void thenTestSuiteOfFirstElementInTestSuiteTableIs_First_$simplerStyle(Page r) {
    assertStatement(value(r).tableQuery(select("Test Suite")
                                            .from("body table")
                                            .where(term("#", "0"))
                                            .$())
                            .locatorElementAt(0)
                            .textContent()
                            .toBe()
                            .containing("First"));
  }
}
