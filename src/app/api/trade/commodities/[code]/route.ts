import { NextRequest, NextResponse } from 'next/server';
import scraper from '@/services/trade/scraper';
import { TradeError } from '@/services/trade/types';

export async function GET(
    request: NextRequest,
    { params }: { params: { code: string | string[] } }
) {
    try {
        const code = Array.isArray(params.code) ? params.code[0] : params.code;
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
