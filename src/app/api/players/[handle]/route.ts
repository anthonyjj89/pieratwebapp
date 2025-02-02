import { NextResponse } from 'next/server';
import scraper from '@/services/rsi/scraper';

type Props = {
    params: Promise<{ handle: string }>;
};

export async function GET(
    request: Request,
    { params }: Props
) {
    try {
        const { handle } = await params;
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
