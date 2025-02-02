import { NextRequest } from 'next/server';
import { RSIProfile } from '@/services/rsi/types';

export interface ApiResponse<T> {
    data?: T;
    error?: string;
}

export interface PlayerResponse {
    data?: RSIProfile;
    error?: string;
}

export type PlayerRouteHandler = (
    request: NextRequest,
    context: { params: { handle: string } }
) => Promise<Response>;

export type CommodityRouteHandler = (
    request: NextRequest,
    context: { params: { code: string } }
) => Promise<Response>;

export type LocationRouteHandler = (
    request: NextRequest,
    context: { params: { code: string } }
) => Promise<Response>;

export type SearchRouteHandler = (
    request: NextRequest
) => Promise<Response>;
