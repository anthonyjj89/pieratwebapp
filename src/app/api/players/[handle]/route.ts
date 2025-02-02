import { NextRequest, NextResponse } from 'next/server';
import scraper from '@/services/rsi/scraper';

export async function GET(
    _request: NextRequest,
    { params }: { params: { handle: string } }
) {
    try {
        const { handle } = params;
        const data = await scraper.getProfileData(handle);

        return NextResponse.json({ data });

    } catch (error) {
        console.error('Error fetching player data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch player data' },
            { status: 500 }
        );
    }
}
