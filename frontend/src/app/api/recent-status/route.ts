
// src/app/api/recent-status/route.ts
import { NextResponse } from 'next/server';
import { fetchRecentStatuses } from '@/models/test-manager';

export async function GET() {
    try {
        const data = await fetchRecentStatuses(); // Fetch the data from test-manager
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching recent statuses:', error);
        return NextResponse.json({ error: 'Failed to load test case statuses' }, { status: 500 });
    }
}
