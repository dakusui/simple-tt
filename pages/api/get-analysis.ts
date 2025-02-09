import { NextApiRequest, NextApiResponse } from "next";
import { ANALYSES_DIR } from "../../models/constants";
import fs from "fs";
import path from "path";
import { stringify } from "querystring";
import {
  IllegalArgumentException,
  requireArgument,
  requireMethodIsGET,
  isDefinedString,
  UnsupportedMethodException
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
    if (error instanceof IllegalArgumentException) {
      res.status(400).json({ error: "Invalid file name or test case" });
    } else if (error instanceof UnsupportedMethodException) {
      res.status(405).json({ error: "Method Not Allowed" });
    } else {
      res.status(500).json({ error: "Internal Server Error: <" + stringify(error) + ">" });
    }
  }
}
