import { existsSync, readdirSync, rmSync } from "fs";
import path from "path";
import superjson from "superjson";
import {
  createTestCaseRunWithTriage,
  TestCaseRun,
  TestCaseRunJSON,
  TestCaseRunWithTriage,
  TestEnvironment,
  TestRunSet,
  TestRunSetJSON,
  TestSuite,
  Triage,
  TriageNote
} from "./test-entities";
import { ensureDirectoryExists, readObjectFromJson, saveFile } from "./utils";

class SequenceGenerator {
  private atomicValue = new Int32Array(new SharedArrayBuffer(4));
  constructor(initial: number) {
    Atomics.store(this.atomicValue, 0, initial);
  }

  next(): number {
    return Atomics.add(this.atomicValue, 0, 1);
  }
}
const testManagerDataDir: string = path.join(process.cwd(), "data", "test-manager");
const testManagerRunDir: string = path.join(testManagerDataDir, "runs");
const sequenceGeneratorForRunId = new SequenceGenerator(readdirSync(testManagerRunDir).length);

export async function storeTestRun(jsonData: object): Promise<string> {
  const testManager: TestManager = new TestManager(testManagerDataDir);
  return testManager.storeRunSet(TestRunSet.fromJSON(jsonData as TestRunSetJSON));
}

export async function fetchRecentStatuses(): Promise<TestCaseRunWithTriage[]> {
  // Mock data for testing, replace with actual data fetching logic
  const testManager: TestManager = new TestManager(testManagerDataDir);
  return testManager.retrieveLatestTestCaseStates();
}

export async function fetchTestCaseRunHistory(
  testSuiteId: string,
  testCaseId: string
): Promise<[string, TestCaseRunWithTriage][]> {
  // Mock data for testing, replace with actual data fetching logic
  const testManager: TestManager = new TestManager(testManagerDataDir);
  return testManager.retrieveRunHistoryFor(testSuiteId, testCaseId);
}

export async function storeTriage(
  runId: string,
  testSuiteId: string,
  testCaseId: string,
  jsonData: object
): Promise<TriageNote> {
  const testManager: TestManager = new TestManager(testManagerDataDir);
  const note: TriageNote = {
    ticket: jsonData["ticket"],
    insight: jsonData["insight"],
    by: jsonData["by"],
    at: new Date(Date.now())
  } as TriageNote;
  testManager.storeTriage(runId, testSuiteId, testCaseId, note);
  return note;
}

export async function removeTriage(runId: string, testSuiteId: string, testCaseId: string): Promise<void> {
  const testManager: TestManager = new TestManager(testManagerDataDir);
  if (testManager.existsTriage(runId, testSuiteId, testCaseId)) {
    testManager.removeTriage(runId, testSuiteId, testCaseId);
  }
}

export async function fetchTriage(runId: string, testSuiteId: string, testCaseId: string): Promise<TriageNote | null> {
  const testManager: TestManager = new TestManager(testManagerDataDir);
  if (testManager.existsTriage(runId, testSuiteId, testCaseId))
    return testManager.retrieveTriage(runId, testSuiteId, testCaseId).note;
  return null;
}

/**
 * baseDir/
 *   testSuites/                            testSuitesDie()
 *     testSuite-{testSuiteId}/
 *        testSuite.json
 *        testCase-{testCaseId}.json
 *   runs/                                  runsDir()
 *     run-{runId}/
 *       testSuite-{testSuiteId}/
 *         run-{testCaseId}.json
 *   triages/                               triagesDir()
 *     run-{runId}/
 *       testSuite-{testSuiteId}/
 *         triage-{testCaseId}.json
 *
 */
export class TestManager {
  constructor(public baseDir: string) {}

  retrieveLatestTestCaseStates(): TestCaseRunWithTriage[] {
    return this.testSuites()
      .flatMap(testSuiteId => {
        return this.testCasesFor(testSuiteId).map(testCaseId => [testSuiteId, testCaseId]);
      })
      .map(v => {
        return this.retrieveLastTestCaseRunWithLastTriage(v[0], v[1]);
      });
  }

  retrieveRunHistoryFor(testSuiteId: string, testCaseId: string): [string, TestCaseRunWithTriage][] {
    return this.runs()
      .filter(runId => this.existsTestCaseRun(runId, testSuiteId, testCaseId))
      .map(runId => {
        const testCaseRun: TestCaseRun = this.retrieveTestCaseRun(runId, testSuiteId, testCaseId);
        return [
          runId,
          createTestCaseRunWithTriage(
            testCaseRun.testSuiteId,
            testCaseRun.testCaseId,
            testCaseRun.result,
            testCaseRun.duration.start,
            testCaseRun.duration.elapsedTime(),
            this.retrieveTriageFor(runId, testSuiteId, testCaseId)?.note
          )
        ];
      });
  }

  retrieveLastTestCaseRunWithLastTriage(testSuiteId: string, testCaseId: string): TestCaseRunWithTriage {
    const lastRun: TestCaseRun | undefined = this.retrieveLastRunFor(testSuiteId, testCaseId) ?? undefined;
    const lastResult: string | undefined = (lastRun?.result as string) ?? undefined;
    const lastStartDate: Date | undefined = (lastRun?.duration.start as Date) ?? undefined;
    const lastElapsedTime: number | undefined = lastRun?.duration.elapsedTime();
    const lastTriageNote: TriageNote | undefined = this.existsTriage(
      this.lastRunIdFor(testSuiteId, testCaseId) as string,
      testSuiteId,
      testCaseId
    )
      ? this.retrieveLastTriageFor(testSuiteId, testCaseId)?.note
      : undefined;
    return createTestCaseRunWithTriage(
      testSuiteId,
      testCaseId,
      lastResult,
      lastStartDate,
      lastElapsedTime,
      lastTriageNote
    );
  }

  retrieveLastRunFor(testSuiteId: string, testCaseId: string): TestCaseRun | null {
    const lastRunId: string | null = this.lastRunIdFor(testSuiteId, testCaseId);
    if (lastRunId != null) return this.retrieveTestCaseRun(lastRunId, testSuiteId, testCaseId);
    return null;
  }

  retrieveLastTriageFor(testSuiteId: string, testCaseId: string): Triage | null {
    const lastTriagedRunId: string | null = this.lastTriagedRunIdFor(testSuiteId, testCaseId);
    if (lastTriagedRunId != null) return this.retrieveTriage(lastTriagedRunId, testSuiteId, testCaseId);
    return null;
  }

  retrieveTriageFor(runId: string, testSuiteId: string, testCaseId: string): Triage | null {
    if (this.existsTriage(runId, testSuiteId, testCaseId)) return this.retrieveTriage(runId, testSuiteId, testCaseId);
    return null;
  }

  storeTestSuite(testSuite: TestSuite): string[] {
    const testSuitesDir = this.testSuiteDirFor(testSuite.id);
    ensureDirectoryExists(testSuitesDir);
    saveFile(path.join(testSuitesDir, "testSuite.json"), superjson.stringify({ description: testSuite.description }));
    const ret: string[] = [];
    for (const each of testSuite.testCases) {
      const fileName: string = path.join(testSuitesDir, "testCase-" + each.id + ".json");
      ret.push(fileName);
      saveFile(fileName, superjson.stringify({ description: each.description }));
    }
    return ret;
  }

  storeRunSet(testRunSet: TestRunSet): string {
    const runId: string = this.generateRunId();
    const env: TestEnvironment = testRunSet.environment;

    for (const eachTestCaseRun of testRunSet.runs) {
      this.ensureDefinitionExists(eachTestCaseRun);
      const pathForTestCaseRun = this.pathForTestCaseRun(
        runId,
        eachTestCaseRun.testSuiteId,
        eachTestCaseRun.testCaseId
      );
      ensureDirectoryExists(path.dirname(pathForTestCaseRun));
      saveFile(
        pathForTestCaseRun,
        superjson.stringify({
          result: eachTestCaseRun.result,
          environment: env,
          duration: eachTestCaseRun.duration
        })
      );
    }
    return runId;
  }

  existsTriage(runId: string, testSuiteId: string, testCaseId: string): boolean {
    return existsSync(this.triageFilePath(runId, testSuiteId, testCaseId));
  }

  storeTriage(
    runId: string,
    testSuiteId: string,
    testCaseId: string,
    note: { ticket: string; insight: string; by: string; at: Date }
  ): void {
    const triageFilePath = this.triageFilePath(runId, testSuiteId, testCaseId);
    ensureDirectoryExists(path.dirname(triageFilePath));
    saveFile(triageFilePath, superjson.stringify(note));
  }

  retrieveTriage(runId: string, testSuiteId: string, testCaseId: string): Triage {
    const triageFile: string = this.triageFilePath(runId, testSuiteId, testCaseId);
    return new Triage(runId, testSuiteId, testCaseId, readObjectFromJson(triageFile));
  }

  removeTriage(runId: string, testSuiteId: string, testCaseId: string) {
    const triageFile: string = this.triageFilePath(runId, testSuiteId, testCaseId);
    if (existsSync(triageFile)) {
       rmSync(triageFile);
    }
  }

  testSuites(): string[] {
    return this.listIdentifiers(this.testSuitesDir(), "testSuite-", /^testSuite-/);
  }

  testCasesFor(testSuiteId: string): string[] {
    return this.listIdentifiers(this.testSuiteDirFor(testSuiteId), "testCase-", /^testCase-/, /.json$/);
  }

  triagedRuns(): string[] {
    return this.listIdentifiers(this.triagesDir(), "run-", "run-");
  }

  runs(): string[] {
    return this.listIdentifiers(this.runsDir(), "run-", /^run-/);
  }

  testSuitesForRun(runId: string): string[] {
    return this.listIdentifiers(this.runDirFor(runId), "testSuite-", "testSuite-");
  }

  testCasesForRun(runId: string, testSuiteId): string[] {
    return this.listIdentifiers(path.join(this.runDirFor(runId), "testSuite-" + testSuiteId), "run-");
  }

  existsTestCaseRun(runId: string, testSuiteId: string, testCaseId: string): boolean {
    return existsSync(this.pathForTestCaseRun(runId, testSuiteId, testCaseId));
  }

  retrieveTestCaseRun(runId: string, testSuiteId: string, testCaseId: string): TestCaseRun {
    const json: TestCaseRunJSON = readObjectFromJson(
      this.pathForTestCaseRun(runId, testSuiteId, testCaseId)
    ) as TestCaseRunJSON;
    return TestCaseRun.fromJSON({
      testSuiteId: testSuiteId,
      testCaseId: testCaseId,
      result: json.result,
      environment: TestEnvironment.fromJSON(json.environment),
      duration: json.duration
    });
  }

  private lastRunIdFor(testSuiteId: string, testCaseId: string): string | null {
    const runIds: string[] = this.runs()
      .filter(r => {
        return this.existsTestCaseRun(r, testSuiteId, testCaseId);
      })
      .sort()
      .reverse();
    return runIds.length > 0 ? runIds[0] : null;
  }

  private lastTriagedRunIdFor(testSuiteId: string, testCaseId: string): string | null {
    const triagedRunIds: string[] = this.triagedRuns()
      .filter(r => {
        return this.existsTestCaseRun(r, testSuiteId, testCaseId);
      })
      .sort()
      .reverse();
    return triagedRunIds.length > 0 ? triagedRunIds[0] : null;
  }

  private listIdentifiers(base: string, prefix: string, ...extras: (RegExp | string)[]): string[] {
    if (existsSync(base))
      return readdirSync(base)
        .filter(f => f.startsWith(prefix))
        .map(f => {
          let ret: string = f;
          for (const r of extras) {
            ret = ret.replace(r, "");
          }
          return ret;
        });
    return [];
  }

  private ensureDefinitionExists(testCaseRun: TestCaseRun): void {
    const testSuiteDir: string = this.testSuiteDirFor(testCaseRun.testSuiteId);
    const testSuiteFile: string = path.join(testSuiteDir, "testSuite.json");
    const testCaseFile: string = path.join(testSuiteDir, "testCase-" + testCaseRun.testCaseId + ".json");
    ensureDirectoryExists(testSuiteDir);
    if (!existsSync(testSuiteFile)) saveFile(testSuiteFile, superjson.stringify({ description: "" }));
    if (!existsSync(testCaseFile)) saveFile(testCaseFile, superjson.stringify({ description: "" }));
  }

  private triageFilePath(runId: string, testSuiteId: string, testCaseId: string): string {
    return path.join(this.triageDirFor(runId), path.join("testSuite-" + testSuiteId, "triage-" + testCaseId + ".json"));
  }

  private pathForTestCaseRun(runId: string, testSuiteId: string, testCaseId: string): string {
    return path.join(this.runDirFor(runId), path.join("testSuite-" + testSuiteId, "testCase-" + testCaseId + ".json"));
  }

  private generateRunId(): string {
    const ret = sequenceGeneratorForRunId.next().toString().padStart(6, "0");
    console.log("Generating run id:<" + ret + ">");
    return ret;
  }

  private runDirFor(runId: string) {
    return path.join(this.runsDir(), "run-" + runId);
  }

  private runsDir() {
    return path.join(this.baseDir, "runs");
  }

  private testSuiteDirFor(testSuiteId: string) {
    return path.join(this.testSuitesDir(), "testSuite-" + testSuiteId);
  }

  private testSuitesDir() {
    return path.join(this.baseDir, "testSuites");
  }

  private triageDirFor(runId: string) {
    return path.join(this.triagesDir(), "run-" + runId);
  }

  private triagesDir() {
    return path.join(this.baseDir, "triages");
  }
}
