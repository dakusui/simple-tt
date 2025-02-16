import { NextRequest } from "next/server";
import { TESTRUNS_DIR } from "../../../models/constants";
import fs from "fs";
import path from "path";
import { handleError } from "../../../models/validations";
import { NextResponse } from "next/server";

export default function POST(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const testRun = {
      testSuite: searchParams.get("fileName") as string,
      executionTime: searchParams.get("exectutionTime") as string,
      analysis: searchParams.get("analysis") as string
    };
    if (!fs.existsSync(TESTRUNS_DIR)) {
      fs.mkdirSync(TESTRUNS_DIR, { recursive: true });
    }
    const fileName = `test-run-${Date.now()}.json`;
    const filePath = path.join(TESTRUNS_DIR, fileName);

    fs.writeFileSync(filePath, JSON.stringify(testRun, null, 2), "utf-8");

    return NextResponse.json({ message: "Test run uploaded successfully", fileName });
  } catch (error) {
    return handleError(error);
  }
}
