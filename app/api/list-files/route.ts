import fs from 'fs';
import { handleError } from '../../../models/validations';
import { NextResponse } from 'next/server';
import { TESTRUNS_DIR } from '../../../models/constants';


export async function GET() {
    try {
        if (!fs.existsSync(TESTRUNS_DIR)) {
            fs.mkdirSync(TESTRUNS_DIR);
        }

        const files = fs.readdirSync(TESTRUNS_DIR).filter(file => file.endsWith('.json'));
        return NextResponse.json({files});
    } catch (error) {
        return handleError(error);
    }
}
