// components/StatusTable.tsx
'use client';

import { useEffect, useState } from 'react';

interface TestCase {
  id: string;
  name: string;
  status: string;
}

const StatusTable = () => {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // test-manager.tsからデータを取得する関数を呼び出す
    // 例: const data = await testManager.getTestCases();
    // setTestCases(data);

    // 仮のデータ
    setTestCases([
      { id: '1', name: 'Test Case 1', status: 'Passed' },
      { id: '2', name: 'Test Case 2', status: 'Failed' },
    ]);
  }, []);

  return (
    <div>
      <h1>Test Case Status</h1>
      {message && <p>{message}</p>}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {testCases.map((testCase) => (
            <tr key={testCase.id}>
              <td>{testCase.id}</td>
              <td>{testCase.name}</td>
              <td>{testCase.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StatusTable;
