import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function EditAnalysisPage() {
    const router = useRouter();
    const { fileName, testCase } = router.query;
    const [manualAnalysis, setManualAnalysis] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (fileName && testCase) {
            fetch(`/api/get-analysis?fileName=${encodeURIComponent(fileName as string)}&testCase=${encodeURIComponent(testCase as string)}`)
                .then(res => res.json())
                .then(data => setManualAnalysis(data.analysis || ""))
                .catch(() => setMessage("Failed to load manual analysis"));
        }
    }, [fileName, testCase]);

    const handleSubmit = async () => {
        if (!manualAnalysis.trim()) {
            setMessage("Manual analysis cannot be empty.");
            return;
        }

        const response = await fetch("/api/store-analysis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileName, testCase, analysis: manualAnalysis }),
        });

        const result = await response.json();
        if (response.ok) {
            setMessage("Analysis updated successfully!");
        } else {
            setMessage(`Error: ${result.error}`);
        }
    };

    return (
        <div style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>
            <h1>Edit Manual Analysis</h1>
            <p><strong>Test Case:</strong> {testCase}</p>
            <textarea
                value={manualAnalysis}
                onChange={(e) => setManualAnalysis(e.target.value)}
                rows={4}
                cols={50}
            />
            <br />
            <button onClick={handleSubmit}>Save Changes</button>
            <p>{message}</p>
        </div>
    );
}
