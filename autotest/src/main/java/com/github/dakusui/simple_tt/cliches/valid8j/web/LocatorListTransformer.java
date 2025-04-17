package com.github.dakusui.simple_tt.cliches.valid8j.web;


import com.github.dakusui.pcond.forms.Functions;
import com.github.valid8j.pcond.core.fluent.builtins.ListTransformer;
import com.github.valid8j.pcond.forms.Printables;
import com.microsoft.playwright.Locator;

import java.util.List;
import java.util.function.Function;
import java.util.function.Supplier;

public interface LocatorListTransformer<T> extends ListTransformer<T, Locator> {
  default LocatorTransformer<T> locatorElementAt(int index) {
    return toLocator(Printables.function("locatorElementAt[" + index + "]", Functions.elementAt(index)));
  }
  
  default LocatorTransformer<T> toLocator(Function<List<Locator>, Locator> func) {
    return this.transformValueWith(func, LocatorTransformer.Impl::new);
  }
  
  class Impl<T> extends ListTransformer.Impl<T, Locator> implements LocatorListTransformer<T> {
    public Impl(Supplier<T> value, Function<T, List<Locator>> transformFunction) {
      super(value, transformFunction);
    }
  }
}
