package com.github.dakusui.simple_tt.cliches.valid8j.web;

import com.github.valid8j.pcond.core.fluent.AbstractObjectTransformer;
import com.github.valid8j.pcond.core.fluent.builtins.BooleanTransformer;
import com.github.valid8j.pcond.core.fluent.builtins.ObjectChecker;
import com.github.valid8j.pcond.core.fluent.builtins.StringTransformer;
import com.github.valid8j.pcond.forms.Printables;
import com.microsoft.playwright.Locator;

import java.util.function.Function;
import java.util.function.Supplier;

import static com.github.valid8j.pcond.internals.InternalUtils.trivialIdentityFunction;

public interface LocatorTransformer<E> extends
    AbstractObjectTransformer<
        LocatorTransformer<E>,
        ObjectChecker<E, Locator>,
        E,
        Locator> {
  default StringTransformer<E> textContent() {
    return toString(Printables.function("textContent", Locator::textContent));
  }
  
  default BooleanTransformer<E> visibility() {
    return toBoolean(Printables.function("isVisible", Locator::isVisible));
  }
  
  default LocatorTransformer<E> locator(String selectorOrLocator) {
    return this.toLocator(Printables.function("locator[" + selectorOrLocator + "]", l -> l.locator(selectorOrLocator)));
  }
  
  default LocatorTransformer<E> toLocator(Function<Locator, Locator> func) {
    return this.transformValueWith(func, Impl::new);
  }
  
  
  static LocatorTransformer<Locator> create(Supplier<Locator> locator) {
    return new Impl<>(locator, trivialIdentityFunction());
  }
  
  class Impl<E>
      extends Base<
      LocatorTransformer<E>,
      ObjectChecker<E, Locator>,
      E,
      Locator>
      implements LocatorTransformer<E> {
    public Impl(Supplier<E> rootValue, Function<E, Locator> root) {
      super(rootValue, root);
    }
    
    @Override
    protected ObjectChecker<E, Locator> toChecker(Function<E, Locator> transformFunction) {
      return new ObjectChecker.Impl<>(this::baseValue, transformFunction);
    }
    
    @Override
    protected LocatorTransformer<Locator> rebase() {
      return new Impl<>(this::value, trivialIdentityFunction());
    }
  }
}
