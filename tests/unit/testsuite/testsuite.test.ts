import { describe, it, expect } from "vitest";

import { TestManager, TestRunSet } from "../../../models/TestSuite";
import { TestSuite } from "../../../models/TestSuite";
import { readJsonSync } from "../../../models/utils";
import { existsSync, rmSync } from "fs";

describe("Create a new TestManager object and store a test suite definition", () => {
  if (existsSync("/tmp/hello")) rmSync("/tmp/hello", { recursive: true });
  const testManager: TestManager = new TestManager("/tmp/hello");

  testManager.storeTestSuite(TestSuite.fromJSON(readJsonSync("tests/resources/v2/testsuite.json")));
  it("testSuites to be expected", () => {
    expect(testManager.testSuites()).toEqual(["com.github.dakusui.sample_tt.example.FirstTest"]);
  });
  it("Find test cases by testSuiteId", () => {
    expect(testManager.testCasesFor("com.github.dakusui.sample_tt.example.FirstTest")).toEqual([
      "whenPerformDailyOperation_thenFinishesSuccessfully",
      "whenPerformMonthlyOperation_thenFinishesSuccessfully"
    ]);
  });
  describe("Store a new run set", () => {
    testManager.storeRunSet(TestRunSet.fromJSON(readJsonSync("tests/resources/v2/run-1.json")));
    it("runId is as expected", () => {
      const runIds: string[] = testManager.runs();
      expect(runIds.length).toBe(1);
      expect(runIds[0].length).greaterThan(0);
    });
    const runId: string = testManager.runs()[0];
    const testSuiteId = "com.github.dakusui.sample_tt.example.FirstTest";
    const testCaseId = "whenPerformDailyOperation_thenFinishesSuccessfully";
    it("Exists run for an existing new testSuite and testCase", () => {
      expect(testManager.existsTestCaseRun(runId, testSuiteId, testCaseId)).toBe(true);
    });
    it("Fetch run for the testCase", () => {
      const fetcedTestCaseRun = testManager.fetchTestCaseRun(runId, testSuiteId, testCaseId);
      expect(fetcedTestCaseRun.result).toBe("FAIL");
      expect(fetcedTestCaseRun.testCaseId).toBe(testCaseId);
      expect(fetcedTestCaseRun.testSuiteId).toBe(testSuiteId);
      expect(fetcedTestCaseRun.duration.start).toMatch("2025-01-31T12:30:10Z");
      expect(fetcedTestCaseRun.duration.end).toMatch("2025-01-31T12:30:99Z");
      expect(fetcedTestCaseRun.environment.branch).toMatch("test-branch");
      expect(fetcedTestCaseRun.environment.machine).toMatch("theophilos");
      expect(fetcedTestCaseRun.environment.user).toMatch("hiroshi");
    });
  });
});
