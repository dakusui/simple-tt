import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const ANALYSES_DIR = path.join(DATA_DIR, 'triage-diagnoses');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const { fileName, testCase } = req.query;
        if (!fileName || !testCase || typeof fileName !== 'string' || typeof testCase !== 'string') {
            return res.status(400).json({ error: "Invalid file name or test case" });
        }

        const analysisFilePath = path.join(ANALYSES_DIR, fileName);

        if (!fs.existsSync(analysisFilePath)) {
            return res.status(200).json({ analysis: "" }); // No analysis found
        }

        const analysisData = JSON.parse(fs.readFileSync(analysisFilePath, 'utf-8'));
        const analysisEntry = analysisData.analyses.find((entry: any) => entry.testCase === testCase);

        res.status(200).json({ analysis: analysisEntry ? analysisEntry.analysis : "" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}
