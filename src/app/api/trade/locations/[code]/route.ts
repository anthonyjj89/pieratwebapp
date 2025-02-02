import { NextRequest, NextResponse } from 'next/server';
import scraper from '@/services/trade/scraper';

export async function GET(
    _request: NextRequest,
    { params }: { params: { code: string } }
) {
    try {
        const { code } = params;
        const location = await scraper.getLocationData(code);

        // Transform location data into expected format
        const data = {
            location: location.name,
            system: location.system,
            prices: location.commodities.map(commodity => ({
                commodity: commodity.code,
                buy: commodity.price,
                sell: commodity.price
            }))
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
