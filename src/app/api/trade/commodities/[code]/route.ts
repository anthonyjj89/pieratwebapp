import { NextResponse } from 'next/server';
import { TradeScraper } from '@/services/trade/scraper';
import type { TradeError } from '@/services/trade/types';

export async function GET(
  request: Request,
  context: { params: { code: string } }
) {
  const { code } = context.params;
  try {
    const commodity = await TradeScraper.getCommodityPrices(code);
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
