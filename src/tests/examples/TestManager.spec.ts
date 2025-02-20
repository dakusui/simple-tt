import { expect } from "vitest";

import { TestManager } from "../../models/test-manager";
import { createTestManager, ensureSessionDirectoryIsAbsent, primaryRunSet, primaryTestSuite } from "../utils/testutils";
import { Ensure, Given, Then, When } from "../utils/gwt";
import { existsSync, mkdirSync } from "fs";

function isEmptyWorkingDirectory(path: string): boolean {
  console.log(path);
  return false;
}
function isDiskFormatted(): boolean {
  return true;
}
function isOsProvisioned(): boolean {
  return true;
}
function isWorkingDirectoryAbsent(path: string): boolean {
  return !existsSync(path);
}
function removeWorkingDirectoryRecursively(path: string): void {
  console.log(path);
  return;
}
function createWorkingDirectory(path: string): void {
  console.log(path);
  return;
}
function formatDiskDrive(): void {
  console.log("formatDiskDrive");
  return;
}
function reprovisionOs(): void {
  console.log("formatDiskDrive");
  return;
}
function ensureWorkingDirecotryEmpty(path: string): void {
  Ensure()("Working directory is empty", 
    () => isEmptyWorkingDirectory(path), 
    () => mkdirSync(path),
    () => ensureWorkingDirectoryAbsent(path));
  return;
}
function ensureWorkingDirectoryAbsent(path: string): void {
  Ensure()("Working directory is absent", 
    () => isWorkingDirectoryAbsent(path), 
    () => removeWorkingDirectoryRecursively(path),
    () => ensureDiskIsFormatted());
  return;
}
function ensureDiskIsFormatted(): void {
  Ensure()("Disk is formatted",
    () => isDiskFormatted(),
    () => formatDiskDrive(),
    () => {
      formatDiskDrive();
      ensureOsIsProvisiond()
    });
}
function ensureOsIsProvisiond(): void {
  console.log("osProvisioned");
  Ensure()("OS is provisioned",
    () => isOsProvisioned(),
    () => reprovisionOs())
  return;
}

const WORKING_DIRECTORY = "target/test-working-directory";
{
  Given()(
    "new TestManager",
    () => {
      Ensure()("Empty working directory exists", 
        () => isEmptyWorkingDirectory(WORKING_DIRECTORY), 
        () => {
          removeWorkingDirectoryRecursively(WORKING_DIRECTORY)
          createWorkingDirectory(WORKING_DIRECTORY);
        },
        () => {
          formatDiskDrive()
          removeWorkingDirectoryRecursively(WORKING_DIRECTORY)
          createWorkingDirectory(WORKING_DIRECTORY);
        },
        () => {
          reprovisionOs()
          formatDiskDrive()
          removeWorkingDirectoryRecursively(WORKING_DIRECTORY)
          createWorkingDirectory(WORKING_DIRECTORY);
        },
      );
      ensureSessionDirectoryIsAbsent();
      return createTestManager();
    },
    When<TestManager>(
      "stores TestSuite",
      testManager => {
        testManager.storeTestSuite(primaryTestSuite());
        return testManager;
      },
      Then<TestManager>(
        "TestManager returns non-empty for 'testSuite()'", 
        testManager => {
          expect(testManager.testSuites().length).toBeGreaterThan(0);
        }))
  );
}
{
  Given()(
    "new TestManager",
    () => {
      ensureWorkingDirecotryEmpty(WORKING_DIRECTORY)     
      return createTestManager();
    },
    When<TestManager>(
      "stores TestSuite",
      testManager => {
        testManager.storeTestSuite(primaryTestSuite());
        return testManager;
      },
      Then<TestManager>(
        "TestManager returns non-empty for 'testSuite()'", 
        testManager => {
          expect(testManager.testSuites().length).toBeGreaterThan(0);
        }))
  );
}
{
  Given<void, TestManager>()(
    "TestManager, which stored a testSuite, ",
    () => {
      ensureSessionDirectoryIsAbsent();
      const testManager: TestManager = createTestManager();
      testManager.storeTestSuite(primaryTestSuite());
      return testManager;
    },
    When(
      "'testSuites()' is called",
      testManager => {
        return testManager.testSuites();
      },
      Then("Only one element is found", testSuites => {
        expect(testSuites).toEqual(["com.github.dakusui.sample_tt.example.FirstTest"]);
      })
    ),
    When(
      "'testCasesFor(...)' returns a list of strings'",
      testManager => {
        return testManager.testCasesFor("com.github.dakusui.sample_tt.example.FirstTest");
      },
      Then("", returnedList => {
        expect(returnedList).toEqual(["whenPerformDailyOperation_thenFinishesSuccessfully"]);
      })
  ));
  Given<void, TestManager>()(
    "TestManager, which stored a testSuite, ",
    () => {
      ensureSessionDirectoryIsAbsent();
      const testManager: TestManager = createTestManager();
      testManager.storeTestSuite(primaryTestSuite());
      return testManager;
    },
    When(
      "'storeRunset(...)' is called",
      testManager => {
        testManager.storeRunSet(primaryRunSet());
        return testManager.testSuites();
      },
      Then("Test Suite defined in fixture is found.", testSuites => {
        expect(testSuites).toEqual(["com.github.dakusui.sample_tt.example.FirstTest"]);
      })
    ),
    When(
      "'testCasesFor(...)' returns a list of strings'",
      testManager => {
        return testManager.testCasesFor("com.github.dakusui.sample_tt.example.FirstTest");
      },
      Then("Two test cases from test suite and test run are found", returnedList => {
        expect(returnedList).toEqual([
          "whenPerformDailyOperation_thenFinishesSuccessfully",
          "whenPerformMonthlyOperation_thenFinishesSuccessfully"
        ]);
      })
    )
  );
}
