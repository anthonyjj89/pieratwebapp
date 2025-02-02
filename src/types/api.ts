import { NextRequest, NextResponse } from 'next/server';
import { RSIProfile } from '@/services/rsi/types';
import { LocationPrices, CommodityPrices } from '@/services/trade/types';

// API Response Types
export type ApiResponse<T> = {
    data?: T;
    error?: string;
};

// Players API
export type PlayerResponse = ApiResponse<RSIProfile>;

// Trade API
export type CommodityResponse = ApiResponse<CommodityPrices>;
export type LocationResponse = ApiResponse<LocationPrices>;

// Generic Route Handler Type
export type RouteHandler<R> = (
    request: NextRequest,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: any
) => Promise<NextResponse<R>>;

// Route Handler Types
export type PlayerRouteHandler = RouteHandler<PlayerResponse>;
export type CommodityRouteHandler = RouteHandler<CommodityResponse>;
export type LocationRouteHandler = RouteHandler<LocationResponse>;
