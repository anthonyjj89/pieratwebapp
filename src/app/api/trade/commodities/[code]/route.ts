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

        // Transform data into CargoData format
        const data = {
            code: commodityPrice.code,
            name: commodityPrice.commodity,
            avg: commodityPrice.averagePrice,
            min: Math.min(...commodityPrice.locations.map(loc => loc.price.current)),
            max: Math.max(...commodityPrice.locations.map(loc => loc.price.current))
        };

        return NextResponse.json({ data });

    } catch (error) {
        console.error('Error fetching commodity prices:', error);
        return NextResponse.json(
            { error: 'Failed to fetch commodity prices' },
            { status: 500 }
        );
    }
}
