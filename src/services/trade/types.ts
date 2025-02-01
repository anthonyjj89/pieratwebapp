export interface TradeCommodity {
    name: string;
    code: string;
    value: string;
    avgPrice: number | null;
    isPriceNA: boolean;
}

export interface PriceEntry {
    price: number;
    quantity: number;
    timestamp: string;
    commodity?: string;
    supply?: number;
    demand?: number;
}

export interface PriceStats {
    min: number;
    max: number;
    avg: number;
    median?: number;
}

export interface PriceList extends Array<PriceEntry>, PriceStats {}

export interface CommodityPrice {
    name: string;
    code: string;
    prices: {
        buy: PriceList;
        sell: PriceList;
    };
}

export interface TradeLocation {
    name: string;
    orbit: string;
    system: string;
    faction: string;
    code: string;
    type: 'STATION' | 'CITY' | 'OUTPOST';
    price: {
        current: number;
        min: number;
        max: number;
        avg: number;
    };
    inventory: {
        current: number;
        min: number;
        max: number;
        avg: number;
    };
    containerSizes: number[];
    isNoQuestions: boolean;
    prices: {
        buy: PriceEntry[];
        sell: PriceEntry[];
    };
}

export interface TradeData {
    bestLocation: TradeLocation;
    averagePrice: number | null;
    allLocations: TradeLocation[];
    boxInfo: {
        unitsPerBox: number;
    };
}

export interface PriceStats {
    min: number;
    max: number;
    avg: number;
    median?: number;
}

export interface PriceData extends PriceStats {
    locations: TradeLocation[];
    prices: {
        [locationCode: string]: CommodityPrice;
    };
}

export interface ScrapeOptions {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    cacheTime?: number;
}

export type ErrorResponse = {
    message?: string;
    code?: string;
    details?: string;
    response?: {
        status?: number;
        data?: {
            message?: string;
            code?: string;
            details?: string;
        };
    };
    isAxiosError?: boolean;
    error?: string;
};

export class TradeError extends Error {
    code?: number;
    details?: string;
    statusCode?: number;

    constructor(message: string) {
        super(message);
        this.name = 'TradeError';
    }

    static fromResponse(error: ErrorResponse): TradeError {
        const tradeError = new TradeError(error.message || error.error || 'Unknown error');
        if (error.response?.status) {
            tradeError.code = error.response.status;
            tradeError.statusCode = error.response.status;
        } else if (error.code === 'ECONNABORTED') {
            tradeError.code = 408; // Request Timeout
            tradeError.statusCode = 408;
        }
        tradeError.details = error.details || error.response?.data?.details || error.response?.data?.message;
        return tradeError;
    }
}

// Helper function to create a price entry
export function createPriceEntry(data: Partial<PriceEntry> & { price: number }): PriceEntry {
    return {
        price: data.price,
        quantity: data.quantity || 0,
        timestamp: data.timestamp || new Date().toISOString(),
        commodity: data.commodity,
        supply: data.supply,
        demand: data.demand
    };
}

// Helper function to create a price list with stats
export function createPriceList(entries: PriceEntry[] = [], stats?: Partial<PriceStats>): PriceList {
    const list = entries as PriceList;
    list.min = stats?.min ?? 0;
    list.max = stats?.max ?? 0;
    list.avg = stats?.avg ?? 0;
    if (stats?.median !== undefined) {
        list.median = stats.median;
    }
    return list;
}
