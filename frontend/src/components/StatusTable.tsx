// src/components/StatusTable.tsx
"use client";

import { useEffect, useState } from "react";
import { TestCaseRunWithTriage } from "@/models/test-entities";

export default function StatusTable({ onSelect }: { onSelect: (testCase: TestCaseRunWithTriage) => void }) {
  const [testCases, setTestCases] = useState<TestCaseRunWithTriage[]>([]);
  const [message, setMessage] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "ascending" | "descending" } | null>(null);

  useEffect(() => {
    fetch("/api/recent-status")
      .then(res => res.json())
      .then(data => setTestCases(Array.isArray(data) ? data : []))
      .catch(() => setMessage("Failed to load test case statuses"));
  }, []);

  const sortedData = [...testCases];
  if (sortConfig !== null) {
    sortedData.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }

  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    console.log("sort requested: " + key + " " + direction);
    setSortConfig({ key, direction });
  };

  return (
    <div>
      {message && <p>{message}</p>}
      <table border={1} cellPadding={5}>
        <thead>
          <tr>
            <th>#</th>
            <th onClick={() => requestSort("testSuiteId")}>Test Suite</th>
            <th onClick={() => requestSort("testCaseId")}>Test Case</th>
            <th onClick={() => requestSort("result")}>Result</th>
            <th>Triage</th>
            <th>Last Run</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((test, index) => (
            <tr
              key={index}
              onClick={() => onSelect(test)}
              style={{ cursor: "pointer", transition: "background-color 0.3s" }}
              onMouseOver={e => (e.currentTarget.style.backgroundColor = "#f2f2f2")}
              onMouseOut={e => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <td>{index}</td>
              <td>
                <code>{test.testSuiteId.replace(/.*\./, "")}</code>
              </td>
              <td>
                <code>{test.testCaseId}</code>
              </td>
              <td style={{ color: test.result === "FAIL" ? "red" : "black" }}>{test.result}</td>
              <td>{test.triageNote?.insight || "N/A"}</td>
              <td>
                {test.startDate ? test.startDate.toString() : ""}{" "}
                {test.elapsedTime ? "(" + test.elapsedTime / 1000 + "[s])" : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
