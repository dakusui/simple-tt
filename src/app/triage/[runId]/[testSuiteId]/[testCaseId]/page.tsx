import EditTriage from "@/components/EditTriage";

export default async function TestCaseRunsPage({
  params,
}: {
  params: { runId: string, testSuiteId: string; testCaseId: string };
}) {
  const resolvedParams = await params;
  return (
    <EditTriage runId={resolvedParams.runId} testSuiteId={resolvedParams.testSuiteId} testCaseId={resolvedParams.testCaseId} />
  );
}
