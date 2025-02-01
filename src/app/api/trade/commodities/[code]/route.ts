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
    const commodity = await TradeScraper.getCommodityPrices(props.params.code);
    return NextResponse.json(commodity);
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
