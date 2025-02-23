// src/components/StatusTable.tsx
"use client";

import { useEffect, useState } from "react";
import { TestCaseRunWithTriage } from "@/models/test-entities";

export default function StatusTable({ onSelect }: { onSelect: (testCase: TestCaseRunWithTriage) => void }) {
  const [testCases, setTestCases] = useState<TestCaseRunWithTriage[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/recent-status")
      .then(res => res.json())
      .then(data => setTestCases(Array.isArray(data) ? data : []))
      .catch(() => setMessage("Failed to load test case statuses"));
  }, []);

  return (
    <div>
      {message && <p>{message}</p>}
      <table border={1} cellPadding={5}>
        <thead>
          <tr>
            <th>#</th>
            <th>Test Suite</th>
            <th>Test Case</th>
            <th>Result</th>
            <th>Triage</th>
            <th>Last Run</th>
          </tr>
        </thead>
        <tbody>
          {testCases.map((test, index) => (
            <tr
              key={index}
              onClick={() => onSelect(test)}
              style={{ cursor: "pointer", transition: "background-color 0.3s" }}
              onMouseOver={e => (e.currentTarget.style.backgroundColor = "#f2f2f2")}
              onMouseOut={e => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <td>{index}</td>
              <td>
                <code>{test.testSuiteId.replace(/.*\./, '')}</code>
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
