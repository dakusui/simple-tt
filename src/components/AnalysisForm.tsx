// components/AnalysisForm.tsx
'use client';

import { useState } from 'react';

interface AnalysisFormProps {
  testCaseId: string;
}

const AnalysisForm = ({ testCaseId }: AnalysisFormProps) => {
  const [analysis, setAnalysis] = useState('');
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    if (!analysis.trim()) {
      setMessage('Triage cannot be empty.');
      return;
    }

    // test-manager.tsの保存関数を呼び出す
    // 例: await testManager.saveAnalysis(testCaseId, analysis);

    setMessage('Analysis saved successfully.');
  };

  return (
    <div>
      <h1>Analyze Test Case</h1>
      <textarea
        value={analysis}
        onChange={(e) => setAnalysis(e.target.value)}
        rows={4}
        cols={50}
      />
      <br />
      <button onClick={handleSave}>Save Analysis</button>
      <p>{message}</p>
    </div>
 
::contentReference[oaicite:0]{index=0}
 
