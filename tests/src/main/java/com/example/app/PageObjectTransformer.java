package com.example.app;

import com.github.valid8j.pcond.core.fluent.AbstractObjectTransformer;
import com.github.valid8j.pcond.core.fluent.Transformer;
import com.github.valid8j.pcond.core.fluent.builtins.ListTransformer;
import com.github.valid8j.pcond.core.fluent.builtins.ObjectChecker;
import com.github.valid8j.pcond.forms.Printables;
import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import jp.co.moneyforward.autotest.actions.web.TableQuery;

import java.util.List;
import java.util.function.Function;
import java.util.function.Supplier;

import static com.github.valid8j.pcond.internals.InternalUtils.trivialIdentityFunction;
import static java.lang.String.format;

public interface PageObjectTransformer<E> extends
    AbstractObjectTransformer<
        PageObjectTransformer<E>,
        ObjectChecker<E, Page>,
        E,
        Page> {
  static PageObjectTransformer<Page> create(Supplier<Page> value) {
    return new Impl<>(value, trivialIdentityFunction());
  }
  
  default PageObjectTransformer<E> tableQuery(TableQuery query) {
    this.function(Printables.function("query:" + query, query::perform));
    return this;
  }
  
  @SuppressWarnings("unchecked")
  default ListTransformer<Page, Locator> asLocatorList() {
    return (ListTransformer<Page, Locator>) this.toList(Printables.function(format("as[List<%s>]", Locator.class.getSimpleName()),
                                                                            v -> (List<Locator>) v));
  }
  
  class Impl<E>
      extends Base<
      PageObjectTransformer<E>,
      ObjectChecker<E, Page>,
      E,
      Page>
      implements PageObjectTransformer<E> {
    public Impl(Supplier<E> rootValue, Function<E, Page> root) {
      super(rootValue, root);
    }
    
    @Override
    protected ObjectChecker<E, Page> toChecker(Function<E, Page> transformFunction) {
      return new ObjectChecker.Impl<>(this::baseValue, transformFunction);
    }
    
    @Override
    protected PageObjectTransformer<Page> rebase() {
      return new Impl<>(this::value, trivialIdentityFunction());
    }
  }
}
