import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const ANALYSES_DIR = path.join(DATA_DIR, "triage-diagnoses");

type TestEntry = {
  testCase: string;
  analysis: string;
};
function createTestEntry(testCase: string, analysis: string): TestEntry {
  return {
    testCase,
    analysis
  };
}

// Ensure the analysis directory exists
if (!fs.existsSync(ANALYSES_DIR)) {
  fs.mkdirSync(ANALYSES_DIR, { recursive: true });
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
    const { fileName, testCase, analysis } = req.body;

    if (!fileName || !testCase || !analysis) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const analysisFilePath = path.join(ANALYSES_DIR, fileName);
    let analysisData: { fileName: string; analyses: TestEntry[] } = {
      fileName,
      analyses: []
    };

    if (fs.existsSync(analysisFilePath)) {
      analysisData = JSON.parse(fs.readFileSync(analysisFilePath, "utf-8"));
    }

    // Check if test case already has an analysis
    const existingEntry: TestEntry = analysisData.analyses
      .map(each => createTestEntry(each.testCase, each.analysis))
      .find(entry => entry.testCase === testCase) || { testCase, analysis };
    if (existingEntry) {
      existingEntry.analysis = analysis; // Update existing analysis
    } else {
      analysisData.analyses.push({ testCase, analysis });
    }

    fs.writeFileSync(analysisFilePath, JSON.stringify(analysisData, null, 2), "utf-8");

    res.status(200).json({ message: "Manual analysis saved successfully", fileName });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error: <" + error + ">" });
  }
}
