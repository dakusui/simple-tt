import path from "path";
import { ensureDirectoryExists, readObjectFromJson, saveFile } from "./utils";
import { existsSync, readdirSync } from "fs";
import superjson from "superjson";

// src/models/test-manager.ts

const testManagerDataDir: string = path.join(process.cwd(), "data", "test-manager");

export async function storeTestRun(jsonData: object): Promise<string> {
  const testManager: TestManager = new TestManager(testManagerDataDir);
  return testManager.storeRunSet(TestRunSet.fromJSON(jsonData as TestRunSetJSON));
}

export async function getRecentStatuses(): Promise<TestCaseState[]> {
  // Mock data for testing, replace with actual data fetching logic
  const testManager: TestManager = new TestManager(testManagerDataDir);
  return testManager.fetchTestCaseStates();
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

  fetchTestCaseStates(): TestCaseState[] {
    return this.testSuites()
      .flatMap(testSuiteId => {
        return this.testCasesFor(testSuiteId).map(testCaseId => [testSuiteId, testCaseId]);
      })
      .map(v => {
        return this.fetchTestCaseState(v[0], v[1]);
      });
  }

  fetchTestCaseState(testSuiteId: string, testCaseId: string): TestCaseStateImpl {
    const lastRun: TestCaseRun | null = this.fetchLastRunFor(testSuiteId, testCaseId);
    const lastResult: string | null = lastRun?.result as string | null;
    const lastStartDate: Date | null = lastRun?.duration.start as Date | null;
    const lastElapsedTime: number | undefined = lastRun?.duration.elapsedTime();
    const lastTriageNote: TriageNote | undefined = this.existsTriage(
      this.lastRunIdFor(testSuiteId, testCaseId) as string,
      testSuiteId,
      testCaseId
    )
      ? this.fetchLastTriageFor(testSuiteId, testCaseId)?.note
      : undefined;
    return new TestCaseStateImpl(
      testSuiteId,
      testCaseId,
      lastResult,
      lastStartDate,
      lastElapsedTime ? lastElapsedTime : null,
      lastTriageNote ? lastTriageNote : null
    );
  }

  fetchLastRunFor(testSuiteId: string, testCaseId: string): TestCaseRun | null {
    const lastRunId: string | null = this.lastRunIdFor(testSuiteId, testCaseId);
    if (lastRunId != null) return this.fetchTestCaseRun(lastRunId, testSuiteId, testCaseId);
    return null;
  }

  fetchLastTriageFor(testSuiteId: string, testCaseId: string): Triage | null {
    const lastTriagedRunId: string | null = this.lastTriagedRunIdFor(testSuiteId, testCaseId);
    if (lastTriagedRunId != null) return this.fetchTriage(lastTriagedRunId, testSuiteId, testCaseId);
    return null;
  }

  storeTestSuite(testSuite: TestSuite): string[] {
    const testSuitesDir = this.testSuiteDirFor(testSuite.id);
    ensureDirectoryExists(testSuitesDir);
    saveFile(path.join(testSuitesDir, "testSuite.json"), superjson.stringify({ description: testSuite.description }));
    const ret: string[] = [];
    for (const each of testSuite.testCases) {
      const fileName: string = path.join(testSuitesDir, "testCase-" + each.id + ".json")
      ret.push(fileName);
      saveFile(
        fileName,
        superjson.stringify({ description: each.description })
      );
    }
    return ret;
  }

  storeRunSet(testRunSet: TestRunSet): string {
    console.log("Storing run set:" + testRunSet);
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
  ) {
    const triageFilePath = this.triageFilePath(runId, testSuiteId, testCaseId);
    ensureDirectoryExists(path.dirname(triageFilePath));
    saveFile(triageFilePath, superjson.stringify(note));
  }

  fetchTriage(runId: string, testSuiteId: string, testCaseId: string): Triage {
    const triageFile: string = this.triageFilePath(runId, testSuiteId, testCaseId);
    return new Triage(runId, testSuiteId, testCaseId, readObjectFromJson(triageFile));
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

  fetchTestCaseRun(runId: string, testSuiteId: string, testCaseId: string): TestCaseRun {
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

  private generateRunId() {
    console.log("Generating run id:" + new Date(Date.now()).toISOString());
    try {
      return new Date(Date.now()).toISOString().replaceAll(":", "-");
    } finally {
      console.log("Generated run id:" + new Date(Date.now()).toISOString());
    }
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

export class TestSuite {
  constructor(
    public id: string,
    public description: string,
    public testCases: TestCase[]
  ) {
    this.id = id;
    this.description = description;
  }
  static fromJSON(json: { id: string; description: string; testCases: [] }): TestSuite {
    return new TestSuite(json.id, json.description, TestCase.fromJSONArray(json.testCases));
  }
}

export class TestCase {
  constructor(
    public id: string,
    public description: string
  ) {
    this.id = id;
    this.description = description;
  }

  static fromJSON(json: { id: string; description: string }) {
    return new TestCase(json.id, json.description);
  }
  static fromJSONArray(arr: []): TestCase[] {
    return arr.map(each => TestCase.fromJSON(each));
  }
}

type TestCaseRunUploadJSON = {
  testSuiteId: string;
  testCaseId: string;
  result: string;
  duration: DurationJSON;
};
type TestRunSetJSON = {
  environment: TestEnvironmentJSON;
  runs: TestCaseRunUploadJSON[];
};
export class TestRunSet {
  constructor(
    public environment: TestEnvironment,
    public runs: TestCaseRun[]
  ) {
    this.environment = environment;
    this.runs = runs;
  }

  /**
   * This method is used to upload a JSON to the system.
   * The `json` should look like this file: `src/tests/resources/v2/run-1.json`
   * ```json
   *
   * {
   *   "environment": {
   *     "machine": "theophilos",
   *     "user": "hiroshi",
   *     "branch": "test-branch"
   *   },
   *   "runs": [
   *     {
   *       "testSuiteId": "com.github.dakusui.sample_tt.example.FirstTest",
   *       "testCaseId": "whenPerformDailyOperation_thenFinishesSuccessfully",
   *       "result": "FAIL",
   *       "duration": {
   *         "start": "2025-01-31T12:30:10.000Z",
   *         "end": "2025-01-31T12:30:59.123Z"
   *       }
   *     },
   *     {
   *       "testSuiteId": "com.github.dakusui.sample_tt.example.FirstTest",
   *       "testCaseId": "whenPerformMonthlyOperation_thenFinishesSuccessfully",
   *       "result": "FAIL",
   *       "duration": {
   *         "start": "2025-01-31T12:31:10.999",
   *         "end": "2025-01-31T12:32:11.000"
   *       }
   *     }
   *   ]
   * }
   * ```
   *
   * @param json The JSON object to be converted to TestRunSet
   * @returns a new `TestRunset` object loaded from `json`.
   */
  static fromJSON(json: TestRunSetJSON): TestRunSet {
    const environment = TestEnvironment.fromJSON(json.environment);
    return new TestRunSet(
      environment,
      TestCaseRun.fromJSONArray(
        environment,
        json.runs.map(each => {
          return {
            testSuiteId: each.testSuiteId,
            testCaseId: each.testCaseId,
            result: each.result,
            duration: each.duration
          };
        })
      )
    );
  }
}

interface TestEnvironmentJSON {
  machine: string;
  user: string;
  branch: string;
}
export class TestEnvironment {
  constructor(
    public machine: string,
    public user: string,
    public branch: string
  ) {}

  static fromJSON(json: TestEnvironmentJSON) {
    return new TestEnvironment(json.machine, json.user, json.branch);
  }

  toJSON() {
    return {
      machine: this.machine,
      user: this.user,
      branch: this.branch
    };
  }
}

interface TestCaseRunJSON {
  result: string;
  environment: {
    machine: string;
    user: string;
    branch: string;
  };
  duration: {
    start: string;
    end: string;
  };
}
export class TestCaseRun {
  constructor(
    public testSuiteId: string,
    public testCaseId: string,
    public result: string,
    public environment: TestEnvironment,
    public duration: Duration
  ) {}

  static fromJSON(run: {
    testSuiteId: string;
    testCaseId: string;
    result: string;
    environment: TestEnvironmentJSON;
    duration: DurationJSON;
  }) {
    return new TestCaseRun(
      run.testSuiteId,
      run.testCaseId,
      run.result,
      TestEnvironment.fromJSON(run.environment),
      Duration.fromJSON(run.duration)
    );
  }

  static fromJSONArray(
    environment: TestEnvironment,
    runs: { testSuiteId: string; testCaseId: string; result: string; duration: DurationJSON }[]
  ): TestCaseRun[] {
    return runs.map(
      each =>
        new TestCaseRun(each.testSuiteId, each.testCaseId, each.result, environment, Duration.fromJSON(each.duration))
    );
  }
}
type DurationJSON = {
  start: string;
  end: string;
};
export class Duration {
  constructor(
    public start: Date,
    public end: Date
  ) {}

  static fromJSON(duration: DurationJSON): Duration {
    return new Duration(new Date(Date.parse(duration.start)), new Date(Date.parse(duration.end)));
  }

  elapsedTime(): number {
    console.log("Calculating elapsed time: " + this.start + " - " + this.end);
    return this.end.getTime() - this.start.getTime();
  }
  toJSON() {
    return { start: this.start, end: this.end };
  }
}

export class Triage {
  constructor(
    public runId: string,
    public testSuiteId: string,
    public testCaseId: string,
    public note: TriageNote
  ) {}

  static fromJSON(value: {
    runId: string;
    testCaseId: string;
    testSuiteId: string;
    note: {
      ticket: string;
      insight: string;
      by: string;
      at: string;
    };
  }) {
    return new Triage(value.runId, value.testCaseId, value.testSuiteId, {
      ticket: value.note.ticket,
      insight: value.note.insight,
      by: value.note.by,
      at: new Date(value.note.at)
    });
  }

  toJSON() {
    return {
      runId: this.runId,
      testCaseId: this.testCaseId,
      testSuiteId: this.testSuiteId,
      note: this.note
    };
  }
}
export type TestCaseState = {
  testSuiteId: string;
  testCaseId: string;
  lastResult: string | null;
  lastStartDate: Date | null;
  lastElapsedTime: number | null;
  lastTriageNote: {
    ticket: string;
    insight: string;
    by: string;
    at: Date;
  } | null;
};

type TriageNote = {
  ticket: string;
  insight: string;
  by: string;
  at: Date;
};

class TestCaseStateImpl {
  constructor(
    public testSuiteId: string,
    public testCaseId: string,
    public lastResult: string | null,
    public lastStartDate: Date | null,
    public lastElapsedTime: number | null,
    public lastTriageNote: TriageNote | null
  ) {}
}
