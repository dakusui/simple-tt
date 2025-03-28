package com.example.app;

import com.github.valid8j.pcond.forms.Printables;
import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import jp.co.moneyforward.autotest.actions.web.Screenshot;
import jp.co.moneyforward.autotest.actions.web.TableQuery;
import jp.co.moneyforward.autotest.framework.action.Scene;
import jp.co.moneyforward.autotest.framework.annotations.*;
import jp.co.moneyforward.autotest.framework.annotations.AutotestExecution.Spec;
import org.junit.jupiter.api.TestInstance;

import java.util.function.Function;

import static com.github.valid8j.fluent.Expectations.value;
import static java.lang.String.format;
import static jp.co.moneyforward.autotest.actions.web.TableQuery.Term.term;
import static jp.co.moneyforward.autotest.actions.web.TableQuery.select;
import static jp.co.moneyforward.autotest.framework.action.ActUtils.func;
import static jp.co.moneyforward.autotest.framework.action.ActUtils.let;
import static jp.co.moneyforward.autotest.framework.testengine.PlanningStrategy.DEPENDENCY_BASED;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@AutotestExecution(defaultExecution = @Spec(
    beforeEach = "screenshot",
    value = "toDashboard",
    afterEach = "screenshot",
    planExecutionWith = DEPENDENCY_BASED))
public class Smoke extends TestBase {
  
  @Named
  @Export("session")
  @ClosedBy("closeSession")
  public Scene openSession() {
    return Scene.begin()
                .add("session", let(ExecutionProfile.create().openSession()))
                .end();
  }
  
  
  @DependsOn("openSession")
  @Export("page")
  @Named
  public Scene toDashboard() {
    return Scene.begin("page")
                .add("page", pageFromSession().andThen(navigateToStatus()), "session")
                .assertion((Page r) -> {
                  TableQuery query = select("Test Suite").from("body table")
                                                         .where(term("#", "0"))
                                                         .$();
                  return value(r).function(Printables.function("query:" + query, query::perform))
                                 .asListOf(Locator.class)
                                 .elementAt(0)
                                 .function(textContent())
                                 .asString()
                                 .toBe()
                                 .containing("First!");
                })
                .end();
  }
  
  @DependsOn("openSession")
  @Export("page")
  @Named
  public Scene toDashboard2() {
    TableQuery query = select("Test Suite").from("body table")
                                           .where(term("#", "0"))
                                           .$();
    return Scene.begin("page")
                .add("page", pageFromSession().andThen(navigateToStatus()), "session")
                .assertion((Page r) -> TestUtils.page(r).tableQuery(select("Test Suite").from("body table")
                                                                                        .where(term("#", "0"))
                                                                                        .$())
                                                .asLocatorList()
                                                .elementAt(0)
                                                .function(textContent())
                                                .asString()
                                                .toBe()
                                                .containing("First!"))
                .end();
  }
  
  private static Function<Locator, String> textContent() {
    return Printables.function("textContent", Locator::textContent);
  }
  
  @Named
  @DependsOn("openSession")
  public Scene closeSession() {
    return Scene.begin()
                .add("NONE", func(Session::close), "session")
                .end();
  }
  
  @Named
  @DependsOn("openSession")
  public Scene screenshot() {
    return Scene.begin()
                .add("page", pageFromSession().andThen(new Screenshot()), "session")
                .end();
  }
}
