import { TriageNote } from "@/models/test-entities";
import { fetchTriage, removeTriage, storeTriage } from "@/models/test-manager"; // Use server-side logic
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { runId, testSuiteId, testCaseId, insight, by, ticket } = body;

    const triageNote : TriageNote = await storeTriage(runId, testSuiteId, testCaseId, { ticket: ticket, insight: insight, by: by });
    console.log("triageNote", triageNote);
    return NextResponse.json(triageNote);
  } catch (error) {
    if (error instanceof KnownError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode() });
    }
    return NextResponse.json({ error: "Failed to fetch test runs: <" + error + ">" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const [runId, testSuiteId, testCaseId] = requireSearchParamsParametersForGetAreSet(searchParams);
    const triageNote: TriageNote | undefined = (await fetchTriage(runId, testSuiteId, testCaseId)) ?? undefined;
    console.log("GET: triageNote", triageNote);
    if (triageNote) return NextResponse.json(triageNote);
    return NextResponse.json(triageNote);
  } catch (error) {
    if (error instanceof KnownError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode() });
    }
    return NextResponse.json({ error: "Failed to fetch test runs: <" + error + ">" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const [runId, testSuiteId, testCaseId] = requireSearchParamsParametersForGetAreSet(searchParams);
    await removeTriage(runId, testSuiteId, testCaseId);
    console.log("DELETE: triageNote");
    return NextResponse.json({});
  } catch (error) {
    if (error instanceof KnownError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode() });
    }
    return NextResponse.json({ error: "Failed to fetch test runs: <" + error + ">" }, { status: 500 });
  }
}

class KnownError extends Error {
  private httpStatusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "KnownError";
    this.httpStatusCode = statusCode;
  }

  public statusCode(): number {
    return this.httpStatusCode;
  }
}

function requireSearchParamsParametersForGetAreSet(searchParams: URLSearchParams): [string, string, string] {
  const runId = searchParams.get("runId");
  const testSuiteId = searchParams.get("testSuiteId");
  const testCaseId = searchParams.get("testCaseId");
  if (!testCaseId || !testSuiteId || !runId) {
    throw new KnownError(
      400,
      `Missing required parameters: runId:<${runId}>, testSuiteId:<${testSuiteId}>, testCaseId:<${testCaseId}>`
    );
  }
  return [runId, testSuiteId, testCaseId];
}
