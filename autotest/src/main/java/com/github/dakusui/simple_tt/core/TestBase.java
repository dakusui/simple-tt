package com.github.dakusui.simple_tt.core;

import com.github.dakusui.actionunit.core.Context;
import com.github.dakusui.actionunit.visitors.ReportingActionPerformer;
import jp.co.moneyforward.autotest.actions.web.Screenshot;
import jp.co.moneyforward.autotest.framework.action.Scene;
import jp.co.moneyforward.autotest.framework.annotations.ClosedBy;
import jp.co.moneyforward.autotest.framework.annotations.DependsOn;
import jp.co.moneyforward.autotest.framework.annotations.Export;
import jp.co.moneyforward.autotest.framework.annotations.Named;
import jp.co.moneyforward.autotest.framework.core.AutotestRunner;

import java.util.LinkedHashMap;

import static com.github.dakusui.simple_tt.core.TestUtils.pageFromSession;
import static java.util.Collections.synchronizedMap;
import static jp.co.moneyforward.autotest.framework.internal.InternalUtils.createContext;
import static jp.co.moneyforward.autotest.framework.utils.InsdogUtils.func;
import static jp.co.moneyforward.autotest.framework.utils.InsdogUtils.let;

public abstract class TestBase implements AutotestRunner {
  final Context context = createContext();
  
  @Named
  public Scene nop() {
    return Scene.begin().end();
  }
  
  @Override
  public ReportingActionPerformer actionPerformer() {
    return new ReportingActionPerformer(context, synchronizedMap(new LinkedHashMap<>()));
  }
  
  @Named
  @Export({"session", "page"})
  @DependsOn("datasetIsLoaded")
  @ClosedBy("closeSession")
  public Scene openSession() {
    return Scene.begin()
                .add("session", func(d -> ExecutionProfile.create().openSession()))
                .add("page", pageFromSession(), "session")
                .end();
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
