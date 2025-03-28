package com.example.app;

import com.microsoft.playwright.Page;
import jp.co.moneyforward.autotest.framework.action.Act;

import java.util.function.Consumer;

public enum TestUtils {
    ;

    public static Act.Sink<Object> sink(Consumer<Object> consumer) {
        return new Act.Sink<>(consumer);
    }

    public static <T> Act.Let<T> let(T value) {
        return new Act.Let<>(value);
    }
  
  static PageObjectTransformer<Page> page(Page page) {
    return PageObjectTransformer.create(() -> page);
  }
}
