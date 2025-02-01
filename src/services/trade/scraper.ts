import axios from 'axios';
import * as cheerio from 'cheerio';
import type { TradeCommodity, TradeLocation, PriceData, ScrapeOptions, ErrorResponse } from './types';
import { TradeError, createPriceEntry } from './types';

export class TradeScraper {
    private baseUrl: string;
    private headers: Record<string, string>;
    private options: Required<ScrapeOptions>;

    constructor(options: ScrapeOptions = {}) {
        this.baseUrl = 'https://uexcorp.space';
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        };
        this.options = {
            timeout: options.timeout || 10000,
            retries: options.retries || 3,
            retryDelay: options.retryDelay || 1000,
            cacheTime: options.cacheTime || 300000 // 5 minutes default
        };
    }

    private async makeRequest(url: string): Promise<string> {
        let retries = this.options.retries;
        let lastError: ErrorResponse = { message: 'Unknown error' };

        while (retries > 0) {
            try {
                const response = await axios({
                    url,
                    headers: this.headers,
                    timeout: this.options.timeout
                });
                return response.data;
            } catch (error) {
                lastError = error as ErrorResponse;
                retries--;
                if (retries === 0) break;
                console.log(`Request failed, retrying... (${retries} attempts left)`);
                await new Promise(resolve => setTimeout(resolve, this.options.retryDelay));
            }
        }

        throw TradeError.fromResponse(lastError);
    }

    public async getCommodities(): Promise<TradeCommodity[]> {
        try {
            const html = await this.makeRequest(`${this.baseUrl}/commodities`);
            const $ = cheerio.load(html);
            
            const commodities: TradeCommodity[] = [];
            $('.label-commodity').each((_, el) => {
                const $el = $(el);
                const name = $el.find('span').first().text().trim();
                const code = name.split(' ')[0];
                const priceText = $el.find('span').last().text().trim();
                const isNA = priceText.includes('N/A');
                const price = isNA ? null : parseInt(priceText.match(/\d+/)?.[0] || '0');
                const slug = $el.attr('slug') || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

                commodities.push({
                    name,
                    code,
                    value: slug,
                    avgPrice: price,
                    isPriceNA: isNA
                });
            });

            return commodities;
        } catch (error) {
            console.error('Error fetching commodities:', error);
            throw TradeError.fromResponse(error as ErrorResponse);
        }
    }

    public async getCommodityPrices(code: string): Promise<PriceData> {
        return this.getPrices(code);
    }

    public async getLocationPrices(code: string): Promise<PriceData> {
        try {
            const html = await this.makeRequest(`${this.baseUrl}/commodities/locations/name/${code}/`);
            return this.parsePriceData(html);
        } catch (error) {
            console.error('Error fetching location prices:', error);
            throw TradeError.fromResponse(error as ErrorResponse);
        }
    }

    private async getPrices(commodity: string): Promise<PriceData> {
        try {
            const html = await this.makeRequest(`${this.baseUrl}/commodities/info/name/${commodity}/tab/locations_buying/`);
            return this.parsePriceData(html);
        } catch (error) {
            console.error('Error fetching prices:', error);
            throw TradeError.fromResponse(error as ErrorResponse);
        }
    }

    private parsePriceData(html: string): PriceData {
        const $ = cheerio.load(html);
        const locations: TradeLocation[] = [];

        $('#table-sell tr.row-location').each((_, row) => {
            const $row = $(row);
            const name = $row.find('td:first-child a').text().trim();
            const orbit = $row.find('td:nth-child(2)').text().trim();
            const system = $row.find('td:nth-child(3)').text().trim();
            const faction = $row.find('td:nth-child(4)').text().trim();
            const type = 'STATION'; // Default type, could be parsed from data if available

            // Get price data
            const price = parseInt($row.find('td[data-value]').eq(10).attr('data-value') || '0');
            const minPrice = parseInt($row.find('td[data-value]').eq(13).attr('data-value') || '0');
            const maxPrice = parseInt($row.find('td[data-value]').eq(14).attr('data-value') || '0');
            const avgPrice = parseInt($row.find('td[data-value]').eq(12).attr('data-value') || '0');

            // Get inventory data
            const inventory = parseInt($row.find('td[title*="SCU"]').first().attr('data-value') || '0');
            const minInventory = parseInt($row.find('td[data-value]').eq(7).attr('data-value') || '0');
            const maxInventory = parseInt($row.find('td[data-value]').eq(8).attr('data-value') || '0');
            const avgInventory = parseInt($row.find('td[data-value]').eq(6).attr('data-value') || '0');

            // Get container sizes
            const containerText = $row.find('td[title*="SCU"]').last().attr('title') || '';
            const containerSizes = containerText.match(/\d+/g)?.map(Number) || [];

            // Check if it's a "No Questions Asked" terminal
            const isNoQuestions = $row.find('i.fa-low-vision').length > 0;

            // Create buy/sell price entries
            const buyPrices = [createPriceEntry({
                price,
                timestamp: new Date().toISOString(),
                supply: inventory
            })];

            const sellPrices = [createPriceEntry({
                price,
                timestamp: new Date().toISOString(),
                demand: inventory
            })];

            locations.push({
                name,
                orbit,
                system,
                faction,
                code: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                type,
                price: { current: price, min: minPrice, max: maxPrice, avg: avgPrice },
                inventory: { current: inventory, min: minInventory, max: maxInventory, avg: avgInventory },
                containerSizes,
                isNoQuestions,
                prices: {
                    buy: buyPrices,
                    sell: sellPrices
                }
            });
        });

        // Calculate overall stats
        const prices = locations.map(l => l.price.current).filter(p => p > 0);
        const min = Math.min(...(prices.length ? prices : [0]));
        const max = Math.max(...(prices.length ? prices : [0]));
        const avg = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
        const median = prices.length ? prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)] : 0;

        return {
            locations,
            prices: {},
            min,
            max,
            avg,
            median
        };
    }
}

const scraper = new TradeScraper();
export { TradeScraper };
export default scraper;
