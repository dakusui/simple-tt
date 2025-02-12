import { describe, it, expect } from "vitest";

import { TestManager, TestRunSet } from "../../../models/TestSuite";
import { TestSuite } from "../../../models/TestSuite";
import { readJsonSync } from "../../../models/utils";
import { rmdirSync } from "fs";
import exp from "constants";

describe("Create a new TestManager object and store a test suite definition", () => {
  rmdirSync("/tmp/hello", { recursive: true });
  const testManager: TestManager = new TestManager("/tmp/hello");

  testManager.storeTestSuite(TestSuite.fromJSON(readJsonSync("tests/resources/v2/testsuite.json")));
  it("testSuites to be expected", () => {
    expect(testManager.testSuites()).toEqual(["com.github.dakusui.sample_tt.example.FirstTest"]);
  });
  it("Find test cases by testSuiteId", () => {
    expect(testManager.testCasesFor("com.github.dakusui.sample_tt.example.FirstTest")).toEqual([
      "whenPerformDailyOperation_thenFinishesSuccessfully"
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
    it("Exists run for an existing new testSuite and testCase", () => {
      expect(
        testManager.existsTestCaseRun(
          runId,
          "com.github.dakusui.sample_tt.example.FirstTest",
          "whenPerformDailyOperation_thenFinishesSuccessfully"
        )
      ).toBe(true);
    });
    it("Fech run for the testCase", () => {

    });
  });
});
