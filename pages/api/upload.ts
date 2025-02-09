import { NextApiRequest, NextApiResponse } from "next";
import { TESTRUNS_DIR } from "../../models/constants";
import fs from "fs";
import path from "path";
import {
  IllegalArgumentException,
  isDefined,
  requireArgument,
  requireMethodIsPOST,
  UnsupportedMethodException
} from "../../models/validations";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    requireMethodIsPOST(req);
    const testRun = requireArgument(
      req.body,
      v => isDefined(v) && isDefined(v.testSuite) && isDefined(v.executionTime) && isDefined(v.testCases)
    );
    if (!fs.existsSync(TESTRUNS_DIR)) {
      fs.mkdirSync(TESTRUNS_DIR, { recursive: true });
    }
    const fileName = `test-run-${Date.now()}.json`;
    const filePath = path.join(TESTRUNS_DIR, fileName);

    fs.writeFileSync(filePath, JSON.stringify(testRun, null, 2), "utf-8");

    res.status(200).json({ message: "Test run uploaded successfully", fileName });
  } catch (error) {
    if (error instanceof IllegalArgumentException) {
      res.status(400).json({ error: "Invalid JSON format" });
    } else if (error instanceof UnsupportedMethodException) {
      res.status(405).json({ error: "Method Not Allowed" });
    } else {
      res.status(500).json({ error: "Internal Server Error: " + error });
    }
  }
}
