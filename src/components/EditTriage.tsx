"use client";

import { useState, useEffect } from "react";
import { TriageNote } from "@/models/test-entities";

export default function EditTriage({
  runId,
  testSuiteId,
  testCaseId
}: {
  runId: string;
  testSuiteId: string;
  testCaseId: string;
}) {
  const [triage, setTriage] = useState<TriageNote | undefined>(undefined);
  const [message, setMessage] = useState("");

  // Load the current triage (analysis) when fileName and testCase are available.
  useEffect(() => {
    if (runId && testSuiteId && testCaseId) {
      fetch(
        `/api/triage?runId=${encodeURIComponent(runId)}&testSuiteId=${encodeURIComponent(testSuiteId as string)}&testCaseId=${encodeURIComponent(testCaseId as string)}`
      )
        .then(res => res.json())
        .then(data => {
          console.log("data", data);
          return data;
        })
        .then(data => setTriage(data))
        .catch(() => setMessage("Failed to load triage"));
    } else {
      setMessage(
        "Request incomplete.: runId: " + runId + ", testSuiteId: " + testSuiteId + ", testCaseId: " + testCaseId
      );
    }
  }, [runId, testSuiteId, testCaseId]);

  // Handle submitting the updated triage.
  const handleSubmit = async () => {
    if (triage == null) {
      setMessage("Triage cannot be empty.");
      return;
    }

    const params = {
      runId: runId,
      testSuiteId: testSuiteId,
      testCaseId: testCaseId,
      ticket: triage.ticket,
      insight: triage.insight,
      by: triage.by
    };
    const response = await fetch("/api/triage", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params)
    });

    const result = await response.json();
    if (response.ok) {
      setMessage("Triage updated successfully!");
    } else {
      setMessage(`Error: ${result.error}`);
    }
  };

  return (
    <div style={{ margin: "auto", padding: "20px" }}>
      <textarea
        value={triage?.insight}
        onChange={e => setTriage({ ticket: "TICKET-12345", by: "hiroshi", insight: e.target.value } as TriageNote)}
        rows={4}
        cols={80}
      />
      <br />
      <button onClick={handleSubmit}>Save Changes</button>
      <p>{message}</p>
    </div>
  );
}
