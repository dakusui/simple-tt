package com.github.dakusui.simple_tt.testbases;

import com.github.dakusui.simple_tt.core.ExecutionProfile;
import com.github.dakusui.simple_tt.core.Session;
import com.github.dakusui.simple_tt.core.TestUtils;
import jp.co.moneyforward.autotest.actions.web.Screenshot;
import jp.co.moneyforward.autotest.framework.action.Scene;
import jp.co.moneyforward.autotest.framework.annotations.*;

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
                .add("page", pageFromSession().andThen(TestUtils.toWaitingPageFunction()), "session")
                .end();
  }
  
  @Named
  @Given("openSession")
  default Scene closeSession() {
    return Scene.begin()
                .add("NONE", func(Session::close).describe("Session#closeSession"), "session")
                .end();
  }
  
  @Named
  @Given("openSession")
  default Scene screenshot() {
    return Scene.begin()
                .add("page", pageFromSession().andThen(new Screenshot()), "session")
                .end();
  }
}
