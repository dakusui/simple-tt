'use client'

import { useState, useEffect } from "react";

export default function EditTriage({runId, testSuiteId, testCaseId}: {runId: string, testSuiteId: string, testCaseId: string}) {
  const [triage, setTriage] = useState("");
  const [message, setMessage] = useState("");

  // Load the current triage (analysis) when fileName and testCase are available.
  useEffect(() => {
    if (runId && testSuiteId && testCaseId) {
      fetch(
        `/api/triage?runId=${encodeURIComponent(
          runId as string
        )}&testSuiteId=${encodeURIComponent(testSuiteId as string)}&testCaseId=${encodeURIComponent(testCaseId as string)}`
      )
        .then(res => res.json())
        .then(data => setTriage(data.analysis || ""))
        .catch(() => setMessage("Failed to load triage"));
    }
  }, [runId, testSuiteId, testCaseId]);

  // Handle submitting the updated triage.
  const handleSubmit = async () => {
    if (!triage.trim()) {
      setMessage("Triage cannot be empty.");
      return;
    }

    const params = {
        runId: runId,
        testSuiteId: testSuiteId,
        testCaseId: testCaseId,
        ticket: "TICKET-123",
        insight: triage,
        by: "me"
    }
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
    <div style={{margin: "auto", padding: "20px" }}>
      <h1>Edit Triage</h1>
      <p>
        {testSuiteId.replace(/.*\./, "")}: {testCaseId.replace(/[$|_]/, " ")}   
      </p>
      <textarea value={triage} onChange={e => setTriage(e.target.value)} rows={4} cols={50} />
      <br />
      <button onClick={handleSubmit}>Save Changes</button>
      <p>{message}</p>
    </div>
  );
}
