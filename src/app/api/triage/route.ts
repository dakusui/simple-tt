import { storeTriage } from "@/models/test-manager"; // Use server-side logic
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  try {
    const [runId, testSuiteId, testCaseId, insight, by, ticket] = requireSearchParamsParametersAreSet(searchParams);

    const triageNote = await storeTriage(runId, testSuiteId, testCaseId, { ticket: ticket, insight: insight, by: by });
    return NextResponse.json({ runs: triageNote });
  } catch (error) {
    if (error instanceof KnownError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: "Failed to fetch test runs: <" + error + ">" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
    const { searchParams } = new URL(req.url);
    console.log("PUT request received", searchParams);
}

class KnownError extends Error {
  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "KnownError";
  }

  get statusCode(): number {
    return this.statusCode;
  }
}

function requireSearchParamsParametersAreSet(
  searchParams: URLSearchParams
): [string, string, string, string, string, string?] {
  const runId = searchParams.get("runId");
  const testSuiteId = searchParams.get("testSuiteId");
  const testCaseId = searchParams.get("testCaseId");
  const ticket = searchParams.get("ticket");
  const insight = searchParams.get("insight");
  const by = searchParams.get("by");
  if (!testCaseId || !testSuiteId || !runId || !insight || !by) {
    throw new KnownError(
      400,
      `Missing required parameters: runId:<${runId}>, testSuiteId:<${testSuiteId}>, testCaseId:<${testCaseId}> , insight:<${insight}> , by:<${by}>`
    );
  }
  return [runId, testSuiteId, testCaseId, insight, by, ticket ?? undefined];
}
