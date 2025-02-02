export interface ErrorResponse {
    message: string;
    response?: {
        status: number;
        data?: unknown;
    };
    code?: string;
}

export class TradeError extends Error {
    static COMMODITY_NOT_FOUND = 'Commodity not found. Please check the spelling and try again.';
    static RATE_LIMITED = 'Too many requests. Please try again in a few minutes.';
    static NETWORK_ERROR = 'Unable to connect to trade website. Please try again later.';

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

export interface LocationPrice {
    name: string;
    system: string;
    type?: string;
    orbit?: string;
    faction: string;
    scuBoxSizes: number[];
    price: {
        current: number;
        avg: number;
        min: number;
        max: number;
    };
    inventory: {
        current: number;
        max: number;
    };
}

export interface CommodityPrice {
    commodity: string;
    code: string;
    bestSellLocation?: {
        name: string;
        system: string;
        price: number;
    };
    averagePrice: number;
    pricePerSCU: number;
    locations: LocationPrice[];
    lastUpdated: Date;
}

export interface TradeRoute {
    startLocation: string;
    endLocation: string;
    commodity: string;
    profitPerSCU: number;
    distance: number;
}

export interface ScrapeOptions {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    cacheTime?: number;
}

export interface RequestConfig {
    maxRetries: number;
    minDelay: number;
    maxDelay: number;
    userAgents: string[];
    backoffFactor: number;
}

export interface PriceData {
    min: number;
    max: number;
    avg: number;
    median: number;
    locations: LocationPrice[];
}

export interface CargoData {
    code: string;
    name: string;
    avg: number;
    min: number;
    max: number;
}
