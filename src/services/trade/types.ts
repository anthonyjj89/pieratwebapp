export interface CommodityPrice {
  name: string;
  code: string;
  type: string;
  prices: {
    sell: {
      min: number;
      max: number;
      avg: number;
      median: number;
    };
    buy: {
      min: number;
      max: number;
      avg: number;
      median: number;
    };
  };
  updatedAt: string;
}

export interface TradeLocation {
  name: string;
  code: string;
  type: 'STATION' | 'CITY' | 'OUTPOST';
  system: string;
  prices: {
    buy: PriceEntry[];
    sell: PriceEntry[];
  };
}

export interface PriceEntry {
  commodity: string;
  price: number;
  timestamp: string;
  supply?: number;
  demand?: number;
}

export interface TradeError {
  code: string;
  message: string;
  details: Record<string, unknown>;
}
