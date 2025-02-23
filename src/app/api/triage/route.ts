import { TriageNote } from "@/models/test-entities";
import { fetchTriage, storeTriage } from "@/models/test-manager"; // Use server-side logic
import { NextResponse } from "next/server";
import SuperJSON from "superjson";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { runId, testSuiteId, testCaseId, insight, by, ticket } = body;

    const triageNote = await storeTriage(runId, testSuiteId, testCaseId, { ticket: ticket, insight: insight, by: by });
    return NextResponse.json({ runs: triageNote });
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
    if (triageNote) return NextResponse.json({ triageNote: SuperJSON.stringify(triageNote) });
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

function requireSearchParamsParametersForPutAreSet(
  searchParams: URLSearchParams
): [string, string, string, string, string, string?] {
  const [runId, testSuiteId, testCaseId] = requireSearchParamsParametersForGetAreSet(searchParams);
  const ticket = searchParams.get("ticket");
  const insight = searchParams.get("insight");
  const by = searchParams.get("by");
  if (!insight || !by) {
    throw new KnownError(400, `Missing required parameters: insight:<${insight}> , by:<${by}>`);
  }
  return [runId, testSuiteId, testCaseId, insight, by, ticket ?? undefined];
}
