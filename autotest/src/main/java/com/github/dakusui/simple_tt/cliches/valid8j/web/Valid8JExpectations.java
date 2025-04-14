package com.github.dakusui.simple_tt.cliches.valid8j.web;

import com.github.valid8j.fluent.Expectations;
import com.github.valid8j.pcond.core.fluent.builtins.*;
import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;

import java.util.List;
import java.util.stream.Stream;

public enum Valid8JExpectations {
  ;
  
  public static <E> ObjectTransformer<E, E> value(E value) {
    return Expectations.value(value);
  }
  
  public static <E> ListTransformer<List<E>, E> value(List<E> value) {
    return Expectations.value(value);
  }
  
  public static <E> StreamTransformer<Stream<E>, E> value(Stream<E> value) {
    return Expectations.value(value);
  }
  
  public static StringTransformer<String> value(String value) {
    return Expectations.value(value);
  }
  
  public static IntegerTransformer<Integer> value(int value) {
    return Expectations.value(value);
  }
  
  public static LongTransformer<Long> value(long value) {
    return Expectations.value(value);
  }
  
  public static ShortTransformer<Short> value(short value) {
    return Expectations.value(value);
  }
  
  public static DoubleTransformer<Double> value(double value) {
    return Expectations.value(value);
  }
  
  public static FloatTransformer<Float> value(float value) {
    return Expectations.value(value);
  }
  
  public static BooleanTransformer<Boolean> value(boolean value) {
    return Expectations.value(value);
  }
  
  public static ThrowableTransformer<Throwable, Throwable> value(Throwable value) {
    return Expectations.value(value);
  }
  
  public static PageTransformer<Page> value(Page page) {
    return PageTransformer.create(() -> page);
  }
  
  public static LocatorTransformer<Locator> value(Locator locator) {
    return LocatorTransformer.create(() -> locator);
  }
  
  public static Object parameter() {
    return Expectations.parameter();
  }
}
