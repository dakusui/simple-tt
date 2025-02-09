import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { TestCaseRun } from "../../models/TestCaseRun";
import { TESTRUNS_DIR, ANALYSES_DIR } from "../../models/constants";
import { handleError, requireMethodIsGET } from "../../models/validations";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    requireMethodIsGET(req);
    const testRunFiles = fs.readdirSync(TESTRUNS_DIR).filter(file => file.endsWith(".json"));
    const testCasesMap: Record<string, TestCaseRun> = {};

    testRunFiles.forEach(file => {
      const filePath = path.join(TESTRUNS_DIR, file);
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      data.testCases.forEach((testCase: { testCase: string; testResult: string; manualAnalysis: string }) => {
        if (
          !testCasesMap[testCase.testCase] ||
          new Date(data.executionTime.end) > new Date(testCasesMap[testCase.testCase].executionTime)
        ) {
          testCasesMap[testCase.testCase] = new TestCaseRun(
            filePath,
            data.testSuite,
            testCase.testCase,
            data.executionTime.end,
            testCase.testResult,
            testCase.manualAnalysis
          );
        }
      });
    });

    // (Optional) Merge manual analysis
    const diagnosisFiles = fs.readdirSync(ANALYSES_DIR).filter(file => file.endsWith(".json"));
    diagnosisFiles.forEach(file => {
      const filePath = path.join(ANALYSES_DIR, file);
      const analysisData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      analysisData.analyses.forEach((entry: { testCase: string; analysis: string }) => {
        if (testCasesMap[entry.testCase]) {
          testCasesMap[entry.testCase].manualAnalysis = entry.analysis;
        }
      });
    });

    res.status(200).json(Object.values(testCasesMap));
  } catch (error) {
    handleError(error, res);
  }
}
