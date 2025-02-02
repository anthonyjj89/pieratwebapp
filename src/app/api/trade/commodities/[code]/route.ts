import { NextRequest, NextResponse } from 'next/server';
import scraper from '@/services/trade/scraper';

export async function GET(
    _request: NextRequest,
    { params }: { params: { code: string } }
) {
    try {
        const { code } = params;
        const data = await scraper.getCommodityPrices(code);

        return NextResponse.json({ data });

    } catch (error) {
        console.error('Error fetching commodity prices:', error);
        return NextResponse.json(
            { error: 'Failed to fetch commodity prices' },
            { status: 500 }
        );
    }
}
