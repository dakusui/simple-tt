import { NextApiRequest, NextApiResponse } from "next";
import { TESTRUNS_DIR } from "../../models/constants";
import fs from 'fs'
import path from 'path'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const testRun = req.body;
            if (!testRun || !testRun.testSuite || !testRun.executionTime || !testRun.testCases) {
                return res.status(400).json({error: "Invalid JSON format"});
            }

            if (!fs.existsSync(TESTRUNS_DIR)) {
                fs.mkdirSync(TESTRUNS_DIR, {recursive: true});
            }
            const fileName = `test-run-${Date.now()}.json`;
            const filePath = path.join(TESTRUNS_DIR, fileName);

            fs.writeFileSync(filePath, JSON.stringify(testRun, null, 2), 'utf-8');

            res.status(200).json({message: "Test run uploaded successfully", fileName});
        } catch (error) {
            res.status(500).json({error: "Internal Server Error: " + error});
        }
    } else {
        res.status(405).json({error: "Method Not Allowed"});
    }
}