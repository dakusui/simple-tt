import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link";

interface TestRun {
    fileName: string;
    testSuite: string;
    testResult: string;
    executionTime: string;
    manualAnalysis?: string;
}

export default function TestCaseRunsPage() {
    const router = useRouter();
    const { testCase } = router.query;
    const [runs, setRuns] = useState<TestRun[]>([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!testCase) return;

        fetch(`/api/test-case-runs?testCase=${encodeURIComponent(testCase as string)}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    setMessage(data.error);
                } else {
                    setRuns(data.runs);
                }
            })
            .catch(() => setMessage("Failed to load test runs"));
    }, [testCase]);

    return (
        <div style={{ maxWidth: "800px", margin: "auto", padding: "20px" }}>
            <h1>Test Runs for: {testCase}</h1>
            {message && <p>{message}</p>}
            <table border="1" cellPadding="5">
                <thead>
                <tr>
                    <th>Test Suite</th>
                    <th>Result</th>
                    <th>Execution Time</th>
                    <th>File Name</th>
                    <th>Manual Analysis</th>
                </tr>
                </thead>
                <tbody>
                {runs.map((run, index) => (
                    <tr key={index}>
                        <td>{run.testSuite}</td>
                        <td style={{ color: run.testResult === "FAIL" ? "red" : "black" }}>
                            {run.testResult}
                        </td>
                        <td>{new Date(run.executionTime).toLocaleString()}</td>
                        <td>{run.fileName}</td>
                        <td>
                            {run.manualAnalysis ? (
                                run.manualAnalysis
                            ) : (
                                <Link legacyBehavior href={`/analyze?fileName=${encodeURIComponent(run.fileName)}&testCase=${encodeURIComponent(testCase as string)}`}>
                                    <a style={{ color: "blue", textDecoration: "underline" }}>
                                        Add Manual Analysis
                                    </a>
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
