import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const ANALYSES_DIR = path.join(DATA_DIR, 'manual-analyses');

// Ensure the analysis directory exists
if (!fs.existsSync(ANALYSES_DIR)) {
    fs.mkdirSync(ANALYSES_DIR, { recursive: true });
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const { fileName, testCase, analysis } = req.body;

        if (!fileName || !testCase || !analysis) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const analysisFilePath = path.join(ANALYSES_DIR, fileName);
        let analysisData = { fileName, analyses: [] };

        if (fs.existsSync(analysisFilePath)) {
            analysisData = JSON.parse(fs.readFileSync(analysisFilePath, 'utf-8'));
        }

        // Check if test case already has an analysis
        const existingEntry = analysisData.analyses.find((entry: any) => entry.testCase === testCase);
        if (existingEntry) {
            existingEntry.analysis = analysis; // Update existing analysis
        } else {
            analysisData.analyses.push({ testCase, analysis });
        }

        fs.writeFileSync(analysisFilePath, JSON.stringify(analysisData, null, 2), 'utf-8');

        res.status(200).json({ message: "Manual analysis saved successfully", fileName });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}
