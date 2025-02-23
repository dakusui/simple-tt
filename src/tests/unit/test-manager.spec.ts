import { expect } from "vitest";
import { TestCaseRunWithTriage } from "../../models/test-entities";
import { TestManager } from "../../models/test-manager";
import { Given, Then, When } from "../utils/gwt";
import {
  createTestManager,
  ensureSessionDirectoryIsAbsent,
  primaryRunSet,
  primaryTestSuite,
  secondaryRunSet,
} from "../utils/testutils";

Given<void, TestManager>()(
  "new TestManager",
  () => {
    return createTestManager(ensureSessionDirectoryIsAbsent());
  },
  When<TestManager, TestManager>(
    "stores TestSuite",
    testManager => {
      testManager.storeTestSuite(primaryTestSuite());
      return testManager;
    },
    Then<TestManager>("TestManager returns non-empty for 'testSuite()'", testManager => {
      expect(testManager.testSuites().length).toBeGreaterThan(0);
    })
  ),
  When<TestManager, TestManager>(
    "stores TestSuite (2)",
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
  "TestManager, which stores a testSuite, ",
  () => {
    const testManager: TestManager = createTestManager(ensureSessionDirectoryIsAbsent());
    testManager.storeTestSuite(primaryTestSuite());
    return testManager;
  },
  When<TestManager, string[]>(
    "'testSuites()' is called",
    testManager => {
      return testManager.testSuites();
    },
    Then<string[]>("Only one element is found", testSuites => {
      expect(testSuites).toEqual(["com.github.dakusui.sample_tt.example.FirstTest"]);
    })
  ),
  When<TestManager, string[]>(
    "'testCasesFor(...)' is performed",
    testManager => {
      return testManager.testCasesFor("com.github.dakusui.sample_tt.example.FirstTest");
    },
    Then<string[]>("Expected test case ID is returned.", returnedList => {
      expect(returnedList).toEqual(["whenPerformDailyOperation_thenFinishesSuccessfully"]);
    })
  )
);
Given<void, TestManager>()(
  "TestManager, which stores a testSuite",
  () => {
    const testManager: TestManager = createTestManager(ensureSessionDirectoryIsAbsent());
    testManager.storeTestSuite(primaryTestSuite());
    return testManager;
  },
  When<TestManager, [TestManager, string]>(
    "'storeRunSet(...)' is called",
    testManager => {
      return [testManager, testManager.storeRunSet(primaryRunSet())];
    },
    Then<[TestManager, string]>("Returned ID is contained in 'runs()'", testManagerAndRunId => {
      const [testManager, runId] = testManagerAndRunId;
      expect(testManager.runs()).toContain(runId);
    })
  ),
  When<TestManager, string[]>(
    "'testCasesFor(...)' returns a list of strings'",
    testManager => {
      return testManager.testCasesFor("com.github.dakusui.sample_tt.example.FirstTest");
    },
    Then<string[]>("Two test cases from test suite and test run are found", returnedList => {
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
    const testManager: TestManager = createTestManager(ensureSessionDirectoryIsAbsent());
    testManager.storeTestSuite(primaryTestSuite());
    return testManager;
  },
  When<TestManager, TestCaseRunWithTriage[]>(
    "fetchTestCaseState is called over (testSuiteId, testCaseId)",
    testManager => {
      const ret: TestCaseRunWithTriage[] = [];
      for (const eachTestSuiteId of testManager.testSuites()) {
        for (const eachTestCaseId of testManager.testCasesFor(eachTestSuiteId)) {
          ret.push(testManager.retrieveLastTestCaseRunWithLastTriage(eachTestSuiteId, eachTestCaseId));
        }
      }
      return ret;
    },
    Then<TestCaseRunWithTriage[]>("All test case states are returned.", testCaseStates => {
      expect(testCaseStates.length).greaterThan(0);
    })
  ),
  When<TestManager, string[]>(
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
  When<TestManager, string[]>(
    "testCasesForRun is called with non-existing runId",
    testManager => {
      return testManager.testCasesForRun("non-existing-run-id", "com.github.dakusui.sample_tt.example.FirstTest");
    },
    Then<string[]>("testsCaseIds ARE empty", testCaseIds => {
      expect(testCaseIds.length).eq(0);
    })
  )
);
Given<void, TestManager>()(
  "TestManager, which stores a testSuite and a run set",
  () => {
    const testManager: TestManager = createTestManager(ensureSessionDirectoryIsAbsent());
    testManager.storeTestSuite(primaryTestSuite());
    testManager.storeRunSet(primaryRunSet());
    return testManager;
  },
  When<TestManager, TestCaseRunWithTriage[]>(
    "fetchTestCaseState is called over (testSuiteId, testCaseId)",
    testManager => {
      return testManager.retrieveLatestTestCaseStates();
    },
    Then<TestCaseRunWithTriage[]>("All test case states are returned.", testCaseStates => {
      expect(testCaseStates.length).greaterThan(0);
    })
  )
);
Given<void, [TestManager, string]>()(
  "TestManager, which stores a testSuite, a run-set, and a triage for one of the test case runs",
  () => {
    const testManager: TestManager = createTestManager(ensureSessionDirectoryIsAbsent());
    testManager.storeTestSuite(primaryTestSuite());
    testManager.storeRunSet(primaryRunSet());
    return [testManager, testManager.runs()[0]];
  },
  When<[TestManager, string], TestManager>(
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
      expect(testManager.retrieveLatestTestCaseStates().length).greaterThan(0);
      expect(testManager.retrieveLatestTestCaseStates()[0]).toBeTruthy();
    })
  )
);
Given<void, [TestManager, string, string]>()(
  "TestManager, which stores a testSuite, a run-set, and a triage for one of the test case runs",
  () => {
    const testManager: TestManager = createTestManager(ensureSessionDirectoryIsAbsent());
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
  When<[TestManager, string, string], TestCaseRunWithTriage>(
    "fetchTestCaseState(...) is called",
    context => {
      const [testManager, testSuiteId, testCaseId] = context;
      return testManager.retrieveLastTestCaseRunWithLastTriage(testSuiteId, testCaseId);
    },
    Then<TestCaseRunWithTriage>("returned TestCaseState with a triage note", testCaseState => {
      expect(testCaseState).toBeTruthy();
      expect(testCaseState.result).toBeTruthy();
      expect(testCaseState.triageNote).toMatchObject({
        ticket: "TT-12345",
        insight: "This is a test insight.",
        at: expect.any(Date)
      });
    })
  )
);
Given<void, [TestManager, string, string]>()(
  "TestManager, which stores two run-sets",
  () => {
    const testManager: TestManager = createTestManager(ensureSessionDirectoryIsAbsent());
    testManager.storeTestSuite(primaryTestSuite());
    testManager.storeRunSet(primaryRunSet());
    testManager.storeRunSet(secondaryRunSet());
    const testSuiteId = "com.github.dakusui.sample_tt.example.FirstTest";
    const testCaseId = "whenPerformDailyOperation_thenFinishesSuccessfully";
    return [testManager, testSuiteId, testCaseId];
  },
  When<[TestManager, string, string], [string, TestCaseRunWithTriage][]>(
    "retrieveRunHistoryFor(...) is called",
    context => {
      const [testManager, testSuiteId, testCaseId] = context;
      return testManager.retrieveRunHistoryFor(testSuiteId, testCaseId);
    },
    Then<[string, TestCaseRunWithTriage][]>("returned TestCaseState with a triage note", testCaseRunHistory => {
      const [runId0, testCaseState0] = testCaseRunHistory[0];
      const [runId1, testCaseState1] = testCaseRunHistory[1];
      expect(testCaseRunHistory.length).toBe(2);
      expect(runId0).toBeTruthy();
      expect(testCaseState0).toBeTruthy();
      expect(runId1).toBeTruthy();
      expect(testCaseState1).toBeTruthy();
    })
  )
);
Given<void, [TestManager, string, string]>()(
  "TestManager, which stores two run-sets and a triage for one of the test case runs",
  () => {
    const testManager: TestManager = createTestManager(ensureSessionDirectoryIsAbsent());
    testManager.storeTestSuite(primaryTestSuite());
    testManager.storeRunSet(primaryRunSet());
    testManager.storeRunSet(secondaryRunSet());

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
  When<[TestManager, string, string], [string, TestCaseRunWithTriage][]>(
    "retrieveRunHistoryFor(...) is called",
    context => {
      const [testManager, testSuiteId, testCaseId] = context;
      return testManager.retrieveRunHistoryFor(testSuiteId, testCaseId);
    },
    Then<[string, TestCaseRunWithTriage][]>("returned TestCaseRun[] with a triage note", testCaseRunHistory => {
      const [runId0, testCaseState0] = testCaseRunHistory[0];
      const [runId1, testCaseState1] = testCaseRunHistory[1];
      expect(testCaseRunHistory.length).toBe(2);
      expect(runId0).toBeTruthy();
      expect(testCaseState0).toBeTruthy();
      expect(testCaseState0.triageNote).toBeTruthy();
      expect(runId1).toBeTruthy();
      expect(testCaseState1).toBeTruthy();
      expect(testCaseState1.triageNote).toBeFalsy();
    })
  )
);
