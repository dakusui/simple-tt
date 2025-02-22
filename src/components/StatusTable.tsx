// src/components/StatusTable.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TestCaseState } from '@/models/test-entities';

const StatusTable = () => {
  const [ testCases, setTestCases] = useState<TestCaseState[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/recent-status')
      .then((res) => res.json())
      .then((data) => setTestCases(Array.isArray(data) ? data : []))
      .catch(() => setMessage('Failed to load test case statuses'));
  }, []);

  return (
    <div>
      {message && <p>{message}</p>}
      <table border={1} cellPadding={5}>
        <thead>
          <tr>
            <th>Test Suite</th>
            <th>Test Case</th>
            <th>Result</th>
            <th>Triage</th>
            <th>Last Run</th>
          </tr>
        </thead>
        <tbody>
          {testCases.map((test, index) => (
            <tr key={index}>
              <td><code>{test.testSuiteId}</code></td>
              <td>
                <Link href={`/test-case-history/${encodeURIComponent(test.testSuiteId)}/${encodeURIComponent(test.testCaseId)}`}>
                  <code>{test.testCaseId}</code>
                </Link>
              </td>
              <td style={{ color: test.lastResult === 'FAIL' ? 'red' : 'black' }}>
                {test.lastResult}
              </td>
              <td>
                {test.lastTriageNote?.insight || 'N/A'}
              </td>
              <td>{test.lastStartDate ? test.lastStartDate.toString() : ""} {test.lastElapsedTime ? ("(" + (test.lastElapsedTime /1000) + "[s])") : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StatusTable;
