import EditTriage from "@/components/EditTriage";

export default async function TestCaseRunsPage({
  params
}: {
  params: { runId: string; testSuiteId: string; testCaseId: string };
}) {
  const resolvedParams = await params;
  return (
    <div>
      <h1>Run: {params.runId}</h1>
      <p>
        {params.testSuiteId.replace(/.*\./, "")}: {params.testCaseId.replace(/[$|_]/, " ")}
      </p>

      <EditTriage
        runId={resolvedParams.runId}
        testSuiteId={resolvedParams.testSuiteId}
        testCaseId={resolvedParams.testCaseId}
      />
    </div>
  );
}
