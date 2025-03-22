// src/app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { storeTestRun } from '@/models/test-manager';

export async function POST(request: Request) {
    try {
        const jsonData = await request.json(); // Parse the JSON payload
        console.log('Received JSON data:', jsonData);

        const fileName = await storeTestRun(jsonData); // Store the data using TestManager

        return NextResponse.json({ fileName });
    } catch (error) {
        console.error('Error processing upload:', error);
        return NextResponse.json({ error: 'Invalid JSON file' }, { status: 400 });
    }
}
