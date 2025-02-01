import { NextResponse, NextRequest } from 'next/server';
import { TradeScraper } from '@/services/trade/scraper';
import type { TradeError } from '@/services/trade/types';

type Props = {
  params: { code: string }
}

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  props: Props
) {
  try {
    const location = await TradeScraper.getLocationPrices(props.params.code);

    // Add query parameters to filter prices
    const searchParams = request.nextUrl.searchParams;
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const type = searchParams.get('type');

    if (minPrice || maxPrice || type) {
      const min = minPrice ? parseFloat(minPrice) : 0;
      const max = maxPrice ? parseFloat(maxPrice) : Infinity;

      // Filter buy prices
      location.prices.buy = location.prices.buy.filter(entry => {
        const matchesPrice = entry.price >= min && entry.price <= max;
        const matchesType = !type || entry.commodity.toLowerCase().includes(type.toLowerCase());
        return matchesPrice && matchesType;
      });

      // Filter sell prices
      location.prices.sell = location.prices.sell.filter(entry => {
        const matchesPrice = entry.price >= min && entry.price <= max;
        const matchesType = !type || entry.commodity.toLowerCase().includes(type.toLowerCase());
        return matchesPrice && matchesType;
      });
    }

    return NextResponse.json(location);
  } catch (error) {
    const tradeError = error as TradeError;
    return NextResponse.json(
      {
        error: tradeError.code || 'UNKNOWN_ERROR',
        message: tradeError.message || 'An unexpected error occurred',
        details: tradeError.details
      },
      { status: 500 }
    );
  }
}
