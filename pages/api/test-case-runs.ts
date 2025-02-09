import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { stringify } from "querystring";
import { TestCaseRun } from "../../models/TestCaseRun";
import { TESTRUNS_DIR, ANALYSES_DIR } from "../../models/constants";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { testCase } = req.query;
    if (!testCase || typeof testCase !== "string") {
      return res.status(400).json({ error: "Missing or invalid test case name" });
    }

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

    res.status(200).json({ testCase, runs });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error: " + stringify(error) });
  }
}
