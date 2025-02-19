import { expect } from "vitest";
import { TestCaseState, TestManager } from "../../models/test-manager";
import { createTestManager, ensureEmptyDirectoryExists, primaryRunSet, primaryTestSuite } from "../utils/testutils";
import { Given, Then, When } from "../utils/gwt";

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
        expect(testCaseStates.length).greaterThan(0);
      })
    ),
    When<TestManager>(
      "testCasesForRun is called over (runId, testSuiteId with run)",
      testManager => {
        const ret: string[] = [];
        for (const eachRunId of testManager.runs()) {
          for (const eachTestSuiteId of testManager.testSuitesForRun(eachRunId)) {
            for (const eachTestCaseId of testManager.testCasesForRun(eachRunId, eachTestSuiteId)) {
              ret.push(eachTestCaseId);
            }
          }
        }
        return ret;
      },
      Then<string[]>("testsCaseIds are not empty", testCaseIds => {
        expect(testCaseIds.length).greaterThan(0);
        expect(testCaseIds.every(e => e.length > 0)).toBeTruthy();
      })
    ),
    When<TestManager>(
      "testCasesForRun is called with non-existing runId",
      testManager => {
        return testManager.testCasesForRun("non-existing-run-id", "com.github.dakusui.sample_tt.example.FirstTest");},
      Then<string[]>("testsCaseIds ARE empty", testCaseIds => {
        expect(testCaseIds.length).eq(0);
      })
    )
  );
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
        expect(testCaseStates.length).greaterThan(0);
      })
    )
  );
  Given<void, [TestManager, string]>()(
    "TestManager, which stores a testSuite, a run-set, and a triage for one of the test case runs",
    () => {
      ensureEmptyDirectoryExists();
      const testManager: TestManager = createTestManager();
      testManager.storeTestSuite(primaryTestSuite());
      testManager.storeRunSet(primaryRunSet());
      return [testManager, testManager.runs()[0]];
    },
    When<[TestManager, string]>(
      "storeTriage(...) is called",
      testManagerAndRunId => {
        const [testManager, runId] = testManagerAndRunId;
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
        expect(testManager.fetchTestCaseStates().length).greaterThan(0);
        expect(testManager.fetchTestCaseStates()[0]).toBeTruthy();
      })
    )
  );
  Given<void, [TestManager, string, string]>()(
    "TestManager, which stores a testSuite, a run-set, and a triage for one of the test case runs",
    () => {
      ensureEmptyDirectoryExists();
      const testManager: TestManager = createTestManager();
      testManager.storeTestSuite(primaryTestSuite());
      testManager.storeRunSet(primaryRunSet());
      const runId = testManager.runs()[0];
      const testSuiteId = "com.github.dakusui.sample_tt.example.FirstTest";
      const testCaseId = "whenPerformDailyOperation_thenFinishesSuccessfully";
      testManager.storeTriage(runId, testSuiteId, testCaseId, {
        ticket: "TT-12345",
        insight: "This is a test insight.",
        at: new Date(),
        by: "testUser"
      });
      return [testManager, testSuiteId, testCaseId];
    },
    When<[TestManager, string, string]>(
      "fetchTestCaseState(...) is called",
      context => {
        const [testManager, testSuiteId, testCaseId] = context;
        return testManager.fetchTestCaseState(testSuiteId, testCaseId);
      },
      Then<TestCaseState>("returned TestCaseState with a triage note", testCaseState => {
        expect(testCaseState).toBeTruthy();
        expect(testCaseState.lastResult).toBeTruthy();
        expect(testCaseState.lastTriageNote).toMatchObject({
          ticket: "TT-12345",
          insight: "This is a test insight.",
          at: expect.any(Date)
        });
      })
    )
  );
}
