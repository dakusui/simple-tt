import { NextResponse } from "next/server";
import { fetchTestCaseRunHistory } from "@/models/test-manager"; // Use server-side logic

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const testSuiteId = searchParams.get("testSuiteId");
  const testCaseId = searchParams.get("testCaseId");

  if (!testCaseId || !testSuiteId) {
    return NextResponse.json({ error: "Missing testCase parameter" }, { status: 400 });
  }

  try {
    const runs = await fetchTestCaseRunHistory(testSuiteId, testCaseId);
    return NextResponse.json({ runs });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch test runs: <" + error + ">" }, { status: 500 });
  }
}
