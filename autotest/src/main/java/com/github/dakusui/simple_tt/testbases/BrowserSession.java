package com.github.dakusui.simple_tt.testbases;

import com.github.dakusui.simple_tt.core.ExecutionProfile;
import com.github.dakusui.simple_tt.core.Session;
import jp.co.moneyforward.autotest.actions.web.Screenshot;
import jp.co.moneyforward.autotest.framework.action.Scene;
import jp.co.moneyforward.autotest.framework.annotations.ClosedBy;
import jp.co.moneyforward.autotest.framework.annotations.DependsOn;
import jp.co.moneyforward.autotest.framework.annotations.Export;
import jp.co.moneyforward.autotest.framework.annotations.Named;

import static com.github.dakusui.simple_tt.core.TestUtils.pageFromSession;
import static jp.co.moneyforward.autotest.framework.utils.InsdogUtils.func;

public interface BrowserSession {
  @Named
  @Export({"session", "page"})
  @ClosedBy("closeSession")
  default Scene openSession() {
    return Scene.begin()
                .add("session",
                     func(d -> ExecutionProfile.create()
                                               .openSession()).describe("Session.openSession"))
                .add("page", pageFromSession(), "session")
                .end();
  }
  
  @Named
  @DependsOn("openSession")
  default Scene closeSession() {
    return Scene.begin()
                .add("NONE", func(Session::close).describe("Session#closeSession"), "session")
                .end();
  }
  
  @Named
  @DependsOn("openSession")
  default Scene screenshot() {
    return Scene.begin()
                .add("page", pageFromSession().andThen(new Screenshot()), "session")
                .end();
  }
}
