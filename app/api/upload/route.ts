import { NextRequest, NextResponse } from "next/server";
import { TestManager, TestRunSet, TestSuite } from "../../../models/test-manager";

const testManager = new TestManager(process.env.DATA_DIR || "data");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // "testSuite" or "testRun"

    if (!file || !type) {
      return NextResponse.json({ error: "Missing file or type" }, { status: 400 });
    }

    // Read file content
    const arrayBuffer = await file.arrayBuffer();
    const fileContent = Buffer.from(arrayBuffer).toString("utf-8");

    // Determine storage path using TestManager
    if (type === "testSuite") {
      testManager.storeTestSuite(TestSuite.fromJSON(JSON.parse(fileContent)));
    } else if (type === "testRun") {
      testManager.storeRunSet(TestRunSet.fromJSON(JSON.parse(fileContent)));
    } else {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    return NextResponse.json({ message: "File uploaded successfully" });
  } catch (error) {
    return NextResponse.json({ error: "File upload failed", details: error.message }, { status: 500 });
  }
}
