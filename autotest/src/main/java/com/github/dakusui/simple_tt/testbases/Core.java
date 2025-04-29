package com.github.dakusui.simple_tt.testbases;

import jp.co.moneyforward.autotest.framework.annotations.Named;

public interface Core {
  @Named
  default void nop() {
  }
}
