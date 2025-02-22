import TestCaseRunHistory from "@/components/TestCaseRunHistory";

export default function TestCaseRunsPage({
  params,
}: {
  params: { testSuite: string; testCase: string };
}) {
  return (
    <TestCaseRunHistory testSuiteId={params.testSuite} testCaseId={params.testCase} />
  );
}
