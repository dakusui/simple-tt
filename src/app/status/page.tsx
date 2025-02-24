"use client"
import StatusTable from "@/components/StatusTable";
import { TestCaseRunWithTriage } from "@/models/test-entities";
import { useRouter } from "next/navigation";

export default function StatusPage() {
  const router = useRouter();
  const handleSelect = (testCase: TestCaseRunWithTriage) => {
    router.push(`/test-case-history/${encodeURIComponent(testCase.testSuiteId)}/${encodeURIComponent(testCase.testCaseId)}`);
  };
  return (
    <div>
      <h1>Recent Test Case Statuses</h1>
      <StatusTable onSelect={handleSelect} />
    </div>
  );
}
