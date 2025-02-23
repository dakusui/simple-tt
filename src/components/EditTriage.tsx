import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function EditTriage() {
  const router = useRouter();
  const { runId, testSuiteId, testCaseId } = router.query;
  const [triage, setTriage] = useState("");
  const [message, setMessage] = useState("");

  // Load the current triage (analysis) when fileName and testCase are available.
  useEffect(() => {
    if (fileName && testCase) {
      fetch(
        `/api/triage?fileName=${encodeURIComponent(
          fileName as string
        )}&testCase=${encodeURIComponent(testCase as string)}`
      )
        .then((res) => res.json())
        .then((data) => setTriage(data.analysis || ""))
        .catch(() => setMessage("Failed to load triage"));
    }
  }, [fileName, testCase]);

  // Handle submitting the updated triage.
  const handleSubmit = async () => {
    if (!triage.trim()) {
      setMessage("Triage cannot be empty.");
      return;
    }

    const response = await fetch("/api/store-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName, testCase, analysis: triage }),
    });

    const result = await response.json();
    if (response.ok) {
      setMessage("Triage updated successfully!");
    } else {
      setMessage(`Error: ${result.error}`);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>
      <h1>Edit Triage</h1>
      <p>
        <strong>Test Case:</strong> {testCase}
      </p>
      <textarea
        value={triage}
        onChange={(e) => setTriage(e.target.value)}
        rows={4}
        cols={50}
      />
      <br />
      <button onClick={handleSubmit}>Save Changes</button>
      <p>{message}</p>
    </div>
  );
}
