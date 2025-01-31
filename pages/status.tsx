import { useState, useEffect } from "react";
import Link from "next/link";

interface TestCase {
    testSuite: string;
    testCase: string;
    testResult: string;
    executionTime: string;
    manualAnalysis?: string;
}

export default function StatusPage() {
    const [testCases, setTestCases] = useState<TestCase[]>([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetch("/api/recent-status")
            .then(res => res.json())
            .then(data => setTestCases(Array.isArray(data) ? data : []))
            .catch(() => setMessage("Failed to load test case statuses"));
    }, []);

    return (
        <div style={{ maxWidth: "800px", margin: "auto", padding: "20px" }}>
            <h1>Recent Test Case Statuses</h1>
            {message && <p>{message}</p>}
            <table border={1} cellPadding={5}>
                <thead>
                <tr>
                    <th>Test Suite</th>
                    <th>Test Case</th>
                    <th>Result</th>
                    <th>Last Run</th>
                    <th>Manual Analysis</th>
                </tr>
                </thead>
                <tbody>
                {testCases.map((test, index) => (
                    <tr key={index}>
                        <td>{test.testSuite}</td>
                        <td>
                            <Link href={`/test-case/${encodeURIComponent(test.testCase)}`}>
                                {test.testCase}
                            </Link>
                        </td>
                        <td style={{ color: test.testResult === "FAIL" ? "red" : "black" }}>
                            {test.testResult}
                        </td>
                        <td>{new Date(test.executionTime).toLocaleString()}</td>
                        <td>{test.manualAnalysis || "N/A"}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
