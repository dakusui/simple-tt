import { existsSync, rmSync } from "fs";
import { TestManager, TestRunSet, TestSuite } from "../../models/test-manager";
import { readJsonSync } from "../../models/utils";

export function ensureSessionDirectoryIsAbsent() : string {
  const sessionId = Math.random().toString(36).substring(7);
  if (existsSync("/tmp/test-manager/" + sessionId)) rmSync("/tmp/test-manager/" + sessionId, { recursive: true });
  return sessionId;
}

export function createTestManager(sessionId: string): TestManager {
  const testManager: TestManager = new TestManager("/tmp/test-manager/" + sessionId);
  return testManager;
}

export function loadTestSuite(testManager: TestManager) {
  testManager.storeTestSuite(primaryTestSuite());
}

export function primaryTestSuite(): TestSuite {
  return TestSuite.fromJSON(readJsonSync("src/tests/resources/v2/testsuite.json"));
}

export function prepareTestManager() {
  const ret = createTestManager(ensureSessionDirectoryIsAbsent());
  loadTestSuite(ret);
  return ret;
}

export function primaryRunSet(): TestRunSet {
  return TestRunSet.fromJSON(readJsonSync("src/tests/resources/v2/run-1.json"));
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
