package com.example.app;

import com.github.valid8j.fluent.Expectations;
import jp.co.moneyforward.autotest.framework.action.Scene;
import jp.co.moneyforward.autotest.framework.annotations.*;
import jp.co.moneyforward.autotest.framework.annotations.AutotestExecution.Spec;

import static com.example.app.TestUtils.let;
import static com.example.app.TestUtils.sink;
import static jp.co.moneyforward.autotest.framework.testengine.PlanningStrategy.DEPENDENCY_BASED;

@AutotestExecution(defaultExecution = @Spec(
        value = "performScenario",
        planExecutionWith = DEPENDENCY_BASED))
public class ExampleTest extends TestBase {
    @Export
    @Named
    public Scene login() {
        return Scene.begin()
                    .act(let("login"))
                    .act(sink(System.out::println))
                    .end();
    }

    @Export
    @Named
    @PreparedBy({"toHomeScreen"})
    @PreparedBy({"loadLoginSession", "toHomeScreen"})
    @PreparedBy({"login", "saveLoginSession"})
    public Scene isLoggedIn() {
        return Scene.begin()
                    .act(let("isLoggedIn"))
                    .act(sink(System.out::println))
                    .assertion(p -> Expectations.value(p).asObject().toBe().notNull())
                    .end();
    }

    @Named
    @DependsOn("isLoggedIn")
    public Scene performScenario() {
        return Scene.begin()
                    .act(let("performScenario"))
                    .act(sink(System.out::println))
                    .end();
    }

    @Export
    @Named
    public Scene toHomeScreen() {
        return Scene.begin()
                    .act(let("toHomeScreen"))
                    .end();
    }

    @Export
    @Named
    public Scene loadLoginSession() {
        return Scene.begin()
                    .act(let("loadLoginSession"))
                    .end();
    }

    @Export
    @Named
    public Scene saveLoginSession() {
        return Scene.begin()
                    .act(let("saveLoginSession"))
                    .end();
    }

}