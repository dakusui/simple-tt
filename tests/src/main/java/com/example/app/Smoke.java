package com.example.app;

import com.microsoft.playwright.Page;
import jp.co.moneyforward.autotest.actions.web.PageAct;
import jp.co.moneyforward.autotest.framework.action.Scene;
import jp.co.moneyforward.autotest.framework.annotations.AutotestExecution;
import jp.co.moneyforward.autotest.framework.annotations.AutotestExecution.Spec;
import jp.co.moneyforward.autotest.framework.annotations.DependsOn;
import jp.co.moneyforward.autotest.framework.annotations.Named;
import jp.co.moneyforward.autotest.framework.core.ExecutionEnvironment;

import static jp.co.moneyforward.autotest.framework.testengine.PlanningStrategy.DEPENDENCY_BASED;

@AutotestExecution(defaultExecution = @Spec(
        value = "performScenario",
        planExecutionWith = DEPENDENCY_BASED))
public class Smoke {
    @DependsOn()
    @Named
    public Scene toDashboard() {
        String description = "";
        return Scene.begin()
                    .act(new PageAct(description) {

                        @Override
                        protected void action(Page page, ExecutionEnvironment executionEnvironment) {

                        }
                    })
                    .end();
    }
}
