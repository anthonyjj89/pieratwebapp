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
