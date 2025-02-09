import { NextApiRequest, NextApiResponse } from "next";
import { TESTRUNS_DIR } from "../../models/constants";
import fs from "fs";
import path from "path";
import {
  handleError,
  isDefined,
  requireArgument,
  requireMethodIsPOST,
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
    handleError(error, res);
  }
}
