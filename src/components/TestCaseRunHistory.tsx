"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TestCaseRunWithTriage } from "@/models/test-entities";

export default function TestCaseRunHistory({ testSuiteId, testCaseId }: { testSuiteId: string; testCaseId: string }) {
  const [runs, setRuns] = useState<[string, TestCaseRunWithTriage][]>([]);
  const [message, setMessage] = useState("");

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

  return (
    <div style={{ margin: "auto", padding: "20px" }}>
      <h1>
        {testSuiteId.replace(/.*\./, "")}: {testCaseId.replace(/[$|_]/, " ")}
      </h1>
      {message && <p>{message}</p>}
      <table border={1} cellPadding="5">
        <thead>
          <tr>
            <th>runId</th>
            <th>Result</th>
            <th>Execution Time</th>
            <th>File Name</th>
            <th>Triage</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run, index) => (
            <tr key={index}>
              <td>{run[0]}</td>
              <td style={{ color: run[1].result === "FAIL" ? "red" : "black" }}>{run[1].result}</td>
              <td>{new Date(run[1].startDate ?? 0).toLocaleString()}</td>
              <td>{run[1].triageNote ? run[1].triageNote.ticket : "-"}</td>
              <td>
                {run[1].triageNote ? (
                  <>
                    <span>{run[1].triageNote.insight}</span> <br />
                    <Link
                      legacyBehavior
                      href={`/triage/${encodeURIComponent(run[0])}/${encodeURIComponent(testSuiteId)}/${encodeURIComponent(testCaseId)}`}
                    >
                      <a style={{ color: "blue", textDecoration: "underline" }}>Edit Diagnosis</a>
                    </Link>
                  </>
                ) : (
                  <Link
                    legacyBehavior
                    href={`/triage/${encodeURIComponent(run[0])}/${encodeURIComponent(testSuiteId)}/${encodeURIComponent(testCaseId)}`}
                  >
                    <a style={{ color: "blue", textDecoration: "underline" }}>Triage</a>
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
