package com.github.dakusui.simple_tt.tests;

import com.github.dakusui.processstreamer.launchers.CommandLauncher;
import com.github.dakusui.processstreamer.launchers.CurlLauncher;
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
  public void startServer(@From("session") Session session) {
    CommandLauncher.begin()
                   .command("conductor")
                   .arg("START")
                   .perform()
                   .forEach(System.out::println);
  }
  
  @Named
  public void loadDataset(@From("session") Session session) {
    CommandLauncher.begin()
                   .command("conductor")
                   .arg("LOAD_DATASET")
                   .perform()
                   .forEach(System.out::println);
  }
  
  @Named
  public void eraseDataset(@From("session") Session session) {
    CommandLauncher.begin()
                   .command("conductor")
                   .arg("ERASE_DATASET")
                   .perform()
                   .forEach(System.out::println);
  }
  
  @Named
  public Scene killAll() {
    return Scene.begin().end();
  }
  
  @Named
  @Export
  @DependsOn("openSession")
  @PreparedBy("nop")
  @PreparedBy("startServer")
  public void frontendIsRunning(@From("session") Session session) {
    require(value(CurlLauncher.begin()
                              .option("-s")
                              .option("-w", "%{http_code}")
                              .option("-o", "/dev/null")
                              .url(session.healthCheckEndpointUrl())
                              .perform()
                              .collect(joining()))
                .toBe()
                .equalTo("200"));
  }
  
  @DependsOn({"frontendIsRunning"})
  @Export("page")
  @Named
  public void toHello(@From("page") Page page) {
    navigateToHello().perform(page, null);
  }
  
  @DependsOn({"frontendIsRunning"})
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
  
  @DependsOn({"frontendIsRunning"})
  @Export("page")
  @Named
  public void toDashboard$simplerStyle(Page page) {
    page.navigate("http://localhost:3000/dashboard");
  }
  
  @Named
  @When({"toDashboard$simplerStyle"})
  public void thenTestSuiteOfFirstElementInTestSuiteTableIs_First_$simplerStyle(Page page) {
    assertStatement(value(page).tableQuery(select("Test Suite").from("body table")
                                                               .where(term("#", "0"))
                                                               .$())
                               .locatorElementAt(0)
                               .textContent()
                               .toBe()
                               .containing("First"));
  }
}
