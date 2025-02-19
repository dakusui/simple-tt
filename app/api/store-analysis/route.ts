import { NextRequest, NextResponse } from "next/server";
import { ANALYSES_DIR } from "../../../models/constants";
import { handleError } from "../../../src/models/validations";
import fs from "fs";
import path from "path";
type TestEntry = {
  testCase: string;
  analyses: string;
};
function createTestEntry(testCase: string, analyses: string): TestEntry {
  return {
    testCase,
    analyses
  };
}

/**
 * Handles a request `req` storing its response in `res`.
 *
 *
 * @param req - The request.
 * @param res - The response.
 */
export async function POST(req: NextRequest) {
  try {
    const body  = await req.json();
    const { fileName, testCase, analysis } = body;

    const analysisFilePath = path.join(ANALYSES_DIR, fileName);
    const analysisData: { fileName: string; analyses: TestEntry[] } = readAnalysisDataFromFile(analysisFilePath);


    // Check if test case already has an analysis
    const existingEntry: TestEntry = analysisData.analyses
      .map(each => createTestEntry(each.testCase, each.analyses))
      .find(entry => entry.testCase === testCase) || { testCase: testCase, analyses: analysis };
    if (existingEntry) {
      existingEntry.analyses = analysis;
    }
    analysisData.analyses.push({ testCase, analyses: analysis });

    fs.writeFileSync(analysisFilePath, JSON.stringify(analysisData, null, 2), "utf-8");


    return NextResponse.json({ message: "Manual analysis saved successfully", fileName });
  } catch (error) {
    return handleError(error);
  }
}

function readAnalysisDataFromFile(fileName): { fileName: string; analyses: TestEntry[] } {
  if (!fs.existsSync(fileName)) {
    return {
      fileName,
      analyses: []
    };
  }
  return JSON.parse(fs.readFileSync(fileName, "utf-8"));
}
