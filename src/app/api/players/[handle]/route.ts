import { NextRequest, NextResponse } from 'next/server';
import scraper from '@/services/rsi/scraper';
import { RSIError } from '@/services/rsi/types';

// Destructure searchParams but prefix with _ to indicate it's intentionally unused
export async function GET(
    _request: NextRequest,
    context: {
        params: { handle: string | string[] },
        searchParams: URLSearchParams
    }
) {
    try {
        const { params } = context;
        const handle = Array.isArray(params.handle) ? params.handle[0] : params.handle;
        if (!handle) {
            return NextResponse.json({ error: 'Handle is required' }, { status: 400 });
        }

        // Get profile data
        const profile = await scraper.getProfileData(handle);

        return NextResponse.json(profile);

    } catch (error) {
        console.error('Error fetching player data:', error);
        
        if (error instanceof RSIError) {
            if (error.message === 'Profile not found') {
                return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
            }
            return NextResponse.json({ error: error.message }, { status: error.statusCode || 500 });
        }

        return NextResponse.json(
            { error: 'Failed to fetch player data' },
            { status: 500 }
        );
    }
}
