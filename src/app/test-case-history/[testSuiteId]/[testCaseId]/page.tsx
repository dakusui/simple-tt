'use client'

import TestCaseRunHistory from "@/components/TestCaseRunHistory";
import { TestCaseRunWithTriage } from "@/models/test-entities";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useParams, useRouter } from "next/navigation";

export default function TestCaseRunsPage() {
  const router: AppRouterInstance = useRouter();
  const resolvedParams: {testSuiteId:string, testCaseId: string} = useParams();
  const selection = (runId: string, testCase: TestCaseRunWithTriage) => {
    console.log("Selected test case", testCase);
    router.push(`/triage/${encodeURIComponent(runId)}/${encodeURIComponent(testCase.testSuiteId)}/${encodeURIComponent(testCase.testCaseId)}`);
  };
  return (
    <TestCaseRunHistory
      testSuiteId={resolvedParams.testSuiteId}
      testCaseId={resolvedParams.testCaseId}
      onSelect={selection}
    />
  );
}
