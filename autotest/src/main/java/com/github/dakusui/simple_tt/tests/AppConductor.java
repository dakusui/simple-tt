package com.github.dakusui.simple_tt.tests;

import com.github.dakusui.processstreamer.launchers.CommandLauncher;
import com.github.dakusui.processstreamer.launchers.CurlLauncher;
import jp.co.moneyforward.autotest.framework.annotations.DependsOn;
import jp.co.moneyforward.autotest.framework.annotations.Export;
import jp.co.moneyforward.autotest.framework.annotations.Named;
import jp.co.moneyforward.autotest.framework.annotations.PreparedBy;

import static com.github.dakusui.simple_tt.cliches.valid8j.web.Valid8JExpectations.value;
import static com.github.valid8j.fluent.Expectations.require;
import static java.util.stream.Collectors.joining;

public interface AppConductor {
  @Named
  default void startApp() {
    CommandLauncher.begin()
                   .command("conductor")
                   .arg("START")
                   .perform()
                   .forEach(System.out::println);
  }
  
  @Named
  default void stopApp() {
    CommandLauncher.begin()
                   .command("conductor")
                   .arg("STOP")
                   .perform()
                   .forEach(System.out::println);
  }
  
  @Named
  @Export
  @PreparedBy("nop")
  @PreparedBy({"stopApp", "startApp"})
  default void appIsRunning() {
    require(value(CurlLauncher.begin()
                              .option("-s")
                              .option("-w", "%{http_code}")
                              .option("-o", "/dev/null")
                              .url("http://localhost:3000/hello")
                              .perform()
                              .collect(joining()))
                .toBe()
                .equalTo("200"));
  }
  
  @Named
  @PreparedBy("nop")
  @PreparedBy({"eraseDataset", "loadDataset"})
  @PreparedBy({"stopApp", "eraseDataset", "startApp", "loadDataset"})
  default void datasetIsLoaded() {
    CommandLauncher.begin()
                   .command("conductor")
                   .arg("IS_DATASET_LOADED")
                   .perform()
                   .forEach(System.out::println);
  }
  
  @DependsOn("appIsRunning")
  @Named
  default void loadDataset() {
    CommandLauncher.begin()
                   .command("conductor")
                   .arg("LOAD_DATASET")
                   .perform()
                   .forEach(System.out::println);
  }
  
  @Named
  default void eraseDataset() {
    CommandLauncher.begin()
                   .command("conductor")
                   .arg("ERASE_DATASET")
                   .perform()
                   .forEach(System.out::println);
  }
}
