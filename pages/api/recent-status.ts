import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const TESTRUNS_DIR = path.join(DATA_DIR, 'test-runs');
const DIAGNOSES_DIR = path.join(DATA_DIR, 'triage-diagnoses');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const testRunFiles = fs.readdirSync(TESTRUNS_DIR).filter(file => file.endsWith('.json'));
        const testCasesMap: Record<string, object> = {};

        testRunFiles.forEach(file => {
            const filePath = path.join(TESTRUNS_DIR, file);
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

            data.testCases.forEach((testCase: object) => {
                if (
                    !testCasesMap[testCase.testCase] ||
                    new Date(data.executionTime.end) > new Date(testCasesMap[testCase.testCase].executionTime)
                ) {
                    testCasesMap[testCase.testCase] = {
                        testSuite: data.testSuite,
                        testCase: testCase.testCase,
                        testResult: testCase.testResult,
                        executionTime: data.executionTime.end
                    };
                }
            });
        });

        // (Optional) Merge manual analysis
        const diagnosisFiles = fs.readdirSync(DIAGNOSES_DIR).filter(file => file.endsWith('.json'));
        diagnosisFiles.forEach(file => {
            const filePath = path.join(DIAGNOSES_DIR, file);
            const analysisData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

            analysisData.analyses.forEach((entry: any) => {
                if (testCasesMap[entry.testCase]) {
                    testCasesMap[entry.testCase].manualAnalysis = entry.analysis;
                }
            });
        });

        res.status(200).json(Object.values(testCasesMap));
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}
