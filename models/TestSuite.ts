import path from "path";
import { ensureDirectoryExists, saveFile } from "./utils";
import { stringify } from "querystring";
import { existsSync, readdir } from "fs";
import { readJsonSync } from "./utils";

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
    return new TestRunSet(TestEnvironment.fromJSON(json.environment), TestCaseRun.fromJSONArray(json.runs));
  }
}

export class TestEnvironment {
  constructor(
    public machine: string,
    public user: string,
    public branch: string
  ) {}

  static fromJSON(json: { machine: string; user: string; branch: string }) {
    return new TestEnvironment(json.machine, json.user, json.branch);
  }
}

export class TestCaseRun {
  constructor(
    public testSuiteId: string,
    public testCaseId: string,
    public result: string,
    public duration: Duration
  ) {}

  static fromJSON(run: {
    testSuiteId: string;
    testCaseId: string;
    result: string;
    duration: {
      start: string;
      end: string;
    };
  }) {
    return new TestCaseRun(run.testSuiteId, run.testCaseId, run.result, Duration.fromJSON(run.duration));
  }

  static fromJSONArray(runs: []): TestCaseRun[] {
    return runs.map(each => TestCaseRun.fromJSON(each));
  }
}

export class Duration {
  constructor(
    public start: Date,
    public end: Date
  ) {}

  static fromJSON(duration: { start: string; end: string }): Duration {
    return new Duration(new Date(duration.start), new Date(duration.end));
  }
}

export class Triage {
  constructor(
    public runId: string,
    public testCaseId: string,
    public testSuiteId: string,
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

  fetchTestCaseState(testSuiteId: string, testCaseId: string) {
    const lastResult = this.fetchLastRunFor(testSuiteId, testCaseId)?.result as string | null;
    const lastTriageNote = this.fetchLastTriageFor(testSuiteId, testCaseId)?.note as {
      ticket: string;
      insight: string;
      by: string;
      at: Date;
    } | null;
    return new TestCaseState(testSuiteId, testCaseId, lastResult, lastTriageNote);
  }

  fetchLastRunFor(testSuiteId: string, testCaseId: string): TestCaseRun | null {
    const lastRunId: string | null = this.lastRunIdFor(testSuiteId, testCaseId);
    if (lastRunId != null) return this.fetchTestCaseRun(lastRunId, testSuiteId, testCaseId);
    return null;
  }

  fetchLastTriageFor(testSuiteId: string, testCaseId: string): Triage | null {
    const lastTriagedRunId: string | null = this.lastTriagedRunIfFor(testSuiteId, testCaseId);
    if (lastTriagedRunId != null) return this.fetchTriage(lastTriagedRunId, testSuiteId, testCaseId);
    return null;
  }

  lastRunIdFor(testSuiteId: string, testCaseId: string): string | null {
    const runIds: string[] = this.runs()
      .filter(r => {
        return this.existsTestCaseRun(r, testSuiteId, testCaseId);
      })
      .sort()
      .reverse();
    return runIds.length > 0 ? runIds[0] : null;
  }

  lastTriagedRunIfFor(testSuiteId: string, testCaseId: string): string | null {
    const triagedRunIds: string[] = this.triagedRuns()
      .filter(r => {
        return this.existsTestCaseRun(r, testSuiteId, testCaseId);
      })
      .sort()
      .reverse();
    return triagedRunIds.length > 0 ? triagedRunIds[0] : null;
  }

  storeTestSuite(testSuite: TestSuite): void {
    const testSuitesDir = this.testSuiteDirFor(testSuite.id);
    ensureDirectoryExists(testSuitesDir);
    saveFile(path.join(this.baseDir, "testSuite.json"), stringify({ description: testSuite.description }));
    for (const each of testSuite.testCases) {
      saveFile(path.join(testSuitesDir, "testCase-" + each.id + ".json"), stringify({ description: each.description }));
    }
  }

  storeRunSet(testRunSet: TestRunSet): void {
    const runId: string = this.generateRunId();
    const env: TestEnvironment = testRunSet.environment;

    for (const eachTestCaseRun of testRunSet.runs) {
      const testSuiteDirForRun: string = path.join(this.runDirFor(runId), "testSuite-" + eachTestCaseRun.testSuiteId);
      ensureDirectoryExists(testSuiteDirForRun);
      this.ensureDefinitionExists(eachTestCaseRun);
      saveFile(
        path.join(testSuiteDirForRun, "testCase-" + eachTestCaseRun.testCaseId) + ".json",
        stringify({
          result: eachTestCaseRun.result,
          environment: JSON.stringify(env),
          duration: JSON.stringify(eachTestCaseRun.duration)
        })
      );
    }
  }

  ensureDefinitionExists(testCaseRun: TestCaseRun): void {
    const testSuiteDir: string = this.testSuiteDirFor(testCaseRun.testSuiteId);
    const testSuiteFile: string = path.join(testSuiteDir, "testSuite.json");
    const testCaseFile: string = path.join(testSuiteDir, "testCase-" + testCaseRun.testCaseId + ".json");
    ensureDirectoryExists(testSuiteDir);
    if (!existsSync(testSuiteFile)) saveFile(testSuiteFile, JSON.stringify({ description: "" }));
    if (!existsSync(testCaseFile)) saveFile(testCaseFile, JSON.stringify({ description: "" }));
  }

  storeTriage(
    runId: string,
    testSuiteId: string,
    testCaseId: string,
    note: { ticket: string; insight: string; by: string; at: Date }
  ) {
    const triagesDir = path.join(this.baseDir, "triages");
    const testSuiteDir = path.join(triagesDir, path.join("run-" + runId, "testSuite-" + testSuiteId));
    ensureDirectoryExists(testSuiteDir);
    saveFile(path.join(testSuiteDir, "testCase-" + testCaseId + ".json"), JSON.stringify(note));
  }

  existsTriage(runId: string, testSuiteId: string, testCaseId: string): boolean {
    return existsSync(this.triageFilePath(runId, testSuiteId, testCaseId));
  }

  fetchTriage(runId: string, testSuiteId: string, testCaseId: string): Triage {
    const triageFile: string = this.triageFilePath(runId, testSuiteId, testCaseId);
    return Triage.fromJSON(readJsonSync(triageFile));
  }

  triageFilePath(runId: string, testSuiteId: string, testCaseId: string): string {
    return path.join(this.triageDirFor(runId), path.join("testSuite-" + testSuiteId, "triage-" + testCaseId + ".json"));
  }

  testSuites(): string[] {
    const testSuitesDir: string = this.testSuitesDir();
    const ret: string[] = [];
    readdir(testSuitesDir, (err, files) => {
      for (const f of files) {
        if (!f.startsWith("testSuite-")) continue;
        ret.push(f.replace("testSuite-", "").replace("/", ""));
      }
    });
    return ret;
  }

  testCasesFor(testSuiteId: string): string[] {
    const testCasesDir: string = this.testSuiteDirFor(testSuiteId);
    const ret: string[] = [];
    readdir(testCasesDir, (err, files) => {
      for (const f of files) {
        if (!f.startsWith("testCase-")) continue;
        ret.push(f.replace("testCase-", "").replace(".json", ""));
      }
    });
    return ret;
  }

  triagedRuns() {
    const ret: string[] = [];
    readdir(this.triagesDir(), (err, files) => {
      for (const value of files) {
        if (!value.startsWith("run-")) continue;
        ret.push(value.replace("run-", "").replace("/", ""));
      }
    });
    return ret;
  }

  runs(): string[] {
    const ret: string[] = [];
    readdir(this.runsDir(), (err, files) => {
      for (const value of files) {
        if (!value.startsWith("run-")) continue;
        ret.push(value.replace("run-", "").replace("/", ""));
      }
    });
    return ret;
  }

  testSuitesForRun(runId: string): string[] {
    const ret: string[] = [];
    readdir(this.runDirFor(runId), (err, files) => {
      for (const value of files) {
        if (!value.startsWith("testSuite-")) continue;
        ret.push(value.replace("testSuite-", "").replace("/", ""));
      }
    });
    return ret;
  }

  testCasesForRun(runId: string, testSuiteId): string[] {
    const ret: string[] = [];
    readdir(path.join(this.runDirFor(runId), "testSuite-" + testSuiteId), (err, files) => {
      for (const value of files) {
        if (!value.startsWith("run-")) {
          continue;
        }
        ret.push(value.replace("run-", "").replace("/", ""));
      }
    });
    return ret;
  }

  existsTestCaseRun(runId: string, testSuiteId: string, testCaseId: string): boolean {
    return existsSync(this.pathForTestCaseRun(runId, testSuiteId, testCaseId));
  }

  fetchTestCaseRun(runId: string, testSuiteId: string, testCaseId: string): TestCaseRun {
    return TestCaseRun.fromJSON(readJsonSync(this.pathForTestCaseRun(runId, testSuiteId, testCaseId)));
  }

  pathForTestCaseRun(runId: string, testSuiteId: string, testCaseId: string): string {
    return path.join(this.runDirFor(runId), path.join("testSuite-" + testSuiteId, "run-" + testCaseId));
  }

  pathForTriage(runId: string, testSuiteId: string, testCaseId: string): string {
    return path.join(this.triageDirFor(runId)), path.join("testSuite-" + testSuiteId, "triage-" + testCaseId);
  }

  generateRunId() {
    return new Date(Date.now()).toISOString().replaceAll(":", "-");
  }

  runDirFor(runId: string) {
    return path.join(this.runsDir(), "runId-" + runId);
  }

  runsDir() {
    return path.join(this.baseDir, "runs");
  }

  testSuiteDirFor(testSuiteId: string) {
    return path.join(this.testSuitesDir(), "testSuite-" + testSuiteId);
  }

  testSuitesDir() {
    return path.join(this.baseDir, "testSuites");
  }

  triageDirFor(runId: string) {
    return path.join(this.triagesDir(), "run-" + runId);
  }

  triagesDir() {
    return path.join(this.baseDir, "triages");
  }
}
