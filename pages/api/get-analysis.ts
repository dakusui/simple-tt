import { NextApiRequest, NextApiResponse } from "next";
import { ANALYSES_DIR } from "../../models/constants";
import fs from "fs";
import path from "path";
import {
  requireArgument,
  requireMethodIsGET,
  isDefinedString,
  handleError
} from "../../models/validations";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    requireMethodIsGET(req);
    const { fileName, testCase } = requireArgument(
      req.query,
      q => isDefinedString(q.fileName) && isDefinedString(q.testCase)
    ) as { fileName: string; testCase: string };

    const analysisFilePath = path.join(ANALYSES_DIR, fileName);

    if (!fs.existsSync(analysisFilePath)) {
      return res.status(200).json({ analysis: "" }); // No analysis found
    }

    const analysisData = JSON.parse(fs.readFileSync(analysisFilePath, "utf-8"));
    const analysisEntry = analysisData.analyses.find((entry: { testCase: string }) => entry.testCase === testCase);

    res.status(200).json({ analysis: analysisEntry ? analysisEntry.analysis : "" });
  } catch (error) {
    handleError(error, res);
  }
}
