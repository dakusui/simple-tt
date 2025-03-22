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
export type TestRunSetJSON = {
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

export interface TestEnvironmentJSON {
  machine: string;
  user: string;
  branch: string;
}

export type DurationJSON = {
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

export type TestCaseRunWithTriage = {
  testSuiteId: string;
  testCaseId: string;
  result?: string;
  startDate?: Date;
  elapsedTime?: number;
  triageNote?: {
    ticket: string;
    insight: string;
    by: string;
    at: Date;
  };
};

export type TriageNote = {
  ticket: string;
  insight: string;
  by: string;
  at: Date;
};

export function createTestCaseRunWithTriage(
  testSuiteId: string,
  testCaseId: string,
  lastResult?: string,
  lastStartDate?: Date,
  lastElapsedTime?: number ,
  lastTriageNote?: TriageNote
): TestCaseRunWithTriage {
  return new TestCaseStateRunWithTriageImpl(testSuiteId, testCaseId, lastResult, lastStartDate, lastElapsedTime, lastTriageNote);
}
class TestCaseStateRunWithTriageImpl {
  constructor(
    public testSuiteId: string,
    public testCaseId: string,
    public result?: string,
    public startDate?: Date,
    public elapsedTime?: number,
    public triageNote?: TriageNote 
  ) {}
}

export interface TestCaseRunJSON {
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
