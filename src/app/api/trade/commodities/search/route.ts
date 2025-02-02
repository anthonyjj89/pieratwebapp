import { NextResponse } from 'next/server';
import scraper from '@/services/trade/scraper';

export async function GET(
    request: Request
) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q')?.toLowerCase() || '';

        // Get all commodities and filter by query
        const commodities = await scraper.getCommodities();
        const filteredCommodities = commodities.filter(code => 
            code.toLowerCase().includes(query)
        );

        // Get detailed data for top 5 matches
        const results = await Promise.all(
            filteredCommodities.slice(0, 5).map(async code => {
                const data = await scraper.getCommodityPrices(code);
                const bestLocation = data.bestSellLocation;

                return {
                    code: data.code,
                    name: data.commodity,
                    shortName: data.code.toUpperCase(),
                    location: bestLocation?.name || 'Unknown',
                    currentPrice: bestLocation?.price || 0
                };
            })
        );

        return NextResponse.json({ results });

    } catch (error) {
        console.error('Error searching commodities:', error);
        return NextResponse.json(
            { error: 'Failed to search commodities' },
            { status: 500 }
        );
    }
}
