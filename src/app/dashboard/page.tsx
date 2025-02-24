"use client";
import { useState } from "react";
import StatusTable from "@/components/StatusTable";
import TestCaseRunHistory from "@/components/TestCaseRunHistory";
import EditTriage from "@/components/EditTriage";
import { TestCaseRunWithTriage } from "@/models/test-entities";

export default function Dashboard() {
  const [selectedTestCase, setSelectedTestCase] = useState<TestCaseRunWithTriage | null>(null);
  const [selectedTestRun, setSelectedTestRun] = useState<[string, TestCaseRunWithTriage] | null>(null);

  // Called when a test case is selected from StatusTable.
  const handleTestCaseSelect = testCase => {
    setSelectedTestCase(testCase);
    setSelectedTestRun(null); // reset any previously selected run
  };

  // Called when a test run is selected from TestCaseRunHistory.
  const handleTestRunSelect = (runId, run) => {
    console.log("Selected test run: <" + runId + ">");
    setSelectedTestRun([runId, run]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Upper half: StatusTable */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          borderBottom: "1px solid #ccc",
          padding: "10px"
        }}
      >
        <StatusTable onSelect={handleTestCaseSelect} />
      </div>

      {/* Lower half: split into two columns */}
      <div style={{ flex: 1, display: "flex" }}>
        {/* Down-left: TestCaseRunHistory */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            borderRight: "1px solid #ccc",
            padding: "10px"
          }}
        >
          {selectedTestCase ? (
            <TestCaseRunHistory
              testSuiteId={selectedTestCase.testSuiteId}
              testCaseId={selectedTestCase.testCaseId}
              onSelect={handleTestRunSelect}
            />
          ) : (
            <p>Select a test case above to see its runs.</p>
          )}
        </div>
        {/* Down-right: EditTriage */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: "10px"
          }}
        >
          {selectedTestRun ? (
            <EditTriage
              runId={selectedTestRun[0]}
              testSuiteId={selectedTestRun[1].testSuiteId}
              testCaseId={selectedTestRun[1].testCaseId}
            />
          ) : (
            <p>Select a test run to edit.</p>
          )}
        </div>
      </div>
    </div>
  );
}