"use client";

import { TestCaseRunWithTriage } from "@/models/test-entities";
import { useEffect, useState } from "react";

export default function TestCaseRunHistory({ testSuiteId, testCaseId, onSelect }: { testSuiteId: string; testCaseId: string, onSelect: (runId: string, testCase: TestCaseRunWithTriage) => void}) {
  const [runs, setRuns] = useState<[string, TestCaseRunWithTriage][]>([]);
  const [message, setMessage] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'ascending' | 'descending' } | null>(null);

  useEffect(() => {
    console.log("Fetching test runs for", testSuiteId, testCaseId);
    if (!testSuiteId || !testCaseId) return;

    fetch(
      `/api/test-case-history?testSuiteId=${encodeURIComponent(testSuiteId)}&testCaseId=${encodeURIComponent(testCaseId)}`
    )
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

  const sortedRuns = [...runs];
  if (sortConfig !== null) {
    sortedRuns.sort((a, b) => {
      const aValue = a[1][sortConfig.key];
      const bValue = b[1][sortConfig.key];
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div style={{ margin: "auto", padding: "20px" }}>
      {message && <p>{message}</p>}
      <table border={1} cellPadding="5">
        <thead>
          <tr>
            <th onClick={() => requestSort('runId')}>runId</th>
            <th onClick={() => requestSort('result')}>Result</th>
            <th onClick={() => requestSort('startDate')}>Execution Time</th>
            <th onClick={() => requestSort('triageNote.ticket')}>File Name</th>
            <th onClick={() => requestSort('triageNote.insight')}>Triage</th>
          </tr>
        </thead>
        <tbody>
          {sortedRuns.map((run, index) => (
            <tr key={index} onClick={() => onSelect(run[0], run[1])} style={{ cursor: "pointer", transition: "background-color 0.3s" }}>
              <td>{run[0]}</td>
              <td style={{ color: run[1].result === "FAIL" ? "red" : "black" }}>{run[1].result}</td>
              <td>{new Date(run[1].startDate ?? 0).toLocaleString()}</td>
              <td>{run[1].triageNote ? run[1].triageNote.ticket : "-"}</td>
              <td>
                {run[1].triageNote ? (
                  <>
                    <span>{run[1].triageNote.insight}</span> <br />
                  </>
                ) : (
                "-")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}