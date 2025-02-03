export class TestCaseRun {
  constructor(
    public fileName: string,
    public testSuite: string,
    public testCase: string,
    public executionTime: Date,
    public testResult: string,
    public manualAnalysis: string
  ) {}

  static fromJSON(json: {
    fileName: string;
    testSuite: string;
    testCase: string;
    executionTime: Date;
    testResult: string;
    manualAnalysis: string;
  }): TestCaseRun {
    return new TestCaseRun(
      json.fileName,
      json.testSuite,
      json.testCase,
      json.executionTime,
      json.testResult,
      json.manualAnalysis
    );
  }
}
