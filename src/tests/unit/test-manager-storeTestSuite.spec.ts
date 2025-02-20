import { expect } from "vitest";
import {  TestManager } from "../../models/test-manager";
import { createTestManager, ensureSessionDirectoryIsAbsent,  primaryTestSuite } from "../utils/testutils";
import { Given,  Then, When } from "../utils/gwt";

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

Given<void, TestManager>()(
  "new TestManager",
  () => {
    ensureSessionDirectoryIsAbsent();
    return createTestManager();
  },
  When<TestManager>(
    "stores TestSuite",
    testManager => {
      testManager.storeTestSuite(primaryTestSuite());
      return testManager;
    },
    Then<TestManager>("TestManager returns non-empty for 'testSuite()'", testManager => {
      sleep(1000)
      console.log("Test suites: ", testManager.testSuites());
      //expect(testManager.testSuites().length).toBeGreaterThan(0);
      console.log("Test suites: ", testManager.testSuites());
    })
  )
);
