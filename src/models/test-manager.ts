import path from "path";
import fs from 'fs';
import { ensureDirectoryExists, readObjectFromJson, saveFile } from "./utils";
import { existsSync, readdirSync } from "fs";
import superjson from "superjson";

// src/models/test-manager.ts
// src/models/test-manager.ts

const testRunDir = path.join(process.cwd(), 'data', 'test-runs');

export async function storeTestRun(jsonData: any): Promise<string> {
    if (!fs.existsSync(testRunDir)) {
        fs.mkdirSync(testRunDir, { recursive: true });
    }

    // Generate a filename based on timestamp or other unique identifier
    const fileName = `test-run-${Date.now()}.json`;
    const filePath = path.join(testRunDir, fileName);

    // Write the JSON data to a file
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf-8');

    console.log(`Test run stored as: ${filePath}`);
    return fileName;
}

export async function getRecentStatuses() {
  // Mock data for testing, replace with actual data fetching logic
  return [
      {
          testSuite: 'Suite A',
          testCase: 'Test Case 1',
          testResult: 'PASS',
          executionTime: new Date().toISOString(),
          manualAnalysis: 'Looks good'
      },
      {
          testSuite: 'Suite B',
          testCase: 'Test Case 2',
          testResult: 'FAIL',
          executionTime: new Date().toISOString(),
          manualAnalysis: ''
      }
  ];
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

  fetchTestCaseStates() {
    return this.testSuites()
      .flatMap(testSuiteId => {
        return this.testCasesFor(testSuiteId).map(testCaseId => [testSuiteId, testCaseId]);
      })
      .map(v => {
        return this.fetchTestCaseState(v[0], v[1]);
      });
  }

  fetchTestCaseState(testSuiteId: string, testCaseId: string): TestCaseState {
    const lastResult = this.fetchLastRunFor(testSuiteId, testCaseId)?.result as string | null;
    if (this.existsTriage(this.lastRunIdFor(testSuiteId, testCaseId) as string, testSuiteId, testCaseId)) {
      const lastTriageNote = this.fetchLastTriageFor(testSuiteId, testCaseId)?.note as {
        ticket: string;
        insight: string;
        by: string;
        at: Date;
      };
      return new TestCaseState(testSuiteId, testCaseId, lastResult, lastTriageNote);
    }
    return new TestCaseState(testSuiteId, testCaseId, lastResult, null);
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

  storeTestSuite(testSuite: TestSuite): void {
    const testSuitesDir = this.testSuiteDirFor(testSuite.id);
    ensureDirectoryExists(testSuitesDir);
    saveFile(path.join(testSuitesDir, "testSuite.json"), superjson.stringify({ description: testSuite.description }));
    for (const each of testSuite.testCases) {
      saveFile(
        path.join(testSuitesDir, "testCase-" + each.id + ".json"),
        superjson.stringify({ description: each.description })
      );
    }
  }

  storeRunSet(testRunSet: TestRunSet): void {
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
      duration: Duration.fromJSON(json.duration)
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
    return new Date(Date.now()).toISOString().replaceAll(":", "-");
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

export class TestRunSet {
  constructor(
    public environment: TestEnvironment,
    public runs: TestCaseRun[]
  ) {
    this.environment = environment;
    this.runs = runs;
  }

  static fromJSON(json: { environment: { machine: string; user: string; branch: string }; runs: [] }): TestRunSet {
    const environment = TestEnvironment.fromJSON(json.environment);
    return new TestRunSet(environment, TestCaseRun.fromJSONArray(environment, json.runs));
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
    start: Date;
    end: Date;
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
interface DurationJSON {
  start: Date;
  end: Date;
}
export class Duration {
  constructor(
    public start: Date,
    public end: Date
  ) {}

  static fromJSON(duration: DurationJSON): Duration {
    return new Duration(duration.start, duration.end);
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
    public note: { ticket: string; insight: string; by: string; at: Date }
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

export class TestCaseState {
  constructor(
    public testSuiteId: string,
    public testCaseId: string,
    public lastResult: string | null,
    public lastTriageNote: {
      ticket: string;
      insight: string;
      by: string;
      at: Date;
    } | null
  ) {}
}
