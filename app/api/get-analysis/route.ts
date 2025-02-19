import { NextRequest, NextResponse } from "next/server";
import { ANALYSES_DIR } from "../../../models/constants";
import fs from "fs";
import path from "path";
import {
  handleError
} from "../../../src/models/validations";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const fileName  = searchParams.get("fileName") as string;
    const testCase = searchParams.get("testCase") as string;

    const analysisFilePath = path.join(ANALYSES_DIR, fileName);

    if (!fs.existsSync(analysisFilePath)) {
      return NextResponse.json({ analysis: "" }); // No analysis found
    }

    const analysisData = JSON.parse(fs.readFileSync(analysisFilePath, "utf-8"));
    const analysisEntry = analysisData.analyses.find((entry: { testCase: string }) => entry.testCase === testCase);

    return NextResponse.json({ analysis: analysisEntry ? analysisEntry.analysis : "" });
  } catch (error) {
    return handleError(error);
  }
}
