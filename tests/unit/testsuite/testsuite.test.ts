import { describe, it, expect } from "vitest";

import { Duration, TestManager, TestRunSet } from "../../../models/TestSuite";
import { TestSuite } from "../../../models/TestSuite";
import { readJsonSync } from "../../../models/utils";
import { existsSync, rmSync } from "fs";
import { environments } from "eslint-plugin-jest";

function ensureEmptyDirectoryExists() {
  if (existsSync("/tmp/hello")) rmSync("/tmp/hello", { recursive: true });
}

{
  ensureEmptyDirectoryExists();
  const testManager: TestManager = new TestManager("/tmp/hello");
  describe("TestManager", () => {
    it("can store TestSuite", () => {
      testManager.storeTestSuite(TestSuite.fromJSON(readJsonSync("tests/resources/v2/testsuite.json")));
    });
  });
}
{
  const testManager: TestManager = new TestManager("/tmp/hello");
  testManager.storeTestSuite(TestSuite.fromJSON(readJsonSync("tests/resources/v2/testsuite.json")));
  describe("TestManager, given testSuite loaded, ", () => {
    it("returns the loaded testSuites", () => {
      expect(testManager.testSuites()).toEqual(["com.github.dakusui.sample_tt.example.FirstTest"]);
    });
    it("can return the testcases under a specified testSuite", () => {
      expect(testManager.testCasesFor("com.github.dakusui.sample_tt.example.FirstTest")).toEqual([
        "whenPerformDailyOperation_thenFinishesSuccessfully",
        "whenPerformMonthlyOperation_thenFinishesSuccessfully"
      ]);
    });

    testManager.storeRunSet(TestRunSet.fromJSON(readJsonSync("tests/resources/v2/run-1.json")));
    describe("storeRunSet returns", () => {
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
