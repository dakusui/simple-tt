import { expect } from "vitest";
import { TestManager } from "../../../models/test-manager";
import { createTestManager, ensureEmptyDirectoryExists, primaryRunSet, primaryTestSuite } from "../../models/testutils";
import { Given, Then, When } from "../../utils/gwt";

Given(
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
)("");
Given<void, TestManager>(
  "new TestManager",
  () => {
    ensureEmptyDirectoryExists();
    return createTestManager();
  },
  When<TestManager>(
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
{
  Given<void, TestManager>(
    "TestManager, which stored a testSuite, ",
    () => {
      ensureEmptyDirectoryExists();
      const testManager: TestManager = createTestManager();
      testManager.storeTestSuite(primaryTestSuite());
      return testManager;
    },
    When<TestManager>(
      "'testSuites()' is called",
      testManager => {
        return testManager.testSuites();
      },
      Then<TestManager>("Only one element is found", testSuites => {
        expect(testSuites).toEqual(["com.github.dakusui.sample_tt.example.FirstTest"]);
      })
    ),
    When<TestManager>(
      "'testCasesFor(...)' is performed",
      testManager => {
        return testManager.testCasesFor("com.github.dakusui.sample_tt.example.FirstTest");
      },
      Then<TestManager>("Expected test case ID is returned.", returnedList => {
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
    When<TestManager>(
      "'storeRunset(...)' is called",
      testManager => {
        testManager.storeRunSet(primaryRunSet());
        return testManager.testSuites();
      },
      Then<TestManager>("Test Suite defined in fixture is found.", testSuites => {
        expect(testSuites).toEqual(["com.github.dakusui.sample_tt.example.FirstTest"]);
      })
    ),
    When<TestManager>(
      "'testCasesFor(...)' returns a list of strings'",
      testManager => {
        return testManager.testCasesFor("com.github.dakusui.sample_tt.example.FirstTest");
      },
      Then<TestManager>("Two test cases from test suite and test run are found", returnedList => {
        expect(returnedList).toEqual([
          "whenPerformDailyOperation_thenFinishesSuccessfully",
          "whenPerformMonthlyOperation_thenFinishesSuccessfully"
        ]);
      })
    )
  )();
}
