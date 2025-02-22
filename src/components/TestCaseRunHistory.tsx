"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface TestRun {
  fileName: string;
  testSuite: string;
  testResult: string;
  executionTime: string;
  manualAnalysis?: string;
}

export default function TestCaseRunHistory({testSuiteId, testCaseId}: {testSuiteId: string, testCaseId: string}) {
  const [runs, setRuns] = useState<TestRun[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    console.log("Fetching test runs for", testSuiteId, testCaseId);
    if (!testSuiteId || !testCaseId) return;

    fetch(`/api/test-case-history?testSuiteId=${encodeURIComponent(testSuiteId)}&testCaseId=${encodeURIComponent(testCaseId)}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setMessage(data.error);
        } else {
          setRuns(data.runs);
        }
      })
      .catch(() => setMessage("Failed to load test runs"));
  }, [testSuiteId, testCaseId]);

  return (
    <div style={{ maxWidth: "800px", margin: "auto", padding: "20px" }}>
      <h1>Test Runs for: {testCaseId}</h1>
      {message && <p>{message}</p>}
      <table border={1} cellPadding="5">
        <thead>
          <tr>
            <th>Test Suite</th>
            <th>Result</th>
            <th>Execution Time</th>
            <th>File Name</th>
            <th>Manual Analysis</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run, index) => (
            <tr key={index}>
              <td>{run.testSuite}</td>
              <td style={{ color: run.testResult === "FAIL" ? "red" : "black" }}>
                {run.testResult}
              </td>
              <td>{new Date(run.executionTime).toLocaleString()}</td>
              <td>{run.fileName}</td>
              <td>
                {run.manualAnalysis ? (
                  <>
                    <span>{run.manualAnalysis}</span> <br />
                    <Link legacyBehavior href={`/edit-analysis?fileName=${encodeURIComponent(run.fileName)}&testCase=${encodeURIComponent(testCaseId)}`}>
                      <a style={{ color: "blue", textDecoration: "underline" }}>
                        Edit Manual Analysis
                      </a>
                    </Link>
                  </>
                ) : (
                  <Link legacyBehavior href={`/analyze?fileName=${encodeURIComponent(run.fileName)}&testCase=${encodeURIComponent(testCaseId)}`}>
                    <a style={{ color: "blue", textDecoration: "underline" }}>
                      Add Manual Analysis
                    </a>
                  </Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
