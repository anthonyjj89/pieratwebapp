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
