import { beforeEach, expect } from "vitest";
import { TestManager } from "../../../models/testsuite";
import { createTestManager, ensureEmptyDirectoryExists, primaryRunSet, primaryTestSuite } from "../../models/testutils";
import { Given, Then, When } from "../../utils/gwt";

{
  Given<void, TestManager>(
    "new TestManager",
    () => {
      ensureEmptyDirectoryExists();
      return createTestManager();
    },
    When(
      "stores TestSuite",
      testManager => {
        testManager.storeTestSuite(primaryTestSuite());
        return testManager;
      },
      Then<TestManager>("TestManager returns non-empty for 'testSuite()'", testManager => {
        expect(testManager.testSuites().length).toBeGreaterThan(0);
      })
    )
  )();
}
{
  Given<void, TestManager>(
    "TestManager, which stored a testSuite, ",
    () => {
      ensureEmptyDirectoryExists();
      const testManager: TestManager = createTestManager();
      testManager.storeTestSuite(primaryTestSuite());
      return testManager;
    },
    When(
      "'testSuites()' is called",
      testManager => {
        return testManager.testSuites();
      },
      Then("Only one element is found", testSuites => {
        expect(testSuites).toEqual(["com.github.dakusui.sample_tt.example.FirstTest"]);
      })
    ),
    When(
      "'testCasesFor(...)' returns a list of strings'",
      testManager => {
        return testManager.testCasesFor("com.github.dakusui.sample_tt.example.FirstTest");
      },
      Then("", returnedList => {
        expect(returnedList).toEqual(["whenPerformDailyOperation_thenFinishesSuccessfully"]);
      })
    )
  )();
  Given<void, TestManager>(
    "TestManager, which stored a testSuite, ",
    () => {
      ensureEmptyDirectoryExists();
      const testManager: TestManager = createTestManager();
      testManager.storeTestSuite(primaryTestSuite());
      return testManager;
    },
    When(
      "'storeRunset(...)' is called",
      testManager => {
        testManager.storeRunSet(primaryRunSet());
        return testManager.testSuites();
      },
      Then("Test Suite defined in fixture is found.", testSuites => {
        expect(testSuites).toEqual(["com.github.dakusui.sample_tt.example.FirstTest"]);
      })
    ),
    When(
      "'testCasesFor(...)' returns a list of strings'",
      testManager => {
        return testManager.testCasesFor("com.github.dakusui.sample_tt.example.FirstTest");
      },
      Then("Two test cases from test suite and test run are found", returnedList => {
        expect(returnedList).toEqual([
          "whenPerformDailyOperation_thenFinishesSuccessfully",
          "whenPerformMonthlyOperation_thenFinishesSuccessfully"
        ]);
      })
    )
  )();
}
