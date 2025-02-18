import { expect } from "vitest";
import { TestCaseState, TestManager } from "../../../models/test-manager";
import { createTestManager, ensureEmptyDirectoryExists, primaryRunSet, primaryTestSuite } from "../../models/testutils";
import { Given, Then, When } from "../../utils/gwt";

Given<void, TestManager>()(
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
);
Given<void, TestManager>()(
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
);
{
  Given<void, TestManager>()(
    "TestManager, which stores a testSuite, ",
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
  );
  Given<void, TestManager>()(
    "TestManager, which stores a testSuite",
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
  );
  Given<void, TestManager>()(
    "TestManager, which stores a testSuite",
    () => {
      ensureEmptyDirectoryExists();
      const testManager: TestManager = createTestManager();
      testManager.storeTestSuite(primaryTestSuite());
      return testManager;
    },
    When<TestManager>(
      "fetchTestCaseState is called over (testSuiteId, testCaseId)",
      testManager => {
        const ret: TestCaseState[] = [];
        for (const eachTestSuiteId of testManager.testSuites()) {
          for (const eachTestCaseId of testManager.testCasesFor(eachTestSuiteId)) {
            ret.push(testManager.fetchTestCaseState(eachTestSuiteId, eachTestCaseId));
          }
        }
        return ret;
      },
      Then<TestCaseState[]>("All test case states are returned.", testCaseStates => {
        console.log(testCaseStates);
        expect(testCaseStates.length).greaterThan(0);
      })));
  Given<void, TestManager>()(
    "TestManager, which stores a testSuite and a run set",
    () => {
      ensureEmptyDirectoryExists();
      const testManager: TestManager = createTestManager();
      testManager.storeTestSuite(primaryTestSuite());
        testManager.storeRunSet(primaryRunSet());
      return testManager;
    },
    When<TestManager>(
      "fetchTestCaseState is called over (testSuiteId, testCaseId)",
      testManager => {
        return testManager.fetchTestCaseStates();
      },
      Then<TestCaseState[]>("All test case states are returned.", testCaseStates => {
        console.log(testCaseStates);
        expect(testCaseStates.length).greaterThan(0);
      })));
  Given<void, TestManager>()(
    "TestManager, which stores a testSuite and a run set",
    () => {
      ensureEmptyDirectoryExists();
      const testManager: TestManager = createTestManager();
      testManager.storeTestSuite(primaryTestSuite());
      testManager.storeRunSet(primaryRunSet());
      return testManager;
    },
    When<TestManager>(
      "storeTriage(...) is called",
      testManager => {
        const runId = testManager.runs()[0];
        testManager.storeTriage(
          runId,
          "com.github.dakusui.sample_tt.example.FirstTest",
          "whenPerformDailyOperation_thenFinishesSuccessfully",
          {
            ticket: "TT-12345",
            insight: "This is a test insight.",
            at: new Date(),
            by: "testUser"
          }
        );
        return testManager;
      },
      Then<TestManager>("testManager can run fetchTestCaseStates().", testManager => {
        console.log(testManager);
        expect(testManager.fetchTestCaseStates()).greaterThan(0);
      })));
}
