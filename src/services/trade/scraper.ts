import axios from 'axios';
import * as cheerio from 'cheerio';
import { TradeError, CommodityPrice, LocationPrice, ErrorResponse } from './types';

export class TradeScraper {
  private baseUrl: string;
  private cache: Map<string, { data: CommodityPrice; timestamp: number }>;

  constructor() {
    this.baseUrl = 'https://uexcorp.space';
    this.cache = new Map();
  }

  private async makeRequest(url: string): Promise<string> {
    try {
      const response = await axios({
        url,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Connection': 'keep-alive',
          'Cache-Control': 'max-age=0'
        },
        timeout: 10000,
        maxRedirects: 5
      });

      return response.data;
    } catch (error) {
      console.error('Trade request error:', error);
      throw TradeError.fromResponse(error as ErrorResponse);
    }
  }

  private extractNumber(text: string): number {
    const match = text.match(/[\d,.]+/);
    if (match) {
      return parseFloat(match[0].replace(/,/g, ''));
    }
    return 0;
  }

  private parseSCUBoxSizes(text: string): number[] {
    // Convert "1-16" or "1-32" format to array of power-of-2 numbers
    if (!text) return [];
    
    const match = text.match(/(\d+)-(\d+)/);
    if (match) {
      const end = parseInt(match[2]);
      const sizes: number[] = [];
      
      // Generate powers of 2 up to the end number
      let size = 1;
      while (size <= end) {
        sizes.push(size);
        size *= 2;
      }
      
      return sizes;
    }
    
    return [];
  }

  public async getCommodities(): Promise<string[]> {
    try {
      const html = await this.makeRequest(`${this.baseUrl}/commodities`);
      const $ = cheerio.load(html);

      // Get all commodity codes from the grid
      const commodities = $('.commodities-bar .label-commodity')
        .map((_, el) => $(el).attr('slug'))
        .get()
        .filter((code: unknown): code is string => typeof code === 'string');

      return commodities;
    } catch (error) {
      console.error('Error fetching commodities:', error);
      throw TradeError.fromResponse(error as ErrorResponse);
    }
  }

  public async getCommodityPrices(code: string): Promise<CommodityPrice> {
    // Check cache first
    const cachedCommodity = this.cache.get(code.toLowerCase());
    const cacheTime = 24 * 60 * 60 * 1000; // 24 hours
    
    if (cachedCommodity && (Date.now() - cachedCommodity.timestamp) < cacheTime) {
      return cachedCommodity.data;
    }

    try {
      // Get the sell tab directly
      const html = await this.makeRequest(`${this.baseUrl}/commodities/info/name/${encodeURIComponent(code)}/tab/locations_buying/`);
      const $ = cheerio.load(html);

      // Get commodity name from title
      const commodity = $('h2.text-bold.text-giant').first().text().trim();

      // Parse all sell locations and prices
      const locations: LocationPrice[] = [];
      let bestSellLocation: LocationPrice | undefined;
      let bestSellPrice = 0;

      $('.search-row.row-location').each((_, row) => {
        const $row = $(row);
        
        // Get current price from the "Last" column
        const currentPrice = this.extractNumber($row.find('td[data-value]').eq(10).text());
        
        if (currentPrice > 0) {
          // Get SCU box sizes from the CS column
          const scuText = $row.find('td[data-value^="1-"]').first().attr('data-value');
          const scuBoxSizes = this.parseSCUBoxSizes(scuText || '');

          // Get faction from the Fact column
          const faction = $row.find('td').eq(3).text().trim();

          const location: LocationPrice = {
            name: $row.find('td').first().find('a').first().text().trim(),
            system: $row.find('td').eq(2).attr('title') || '',
            type: 'Trading Post',
            orbit: $row.find('td').eq(1).attr('title') || '',
            faction,
            scuBoxSizes,
            price: {
              current: currentPrice,
              avg: this.extractNumber($row.find('td[data-value]').eq(12).text()),
              min: this.extractNumber($row.find('td[data-value]').eq(13).text()),
              max: this.extractNumber($row.find('td[data-value]').eq(14).text())
            },
            inventory: {
              current: this.extractNumber($row.find('td[data-value]').eq(4).text()),
              max: this.extractNumber($row.find('td[data-value]').eq(8).text())
            }
          };

          locations.push(location);

          // Update best sell location if this price is higher
          if (currentPrice > bestSellPrice) {
            bestSellPrice = currentPrice;
            bestSellLocation = location;
          }
        }
      });

      // Calculate average sell price
      const averagePrice = locations.length > 0 ? 
        locations.reduce((sum, loc) => sum + loc.price.current, 0) / locations.length :
        0;

      const commodityPrice: CommodityPrice = {
        commodity,
        code,
        bestSellLocation: bestSellLocation ? {
          name: bestSellLocation.name,
          system: bestSellLocation.system,
          price: bestSellLocation.price.current
        } : undefined,
        averagePrice,
        pricePerSCU: 0, // Not used
        locations,
        lastUpdated: new Date()
      };

      // Cache the result
      this.cache.set(code.toLowerCase(), {
        data: commodityPrice,
        timestamp: Date.now()
      });

      return commodityPrice;

    } catch (error) {
      if (error instanceof TradeError && error.statusCode === 404) {
        throw new TradeError(TradeError.COMMODITY_NOT_FOUND, 404);
      }
      throw error;
    }
  }
}

// Export singleton instance
const scraper = new TradeScraper();
export default scraper;
