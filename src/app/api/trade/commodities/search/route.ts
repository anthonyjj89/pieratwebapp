import { NextRequest, NextResponse } from 'next/server';
import scraper from '@/services/trade/scraper';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q') || '';

        // Get all commodities and filter by query
        const commodities = await scraper.getCommodities();
        const filteredCommodities = commodities.filter(code => 
            code.toLowerCase().includes(query.toLowerCase())
        );

        // Get price data for each commodity
        const results = await Promise.all(
            filteredCommodities.slice(0, 5).map(async code => {
                const data = await scraper.getCommodityData(code);
                const bestLocation = data[0] || null;

                return {
                    code,
                    name: code, // TODO: Get proper name from data
                    shortName: code,
                    location: bestLocation?.name || 'Unknown',
                    currentPrice: bestLocation?.price.current || 0
                };
            })
        );

        return NextResponse.json({ commodities: results });

    } catch (error) {
        console.error('Error searching commodities:', error);
        return NextResponse.json(
            { error: 'Failed to search commodities' },
            { status: 500 }
        );
    }
}
