import axios from 'axios';
import * as cheerio from 'cheerio';
import type { CommodityPrice, TradeLocation, PriceEntry, TradeError } from './types';

const BASE_URL = 'https://uexcorp.space';
const DEFAULT_TIMEOUT = 10000;

export class TradeScraper {
  private static cache = new Map<string, { data: CommodityPrice | TradeLocation; timestamp: number }>();
  private static cacheTime = 3600 * 1000; // 1 hour in milliseconds

  private static async fetchWithTimeout(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        timeout: DEFAULT_TIMEOUT,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static getCacheKey(type: string, id: string): string {
    return `${type}:${id}`;
  }

  private static getFromCache<T extends CommodityPrice | TradeLocation>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.cacheTime) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  private static setCache<T extends CommodityPrice | TradeLocation>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  static async getCommodityPrices(code: string): Promise<CommodityPrice> {
    const cacheKey = this.getCacheKey('commodity', code);
    const cached = this.getFromCache<CommodityPrice>(cacheKey);
    if (cached) return cached;

    try {
      const html = await this.fetchWithTimeout(`${BASE_URL}/trade/${code}`);
      const $ = cheerio.load(html);

      const commodity: CommodityPrice = {
        name: $('.commodity-name').text().trim(),
        code,
        type: $('.commodity-type').text().trim(),
        prices: {
          sell: {
            min: parseFloat($('.sell-price .min').text().trim()),
            max: parseFloat($('.sell-price .max').text().trim()),
            avg: parseFloat($('.sell-price .avg').text().trim()),
            median: parseFloat($('.sell-price .median').text().trim())
          },
          buy: {
            min: parseFloat($('.buy-price .min').text().trim()),
            max: parseFloat($('.buy-price .max').text().trim()),
            avg: parseFloat($('.buy-price .avg').text().trim()),
            median: parseFloat($('.buy-price .median').text().trim())
          }
        },
        updatedAt: new Date().toISOString()
      };

      this.setCache(cacheKey, commodity);
      return commodity;

    } catch (error) {
      const tradeError: TradeError = {
        code: 'COMMODITY_FETCH_ERROR',
        message: `Failed to fetch commodity ${code}`,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
      throw tradeError;
    }
  }

  static async getLocationPrices(code: string): Promise<TradeLocation> {
    const cacheKey = this.getCacheKey('location', code);
    const cached = this.getFromCache<TradeLocation>(cacheKey);
    if (cached) return cached;

    try {
      const html = await this.fetchWithTimeout(`${BASE_URL}/location/${code}`);
      const $ = cheerio.load(html);

      const location: TradeLocation = {
        name: $('.location-name').text().trim(),
        code,
        type: $('.location-type').text().trim() as 'STATION' | 'CITY' | 'OUTPOST',
        system: $('.system-name').text().trim(),
        prices: {
          buy: [],
          sell: []
        }
      };

      // Parse buy prices
      $('.buy-prices tr').each((_, elem) => {
        const entry: PriceEntry = {
          commodity: $(elem).find('.commodity-name').text().trim(),
          price: parseFloat($(elem).find('.price').text().trim()),
          timestamp: new Date().toISOString(),
          supply: parseInt($(elem).find('.supply').text().trim(), 10)
        };
        location.prices.buy.push(entry);
      });

      // Parse sell prices
      $('.sell-prices tr').each((_, elem) => {
        const entry: PriceEntry = {
          commodity: $(elem).find('.commodity-name').text().trim(),
          price: parseFloat($(elem).find('.price').text().trim()),
          timestamp: new Date().toISOString(),
          demand: parseInt($(elem).find('.demand').text().trim(), 10)
        };
        location.prices.sell.push(entry);
      });

      this.setCache(cacheKey, location);
      return location;

    } catch (error) {
      const tradeError: TradeError = {
        code: 'LOCATION_FETCH_ERROR',
        message: `Failed to fetch location ${code}`,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
      throw tradeError;
    }
  }
}
