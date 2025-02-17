import { describe, it, expect } from "vitest";

import { TestManager } from "../../../models/test-manager";
import { existingRunId, existingTestCase, prepareTestManager, primaryRunSet } from "../../models/testutils";

{
  const testManager: TestManager = prepareTestManager();
  describe("TestManager, which stored  a testSuite, ", () => {
    it("returns the stores testSuites", () => {
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
      expect(testManager.fetchLastTriageFor(testSuiteId, testCaseId)?.note.ticket).toBe("TICKET-001")
    });
  });
}
