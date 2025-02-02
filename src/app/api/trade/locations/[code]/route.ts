import { NextResponse } from 'next/server';
import scraper from '@/services/trade/scraper';

type Props = {
    params: Promise<{ code: string }>;
};

export async function GET(
    request: Request,
    { params }: Props
) {
    try {
        const { code } = await params;
        const commodityPrice = await scraper.getCommodityPrices(code);

        // Calculate min, max, avg, and median prices from all locations
        const prices = commodityPrice.locations.map(loc => loc.price.current);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const avg = commodityPrice.averagePrice;
        const sortedPrices = [...prices].sort((a, b) => a - b);
        const mid = Math.floor(sortedPrices.length / 2);
        const median = sortedPrices.length % 2 === 0
            ? (sortedPrices[mid - 1] + sortedPrices[mid]) / 2
            : sortedPrices[mid];

        // Transform data into expected format
        const data = {
            min,
            max,
            avg,
            median,
            locations: commodityPrice.locations
        };

        return NextResponse.json({ data });

    } catch (error) {
        console.error('Error fetching location prices:', error);
        return NextResponse.json(
            { error: 'Failed to fetch location prices' },
            { status: 500 }
        );
    }
}
