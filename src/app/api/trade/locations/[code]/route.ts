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
