package com.example.app;

import com.github.dakusui.actionunit.core.Context;
import com.github.dakusui.actionunit.visitors.ReportingActionPerformer;
import com.microsoft.playwright.*;
import jp.co.moneyforward.autotest.actions.web.Screenshot;
import jp.co.moneyforward.autotest.framework.action.Act;
import jp.co.moneyforward.autotest.framework.action.Scene;
import jp.co.moneyforward.autotest.framework.annotations.*;
import jp.co.moneyforward.autotest.framework.annotations.AutotestExecution.Spec;
import jp.co.moneyforward.autotest.framework.core.AutotestRunner;
import org.junit.jupiter.api.TestInstance;

import java.util.LinkedHashMap;
import java.util.function.Consumer;
import java.util.function.Function;

import static java.util.Collections.synchronizedMap;
import static jp.co.moneyforward.autotest.framework.testengine.PlanningStrategy.DEPENDENCY_BASED;
import static jp.co.moneyforward.autotest.framework.utils.InternalUtils.createContext;
import static jp.co.moneyforward.autotest.framework.utils.InternalUtils.valueOf;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@AutotestExecution(defaultExecution = @Spec(
        beforeEach = "screenshot",
        value = "toDashboard",
        afterEach = "screenshot",
        planExecutionWith = DEPENDENCY_BASED))
public class Smoke implements AutotestRunner {
    interface ExecutionProfile {
        default Session openSession() {
            Playwright playwright = Playwright.create();
            return Session.create(playwright, browserType(playwright), isHeadless());
        }

        default BrowserType browserType(Playwright playwright) {
            return playwright.chromium();
        }

        default boolean isHeadless() {
            return true;
        }

        static ExecutionProfile create() {
            return new ExecutionProfile() {
            };
        }
    }

    record Session(Playwright playwright, Browser browser, Page page) {
        Session close() {
            playwright.close();
            return this;
        }

        static Session create(Playwright playwright, BrowserType browserType, boolean isHeadless) {
            Browser browser = browserType.launch(new BrowserType.LaunchOptions().setHeadless(isHeadless));
            return new Session(playwright,
                               browser,
                               browser.newPage());
        }
    }

    @Named
    @Export("session")
    @ClosedBy("closeSession")
    public static Scene openSession() {
        return Scene.begin()
                    .add("session", let(ExecutionProfile.create().openSession()))
                    .end();
    }


    @DependsOn("openSession")
    @Export("page")
    @Named
    public Scene toDashboard() {
        return Scene.begin("session")
                    .add("page", func(Session::page).describe("page"), "session")
                    .add("page", page(page -> page.navigate("http://localhost:3000/dashboard")).describe("toDashboard"), "page")
                    .end();
    }

    private static DescribableFunc<Page, Page> page(Consumer<Page> action) {
        return func((Page page) -> {
            action.accept(page);
            return page;
        });
    }

    @Named
    @DependsOn("openSession")
    public Scene closeSession() {
        return Scene.begin()
                    .add("NONE", func(Session::close), "session")
                    .end();
    }

    @Named
    @DependsOn("toDashboard")
    public Scene screenshot() {
        return Scene.begin()
                    .add("NONE", new Screenshot(), "page")
                    .end();
    }


    final Context context = createContext();

    @Override
    public ReportingActionPerformer actionPerformer() {
        return new ReportingActionPerformer(context, synchronizedMap(new LinkedHashMap<>()));
    }

    private static <T> Act.Let<T> let(T value) {
        return new Act.Let<>(value);
    }

    private static <T, R> DescribableFunc<T, R> func(Function<T, R> func) {
        return new DescribableFunc<>("", func);
    }

    public static class DescribableFunc<T, R> extends Act.Func<T, R> {
        private final Function<T, R> func;

        DescribableFunc(String description, Function<T, R> func) {
            super(description, func);
            this.func = func;
        }

        public DescribableFunc<T, R> describe(String description) {
            return new DescribableFunc<>(description, func);
        }
    }

    public static class ChainableFunc<T, R> extends Act.Func<T, R> {

        private ChainableFunc(Act.Func<T, R> func) {
            super(func.name(), t -> func.perform(t, null));
        }

        public static <T, R> ChainableFunc<T, R> createChainableFunc() {
            return new ChainableFunc<T, R>();
        }
    }
}
