import TestCaseRunHistory from "@/components/TestCaseRunHistory";

export default async function TestCaseRunsPage({
  params,
}: {
  params: { testSuiteId: string; testCaseId: string };
}) {
  const resolvedParams = await params;
  return (
    <TestCaseRunHistory testSuiteId={resolvedParams.testSuiteId}  testCaseId={resolvedParams.testCaseId} />
  );
}
