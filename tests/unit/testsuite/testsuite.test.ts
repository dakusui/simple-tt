import { describe, it, expect } from "vitest";

import { TestManager, TestRunSet } from "../../../models/testsuite";
import { TestSuite } from "../../../models/testsuite";
import { readJsonSync } from "../../../models/utils";
import { existsSync, rmSync } from "fs";

function ensureEmptyDirectoryExists() {
  if (existsSync("/tmp/hello")) rmSync("/tmp/hello", { recursive: true });
}

function createTestManager(): TestManager {
  const testManager: TestManager = new TestManager("/tmp/hello");
  return testManager;
}

function loadTestSuite(testManager: TestManager) {
  testManager.storeTestSuite(primaryTestSuite());
}

function primaryTestSuite(): TestSuite {
  return readJsonSync("tests/resources/v2/testsuite.json");
}

function prepareTestManager() {
  ensureEmptyDirectoryExists();
  const ret = createTestManager();
  loadTestSuite(ret);
  return ret;
}

function primaryRunSet(): TestRunSet {
  return TestRunSet.fromJSON(readJsonSync("tests/resources/v2/run-1.json"));
}

function existingRunId(testManager: TestManager): string {
  const runIds: string[] = testManager.runs();
  if (runIds.length == 0) throw Error("This TestManager doesn't have any runs!");
  return runIds[0];
}

function existingTestCase(testManager: TestManager): { testSuiteId: string; testCaseId: string } {
  const testSuiteIds: string[] = testManager.testSuites();
  if (testSuiteIds.length == 0) throw new Error("No testSuite was found in this TestManager");
  for (const each of testSuiteIds) {
    const testCaseIds: string[] = testManager.testCasesFor(each);
    if (testCaseIds.length == 0) continue;
    return {
      testSuiteId: each,
      testCaseId: testCaseIds[0]
    };
  }
  throw new Error("No testCase was found in this TestManager");
}

{
  const testManager: TestManager = prepareTestManager();
  describe("TestManager", () => {
    it("can store TestSuite", () => {
      testManager.storeTestSuite(primaryTestSuite());
    });
  });
}
{
  const testManager: TestManager = prepareTestManager();
  describe("TestManager, which stored  atestSuite, ", () => {
    it("returns the stored testSuites", () => {
      expect(testManager.testSuites()).toEqual(["com.github.dakusui.sample_tt.example.FirstTest"]);
    });
    it("can return the testcases under a specified testSuite", () => {
      expect(testManager.testCasesFor("com.github.dakusui.sample_tt.example.FirstTest")).toEqual([
        "whenPerformDailyOperation_thenFinishesSuccessfully",
        "whenPerformMonthlyOperation_thenFinishesSuccessfully"
      ]);
    });

    testManager.storeRunSet(primaryRunSet());
    describe("storeRunSet returns", () => {
      it("expected runId", () => {
        const runIds: string[] = testManager.runs();
        expect(runIds.length).toBe(1);
        expect(runIds[0].length).greaterThan(0);
      });
      const runId: string = testManager.runs()[0];
      const testSuiteId = "com.github.dakusui.sample_tt.example.FirstTest";
      const testCaseId = "whenPerformDailyOperation_thenFinishesSuccessfully";
      it("a run for an existing new testSuite and testCase", () => {
        expect(testManager.existsTestCaseRun(runId, testSuiteId, testCaseId)).toBe(true);
      });
      it("Fetch run for the testCase", () => {
        const fetchedTestCaseRun = testManager.fetchTestCaseRun(runId, testSuiteId, testCaseId);
        expect(fetchedTestCaseRun).toEqual(
          expect.objectContaining({
            testSuiteId: testSuiteId,
            testCaseId: testCaseId,
            result: "FAIL",
            duration: expect.objectContaining({ start: "2025-01-31T12:30:10.000Z", end: "2025-01-31T12:30:59.123Z" }),
            environment: expect.objectContaining({
              branch: "test-branch",
              machine: "theophilos",
              user: "hiroshi"
            })
          })
        );
      });
    });
  });
}
{
  const testManager: TestManager = prepareTestManager();
  describe("TestManager#existsTestCaseRun", () => {
    it("returns false for non-existing test case run", () => {
      expect(testManager.existsTestCaseRun("a", "b", "c")).toEqual(false);
    });
    it("returns false", () => {
      expect(
        testManager.existsTestCaseRun(
          existingRunId(testManager),
          existingTestCase(testManager).testSuiteId,
          existingTestCase(testManager).testCaseId
        )
      ).toBe(true);
    });
  });
}
{
  const testManager: TestManager = prepareTestManager();
  describe("TestManager#existsTriage", () => {
    const runId = existingRunId(testManager);
    const testSuiteId = existingTestCase(testManager).testSuiteId;
    const testCaseId = existingTestCase(testManager).testCaseId;
    testManager.storeTriage(runId, testSuiteId, testCaseId, {
      ticket: "TICKET-001",
      insight: "Perhaps a bug",
      by: "hiroshi",
      at: new Date()
    });
    it("return non-empty triages", () => {
      const triagedRuns: string[] = testManager.triagedRuns();
      console.log(triagedRuns);
      expect(triagedRuns.length).greaterThan(0);
    });
    it("returns true for a test case with triage", () => {
      expect(testManager.existsTriage(runId, testSuiteId, testCaseId)).toBe(true);
    });
  });
}

{
  describe("TestManager#existsTriage", () => {
    it("returns false for non-existing testcase", () => {
      const testManager: TestManager = prepareTestManager();
      expect(testManager.existsTriage("a", "b", "c")).toEqual(false);
    });
    it("returns false for existing test case but not yet triaged", () => {
      const testManager: TestManager = prepareTestManager();
      expect(
        testManager.existsTriage(
          "norun",
          existingTestCase(testManager).testSuiteId,
          existingTestCase(testManager).testCaseId
        )
      ).toBe(false);
    });
  });
}
{
  describe("TestManager#existsTriage", () => {
    it("returns the last triage for the specified test case", () => {
      const testManager: TestManager = prepareTestManager();
      testManager.storeRunSet(primaryRunSet());
      const existingTestCaseObject = existingTestCase(testManager);
      const runId = existingRunId(testManager);
      const testSuiteId = existingTestCaseObject.testSuiteId;
      const testCaseId = existingTestCaseObject.testCaseId;
      testManager.storeTriage(runId, testSuiteId, testCaseId, {
        ticket: "TICKET-001",
        insight: "Perhaps a bug",
        by: "hiroshi",
        at: new Date()
      });
      expect(testManager.existsTestCaseRun(runId, testSuiteId, testCaseId)).toBe(true);
      expect(testManager.fetchLastTriageFor(testSuiteId, testCaseId)).toBe("TICKET-001")
    });
  });
}
