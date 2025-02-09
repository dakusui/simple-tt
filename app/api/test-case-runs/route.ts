import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { TestCaseRun } from "../../../models/TestCaseRun";
import { TESTRUNS_DIR, ANALYSES_DIR } from "../../../models/constants";
import { handleError } from "../../../models/validations";

export async function GET(req: NextRequest, { params }: { params: { testCase: string } }) {
  try {
    const { testCase } = params;
    const testRunFiles = fs.readdirSync(TESTRUNS_DIR).filter(file => file.endsWith(".json"));
    const runs: TestCaseRun[] = [];

    testRunFiles.forEach(file => {
      const filePath = path.join(TESTRUNS_DIR, file);
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      data.testCases.forEach((test: { testCase: string; testResult: string }) => {
        if (test.testCase === testCase) {
          let manualAnalysis = "";
          const analysisFilePath = path.join(ANALYSES_DIR, file);

          // Check if manual analysis file exists
          if (fs.existsSync(analysisFilePath)) {
            const analysisData = JSON.parse(fs.readFileSync(analysisFilePath, "utf-8"));
            const analysisEntry = analysisData.analyses.find(
              (entry: { testCase: string }) => entry.testCase === testCase
            );
            if (analysisEntry) {
              manualAnalysis = analysisEntry.analysis;
            }
          }

          runs.push(
            new TestCaseRun(
              file,
              data.testSuite,
              test.testCase,
              data.executionTime.end,
              test.testResult,
              manualAnalysis
            )
          );
        }
      });
    });

    return NextResponse.json({ testCase, runs });
  } catch (error) {
    return handleError(error);
  }
}
