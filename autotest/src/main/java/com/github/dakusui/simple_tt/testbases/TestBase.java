package com.github.dakusui.simple_tt.testbases;

import com.github.dakusui.actionunit.core.Context;
import com.github.dakusui.actionunit.visitors.ReportingActionPerformer;
import jp.co.moneyforward.autotest.framework.action.Scene;
import jp.co.moneyforward.autotest.framework.annotations.Named;
import jp.co.moneyforward.autotest.framework.core.AutotestRunner;

import java.util.LinkedHashMap;

import static java.util.Collections.synchronizedMap;
import static jp.co.moneyforward.autotest.framework.internal.InternalUtils.createContext;

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
}
