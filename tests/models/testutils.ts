import { existsSync, rmSync } from "fs";
import { TestManager, TestRunSet, TestSuite } from "../../models/test-manager";
import { readJsonSync } from "../../models/utils";

export function ensureEmptyDirectoryExists() {
  if (existsSync("/tmp/hello")) rmSync("/tmp/hello", { recursive: true });
}

export function createTestManager(): TestManager {
  const testManager: TestManager = new TestManager("/tmp/hello");
  return testManager;
}

export function loadTestSuite(testManager: TestManager) {
  testManager.storeTestSuite(primaryTestSuite());
}

export function primaryTestSuite(): TestSuite {
  return TestSuite.fromJSON(readJsonSync("tests/resources/v2/testsuite.json"));
}

export function prepareTestManager() {
  ensureEmptyDirectoryExists();
  const ret = createTestManager();
  loadTestSuite(ret);
  return ret;
}

export function primaryRunSet(): TestRunSet {
  return TestRunSet.fromJSON(readJsonSync("tests/resources/v2/run-1.json"));
}

export function existingRunId(testManager: TestManager): string {
  const runIds: string[] = testManager.runs();
  if (runIds.length == 0) throw Error("This TestManager doesn't have any runs!");
  return runIds[0];
}

export function existingTestCase(testManager: TestManager): { testSuiteId: string; testCaseId: string } {
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
