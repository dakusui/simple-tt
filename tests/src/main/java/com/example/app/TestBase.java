package com.example.app;

import com.github.dakusui.actionunit.visitors.ReportingActionPerformer;
import jp.co.moneyforward.autotest.framework.core.AutotestRunner;

public class TestBase implements AutotestRunner {
    @Override
    public ReportingActionPerformer actionPerformer() {
        return ReportingActionPerformer.create();
    }
}
