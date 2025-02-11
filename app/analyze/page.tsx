"use client";

import { useState, useEffect } from "react";

export default function AnalyzePage({ params }: {params: { fileName: string; testCase: string }}) {
  const fileName = params["fileName"] as string;
  const testCase = params["testCase"] as string;
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>(fileName?.toString() || "");
  const [selectedTestCase, setSelectedTestCase] = useState<string>(testCase?.toString() || "");
  const [manualAnalysis, setManualAnalysis] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/list-files")
      .then(res => res.json())
      .then(data => setFiles(data.files || []))
      .catch(() => setMessage("Failed to load files"));
  }, []);

  useEffect(() => {
    if (selectedFile && selectedTestCase) {
      fetch(
        `/api/get-analysis?fileName=${encodeURIComponent(selectedFile)}&testCase=${encodeURIComponent(selectedTestCase)}`
      )
        .then(res => res.json())
        .then(data => setManualAnalysis(data.analysis || ""))
        .catch(() => setMessage("Failed to load manual analysis"));
    }
  }, [selectedFile, selectedTestCase]);

  const handleSubmit = async () => {
    if (!selectedFile || !selectedTestCase || !manualAnalysis.trim()) {
      setMessage("Please fill in all fields.: " + "selectedFile: <" + selectedFile + ">, selectedTestCase: <" + selectedTestCase + ">, manualAnalysis: <" + manualAnalysis + ">");
      return;
    }

    const response = await fetch("/api/store-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: selectedFile, testCase: selectedTestCase, analysis: manualAnalysis })
    });

    const result = await response.json();
    if (response.ok) {
      setMessage(`Analysis saved successfully!`);
    } else {
      setMessage(`Error: ${result.error}`);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>
      <h1>Analyze Test Run</h1>
      <label>Test Run File:</label>
      <select onChange={e => setSelectedFile(e.target.value)} value={selectedFile}>
        <option value="">Select a file</option>
        {files.map(file => (
          <option key={file} value={file}>
            {file}
          </option>
        ))}
      </select>

      {selectedFile && (
        <>
          <label>Test Case:</label>
          <input type="text" value={selectedTestCase} onChange={e => setSelectedTestCase(e.target.value)} />

          <label>Manual Analysis:</label>
          <textarea value={manualAnalysis} onChange={e => setManualAnalysis(e.target.value)} rows={4} cols={50} />

          <button onClick={handleSubmit}>Save Analysis</button>
        </>
      )}
      <p>{message}</p>
    </div>
  );
}
