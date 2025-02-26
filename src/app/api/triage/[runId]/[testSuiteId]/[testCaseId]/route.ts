import { TriageNote } from "@/models/test-entities";
import { fetchTriage, removeTriage, storeTriage } from "@/models/test-manager"; // Use server-side logic
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: { runId: string; testSuiteId: string; testCaseId: string } }
) {
  try {
    const body = await req.json();
    const { insight, by, ticket } = body;
    const { runId, testSuiteId, testCaseId } = await params;

    const triageNote: TriageNote = await storeTriage(runId, testSuiteId, testCaseId, {
      ticket: ticket,
      insight: insight,
      by: by
    });
    return NextResponse.json(triageNote);
  } catch (error) {
    if (error instanceof KnownError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode() });
    }
    return NextResponse.json({ error: "Failed to fetch test runs: <" + error + ">" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { runId: string; testSuiteId: string; testCaseId: string } }
) {
  try {
    const { runId, testSuiteId, testCaseId } = await params;
    const triageNote: TriageNote | undefined = (await fetchTriage(runId, testSuiteId, testCaseId)) ?? undefined;
    if (triageNote) return NextResponse.json(triageNote);
    return NextResponse.json({});
  } catch (error) {
    if (error instanceof KnownError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode() });
    }
    return NextResponse.json({ error: "Failed to fetch test runs: <" + error + ">" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { runId: string; testSuiteId: string; testCaseId: string } }
) {
  try {
    const { runId, testSuiteId, testCaseId } = await params;
    await removeTriage(runId, testSuiteId, testCaseId);
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
