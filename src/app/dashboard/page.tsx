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
    console.log("Selected test run: <"+ runId + ">");
    setSelectedTestRun([runId, run]);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Left Column: contains two vertical sections */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top: Test Case List */}
        <div style={{ flex: 1, borderBottom: "1px solid #ccc", overflow: "auto" }}>
          <StatusTable onSelect={handleTestCaseSelect} />
        </div>
        {/* Bottom: Test Case Run History (only visible if a test case is selected) */}
        {selectedTestCase && (
          <div style={{ flex: 1, overflow: "auto" }}>
            <TestCaseRunHistory
              testSuiteId={selectedTestCase.testSuiteId}
              testCaseId={selectedTestCase.testCaseId}
              onSelect={handleTestRunSelect}
            />
          </div>
        )}
      </div>
      {/* Right Column: EditTriage (only visible if a test run is selected) */}
      <div style={{ flex: 1, borderLeft: "1px solid #ccc", overflow: "auto" }}>
        {selectedTestRun ? (
          <EditTriage runId={selectedTestRun[0]} testSuiteId={selectedTestRun[1].testSuiteId} testCaseId={selectedTestRun[1].testCaseId} />
        ) : (
          <p style={{ padding: "20px" }}>Select a test run to edit</p>
        )}
      </div>
    </div>
  );
}
