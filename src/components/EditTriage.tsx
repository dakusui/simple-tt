"use client";

import { TriageNote } from "@/models/test-entities";
import { useEffect, useState } from "react";

export default function EditTriage({
  runId,
  testSuiteId,
  testCaseId,
  onUpdate
}: {
  runId: string;
  testSuiteId: string;
  testCaseId: string;
  onUpdate: (runId, testSuiteId, testCaseId) => void;
}) {
  const [triage, setTriage] = useState<TriageNote | undefined>(undefined);
  const [message, setMessage] = useState("");

  // Load the current triage (analysis) when fileName and testCase are available.
  useEffect(() => {
    if (runId && testSuiteId && testCaseId) {
      fetch(
        `/api/triage/${encodeURIComponent(runId)}/${encodeURIComponent(testSuiteId as string)}/${encodeURIComponent(testCaseId as string)}`,
        { method: "GET" }
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
      ticket: triage.ticket,
      insight: triage.insight,
      by: triage.by
    };
    const response = await fetch(`/api/triage/${encodeURIComponent(runId)}/${encodeURIComponent(testSuiteId as string)}/${encodeURIComponent(testCaseId as string)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params)
    });

    const result = await response.json();
    if (response.ok) {
      setMessage("Triage updated successfully!");
      onUpdate(runId, testSuiteId, testCaseId);
    } else {
      setMessage(`Error: ${result.error}`);
    }
  };

  // Handle removing the triage.
  const handleRemove = async () => {
    try {
      fetch(
        `/api/triage/${encodeURIComponent(runId)}/${encodeURIComponent(testSuiteId as string)}/${encodeURIComponent(testCaseId as string)}`,
        { method: "DELETE" }
      )
        .then(res => res.json())
        .catch(() => setMessage("Failed to load triage"));
      onUpdate(runId, testSuiteId, testCaseId);
    } catch (error) {
      setMessage("Failed to remove triage. :<" + error + ">");
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
      <button onClick={handleRemove}>Remove Triage</button>
      <p>{message}</p>
    </div>
  );
}
