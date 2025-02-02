import { NextRequest } from 'next/server';
import { RSIProfile } from '@/services/rsi/types';
import { LocationPrices, CommodityPrices } from '@/services/trade/types';

// API Response Types
export type ApiResponse<T> = {
    data?: T;
    error?: string;
};

// Route Context Types
export type RouteContext<T> = {
    params: T;
    searchParams: URLSearchParams;
};

// Players API
export type PlayerResponse = ApiResponse<RSIProfile>;
export type PlayerRouteContext = RouteContext<{ handle: string | string[] }>;

// Trade API
export type CommodityResponse = ApiResponse<CommodityPrices>;
export type LocationResponse = ApiResponse<LocationPrices>;
export type TradeRouteContext = RouteContext<{ code: string | string[] }>;

// Generic Route Handler Type
export type RouteHandler<T, R> = (
    request: NextRequest,
    context: RouteContext<T>
) => Promise<R>;
