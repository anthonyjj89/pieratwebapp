import { NextRequest, NextResponse } from 'next/server';
import scraper from '@/services/trade/scraper';
import { TradeError } from '@/services/trade/types';

type RouteParams = { params: { code: string } };

export async function GET(
    _request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { code } = params;
        if (!code) {
            return NextResponse.json({ error: 'Commodity code is required' }, { status: 400 });
        }

        // Get commodity prices
        const data = await scraper.getCommodityPrices(code);

        return NextResponse.json(data);

    } catch (error) {
        console.error('Error fetching commodity prices:', error);
        
        if (error instanceof TradeError) {
            return NextResponse.json(
                { error: error.message },
                { status: error.statusCode || 500 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch commodity prices' },
            { status: 500 }
        );
    }
}
