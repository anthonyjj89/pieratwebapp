export interface TradeCommodity {
  name: string;
  code: string;
  value: string;
  avgPrice: number | null;
  isPriceNA: boolean;
}

export interface PriceEntry {
  commodity: string;
  price: number;
  timestamp: string;
  supply?: number;
  demand?: number;
}

export interface PriceData {
  min: number;
  max: number;
  avg: number;
  median: number;
}

export interface InventoryEntry {
  current: number;
  min: number;
  max: number;
  avg: number;
}

export interface TradeLocation {
  name: string;
  code: string;
  type: 'STATION' | 'CITY' | 'OUTPOST';
  system: string;
  orbit?: string;
  faction?: string;
  price?: PriceData;
  prices: {
    buy: PriceEntry[];
    sell: PriceEntry[];
  };
  inventory?: InventoryEntry;
  containerSizes?: number[];
  isNoQuestions?: boolean;
}

export interface CommodityPrice {
  name: string;
  code: string;
  type: string;
  prices: {
    buy: PriceData;
    sell: PriceData;
  };
  updatedAt: string;
}

export interface TradeData {
  bestLocation: TradeLocation;
  averagePrice: number | null;
  allLocations: TradeLocation[];
  boxInfo: {
    unitsPerBox: number;
  };
}

export interface TradeScraperConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  retryDelay: number;
}

export interface TradeRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  timeout?: number;
  data?: unknown;
}

export interface TradeScrapeOptions {
  retries?: number;
  timeout?: number;
  cacheTime?: number;
}

export interface TradeErrorResponse {
  code: string;
  message: string;
  details: TradeErrorDetails;
}

export interface TradeErrorDetails {
  error: string;
}

export class TradeError extends Error {
  constructor(
    message: string,
    public commodity?: string,
    public statusCode?: number,
    public code?: string | TradeErrorDetails,
    public details?: string | TradeErrorDetails
  ) {
    super(message);
    this.name = 'TradeError';
  }

  static fromResponse(response: TradeErrorResponse): TradeError {
    return new TradeError(
      response.message,
      undefined,
      undefined,
      response.code,
      response.details
    );
  }
}
