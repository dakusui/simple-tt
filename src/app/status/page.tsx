'use client'
import StatusTable from "@/components/StatusTable";
import { TestCaseRunWithTriage } from "@/models/test-entities";

export default function StatusPage() {
  const handleSelect = (testCase: TestCaseRunWithTriage) => {
    console.log("specifiedTestCase:", testCase.testSuiteId, testCase.testCaseId);
  };
  return (
    <div>
      <h1>Recent Test Case Statuses</h1>
      <StatusTable onSelect={handleSelect} />
    </div>
  );
}
