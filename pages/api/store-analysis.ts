import { NextApiRequest, NextApiResponse } from "next";
import { ANALYSES_DIR } from "../../models/constants";
import { requireArgument, IllegalArgumentException } from "../../models/validations";
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
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { fileName, testCase, analysis } = requireArgument(req.body, b => b.fileName && b.testCase && b.analysis);

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

    res.status(200).json({ message: "Manual analysis saved successfully", fileName });
  } catch (error) {
    if (error instanceof IllegalArgumentException) {
      res.status(400).json({ error: error.message });
    } else res.status(500).json({ error: "Internal Server Error: <" + error + ">" });
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

