package com.github.dakusui.simple_tt.tests;

import com.github.dakusui.simple_tt.core.CommandLauncher;
import com.github.dakusui.simple_tt.core.CurlClient;
import com.github.dakusui.simple_tt.core.Session;
import com.github.dakusui.simple_tt.core.TestBase;
import com.microsoft.playwright.Page;
import jp.co.moneyforward.autotest.framework.action.Scene;
import jp.co.moneyforward.autotest.framework.annotations.*;
import jp.co.moneyforward.autotest.framework.annotations.AutotestExecution.Spec;
import org.junit.jupiter.api.TestInstance;

import static com.github.dakusui.simple_tt.cliches.valid8j.web.Valid8JExpectations.value;
import static com.github.dakusui.simple_tt.core.TestUtils.navigateToDashboard;
import static com.github.dakusui.simple_tt.core.TestUtils.navigateToStatus;
import static com.github.valid8j.fluent.Expectations.require;
import static java.util.stream.Collectors.joining;
import static jp.co.moneyforward.autotest.actions.web.TableQuery.Term.term;
import static jp.co.moneyforward.autotest.actions.web.TableQuery.select;
import static jp.co.moneyforward.autotest.framework.testengine.PlanningStrategy.DEPENDENCY_BASED;
import static jp.co.moneyforward.autotest.framework.utils.InsdogUtils.sink;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@AutotestExecution(defaultExecution = @Spec(
    beforeAll = "openSession",
    beforeEach = "screenshot",
    value = {"toStatus", "toDashboard"},
    afterEach = "screenshot",
    planExecutionWith = DEPENDENCY_BASED))
public class Smoke extends TestBase {
  @Named
  public Scene nop() {
    return Scene.begin().end();
  }
  
  @DependsOn("openSession")
  @Named
  public Scene startServer() {
    return Scene.begin("session")
                .add(sink((Session s) -> CommandLauncher.begin()
                                                        .directory(s.frontendDirectory())
                                                        .shell("/bin/nohup")
                                                        .command("npm")
                                                        .arg("run")
                                                        .arg("dev")
                                                        .background()
                                                        .perform()
                                                        .forEach(System.err::println)))
                .end();
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
  @PreparedBy("nop")
  @PreparedBy("startServer")
  public Scene isServerRunning() {
    return Scene.begin("session")
                .add(sink((Session s) -> require(value(CurlClient.begin()
                                                                 .option("-s")
                                                                 .option("-w", "%{http_code}")
                                                                 .option("-o", "/dev/null")
                                                                 .url("http://localhost:3000/status")
                                                                 .perform()
                                                                 .collect(joining()))
                                                     .toBe()
                                                     .equalTo("200"))))
                .end();
  }
  
  @Named
  @DependsOn("isServerRunning")
  @PreparedBy("nop")
  @PreparedBy({"unloadDatasets", "loadDatasets"})
  public Scene isDatasetLoaded() {
    return Scene.begin().end();
  }
  
  @DependsOn({"isServerRunning", "isDatasetLoaded", "openSession"})
  @Export("page")
  @Named
  public Scene toStatus() {
    return Scene.begin("page")
                .add(navigateToStatus())
                .end();
  }
  
  @DependsOn({"isServerRunning", "isDatasetLoaded", "openSession"})
  @Export("page")
  @Named
  public Scene toDashboard() {
    return Scene.begin("page")
                .add(navigateToDashboard())
                .end();
  }
  
  @Named
  @When({"toDashboard", "toStatus"})
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
