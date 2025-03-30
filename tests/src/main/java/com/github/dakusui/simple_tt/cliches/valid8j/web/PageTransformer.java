package com.github.dakusui.simple_tt.cliches.valid8j.web;

import com.github.valid8j.pcond.core.fluent.AbstractObjectTransformer;
import com.github.valid8j.pcond.core.fluent.builtins.ObjectChecker;
import com.github.valid8j.pcond.forms.Printables;
import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import jp.co.moneyforward.autotest.actions.web.TableQuery;

import java.util.List;
import java.util.function.Function;
import java.util.function.Supplier;

import static com.github.valid8j.pcond.internals.InternalUtils.trivialIdentityFunction;

public interface PageTransformer<E> extends
    AbstractObjectTransformer<
        PageTransformer<E>,
        ObjectChecker<E, Page>,
        E,
        Page> {
  static PageTransformer<Page> create(Supplier<Page> value) {
    return new Impl<>(value, trivialIdentityFunction());
  }
  
  default LocatorListTransformer<E> tableQuery(TableQuery query) {
    return this.toLocatorList(Printables.function("query[" + query + "]", query::perform));
  }
  
  
  default LocatorListTransformer<E> toLocatorList(Function<Page, List<Locator>> function) {
    return (LocatorListTransformer<E>) this.transformValueWith(function, LocatorListTransformer.Impl::new);
  }
  
  class Impl<E>
      extends Base<
      PageTransformer<E>,
      ObjectChecker<E, Page>,
      E,
      Page>
      implements PageTransformer<E> {
    public Impl(Supplier<E> rootValue, Function<E, Page> root) {
      super(rootValue, root);
    }
    
    @Override
    protected ObjectChecker<E, Page> toChecker(Function<E, Page> transformFunction) {
      return new ObjectChecker.Impl<>(this::baseValue, transformFunction);
    }
    
    @Override
    protected PageTransformer<Page> rebase() {
      return new Impl<>(this::value, trivialIdentityFunction());
    }
  }
}
