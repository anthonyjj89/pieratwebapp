// Error Types
export class TradeError extends Error {
    constructor(
        message: string,
        public statusCode?: number
    ) {
        super(message);
        this.name = 'TradeError';
    }

    static fromResponse(error: ErrorResponse): TradeError {
        const message = error.message || 'Unknown error';
        const statusCode = error.response?.status;
        return new TradeError(message, statusCode);
    }
}

export interface ErrorResponse {
    message: string;
    response?: {
        status: number;
        data?: unknown;
    };
    code?: string;
}

// Price Types
export interface PriceEntry {
    commodity: string;
    price: number;
    quantity: number;
    supply?: string;
    demand?: string;
    timestamp: string;
}

export interface LocationPrice {
    name: string;
    system: string;
    orbit?: string;
    price?: {
        current: number;
        avg: number;
        min?: number;
        max?: number;
    };
    prices: {
        buy: PriceEntry[];
        sell: PriceEntry[];
    };
    inventory?: {
        current: number;
        max: number;
        avg?: number;
    };
    containerSizes?: string[];
    type?: string;
    isNoQuestions?: boolean;
}

// Base Price Data
export interface BasePriceData {
    code: string;
    name: string;
    buy: PriceEntry[];
    sell: PriceEntry[];
    locations: LocationPrice[];
    min: number;
    max: number;
    avg: number;
    median: number;
}

// Trade Types
export interface TradeCommodity {
    code: string;
    name: string;
    type: string;
    description?: string;
    value: string;
    avgPrice?: number;
}

export interface TradeLocation {
    code: string;
    name: string;
    type: string;
    system: string;
    description?: string;
    orbit?: string;
    faction?: string;
    price?: {
        current: number;
        avg: number;
    };
    prices?: {
        buy: PriceEntry[];
        sell: PriceEntry[];
    };
}

// API Response Types
export type LocationPrices = BasePriceData;
export type CommodityPrices = BasePriceData;
export type PriceData = BasePriceData;

// Scraper Options
export interface ScrapeOptions {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    cacheTime?: number;
}

// Helper Functions
export function createPriceEntry(
    data: Partial<PriceEntry> & { commodity: string; price: number; quantity: number }
): PriceEntry {
    return {
        commodity: data.commodity,
        price: data.price,
        quantity: data.quantity,
        supply: data.supply,
        demand: data.demand,
        timestamp: data.timestamp || new Date().toISOString()
    };
}
