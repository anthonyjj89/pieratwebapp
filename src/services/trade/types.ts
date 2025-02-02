export interface ErrorResponse {
    message: string;
    response?: {
        status: number;
        data?: unknown;
    };
    code?: string;
}

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

export interface LocationInventory {
    current: number;
    max: number;
}

export interface PriceInfo {
    current: number;
    avg: number;
    min: number;
    max: number;
}

export interface LocationPrice {
    name: string;
    system: string;
    type?: string;
    orbit?: string;
    isNoQuestions?: boolean;
    price: PriceInfo;
    inventory?: LocationInventory;
    containerSizes?: string[];
}

export interface TradeCommodity {
    code: string;
    name: string;
    description?: string;
    type: string;
    value: number;
    locations: LocationPrice[];
}

export interface PriceData extends CommodityPrices {
    code: string;
    name: string;
    type: string;
    min: number;
    max: number;
    avg: number;
    median: number;
    locations: LocationPrice[];
}

export interface TradeLocation {
    code: string;
    name: string;
    system: string;
    type: string;
    description?: string;
    orbit?: string;
    commodities: {
        code: string;
        name: string;
        price: number;
        inventory?: LocationInventory;
    }[];
}

export interface CommoditySearchResult {
    code: string;
    name: string;
    shortName: string;
    location: string;
    currentPrice: number;
}

export interface PriceEntry {
    commodity: string;
    buy?: number;
    sell?: number;
}

export interface LocationPrices {
    location: string;
    system: string;
    prices: PriceEntry[];
}

export interface CommodityPrices {
    commodity: string;
    locations: {
        name: string;
        system: string;
        buy?: number;
        sell?: number;
    }[];
}

export interface CommodityResponse {
    error?: string;
    data?: CommodityPrices;
}

export interface LocationResponse {
    error?: string;
    data?: LocationPrices;
}

export interface ExtendedLocationResponse {
    error?: string;
    data?: {
        buyPrices: PriceEntry[];
        sellPrices: PriceEntry[];
        code: string;
        name: string;
        type: string;
        min: number;
        max: number;
        avg: number;
        median: number;
        locations: LocationPrice[];
        commodity: string;
    };
}

export function createPriceEntry(
    name: string,
    system: string,
    type?: string,
    orbit?: string,
    price?: PriceInfo,
    inventory?: LocationInventory
): LocationPrice {
    return {
        name,
        system,
        type,
        orbit,
        price: price || {
            current: 0,
            avg: 0,
            min: 0,
            max: 0
        },
        inventory
    };
}
