import { NextRequest, NextResponse } from 'next/server';
import scraper from '@/services/trade/scraper';
import { TradeError } from '@/services/trade/types';

export async function GET(
    _request: NextRequest,
    context: {
        params: { code: string | string[] },
        searchParams: URLSearchParams
    }
) {
    try {
        const { params } = context;
        const code = Array.isArray(params.code) ? params.code[0] : params.code;
        if (!code) {
            return NextResponse.json({ error: 'Location code is required' }, { status: 400 });
        }

        // Get location prices
        const data = await scraper.getCommodityPrices(code);

        // Format response
        const buyPrices = data.locations.flatMap(location => 
            location.prices.buy.map((entry) => ({
                commodity: entry.commodity,
                price: entry.price,
                quantity: entry.quantity,
                supply: entry.supply,
                timestamp: entry.timestamp
            }))
        );

        const sellPrices = data.locations.flatMap(location => 
            location.prices.sell.map((entry) => ({
                commodity: entry.commodity,
                price: entry.price,
                quantity: entry.quantity,
                demand: entry.demand,
                timestamp: entry.timestamp
            }))
        );

        return NextResponse.json({
            ...data,
            buyPrices,
            sellPrices
        });

    } catch (error) {
        console.error('Error fetching location prices:', error);
        
        if (error instanceof TradeError) {
            return NextResponse.json(
                { error: error.message },
                { status: error.statusCode || 500 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch location prices' },
            { status: 500 }
        );
    }
}
