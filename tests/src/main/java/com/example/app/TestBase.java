package com.example.app;

import com.github.dakusui.actionunit.core.Context;
import com.github.dakusui.actionunit.visitors.ReportingActionPerformer;
import com.microsoft.playwright.Page;
import jp.co.moneyforward.autotest.framework.action.Act;
import jp.co.moneyforward.autotest.framework.core.AutotestRunner;

import java.util.LinkedHashMap;

import static java.util.Collections.synchronizedMap;
import static jp.co.moneyforward.autotest.framework.action.ActUtils.func;
import static jp.co.moneyforward.autotest.framework.action.ActUtils.page;
import static jp.co.moneyforward.autotest.framework.utils.InternalUtils.createContext;

public class TestBase implements AutotestRunner {
    final Context context = createContext();

    static Act<Session, Page> pageFromSession() {
        return func(Session::page).describe("pageFromSession");
    }

    static Act<Page, Page> navigateToDashboard() {
        return page(page -> page.navigate("http://localhost:3000/dashboard")).describe("toDashboard");
    }

    static Act<Page, Page> navigateToStatus() {
        return page(page -> page.navigate("http://localhost:3000/status")).describe("toStatus");
    }

    @Override
    public ReportingActionPerformer actionPerformer() {
        return new ReportingActionPerformer(context, synchronizedMap(new LinkedHashMap<>()));
    }
}
