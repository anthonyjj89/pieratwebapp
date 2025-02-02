import axios from 'axios';
import * as cheerio from 'cheerio';
import { TradeCommodity, TradeLocation, PriceData, createPriceEntry, TradeError, ErrorResponse, LocationPrice } from './types';

export class TradeScraper {
    private baseUrl: string;
    private headers: Record<string, string>;

    constructor() {
        this.baseUrl = 'https://uexcorp.space';
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        };
    }

    private async makeRequest(url: string): Promise<string> {
        try {
            const response = await axios({
                url,
                headers: this.headers,
                timeout: 10000
            });
            return response.data;
        } catch (error) {
            throw TradeError.fromResponse(error as ErrorResponse);
        }
    }

    private normalizeUrl(url: string | undefined): string | null {
        if (!url) return null;
        return url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    }

    public async getCommodities(): Promise<TradeCommodity[]> {
        try {
            const html = await this.makeRequest(`${this.baseUrl}/commodities`);
            const $ = cheerio.load(html);
            const commodities: TradeCommodity[] = [];

            $('.commodity-item').each((_, element) => {
                const $el = $(element);
                const code = $el.find('.code').text().trim();
                const name = $el.find('.name').text().trim();
                const type = $el.find('.type').text().trim();
                const description = $el.find('.description').text().trim();
                const value = $el.find('.value').text().trim();
                const avgPrice = parseFloat($el.find('.avg-price').text().trim()) || undefined;

                commodities.push({
                    code,
                    name,
                    type,
                    description,
                    value,
                    avgPrice
                });
            });

            return commodities;

        } catch (error) {
            console.error('Error fetching commodities:', error);
            throw TradeError.fromResponse(error as ErrorResponse);
        }
    }

    public async getCommodityPrices(code: string): Promise<PriceData> {
        try {
            const html = await this.makeRequest(`${this.baseUrl}/commodity/${code}`);
            const $ = cheerio.load(html);

            const name = $('.commodity-name').text().trim();

            const buyPrices = $('.buy-prices .price-entry').map((_, el) => {
                const $el = $(el);
                return createPriceEntry({
                    commodity: code,
                    price: parseFloat($el.find('.price').text().trim()),
                    quantity: parseInt($el.find('.quantity').text().trim(), 10),
                    supply: $el.find('.supply').text().trim()
                });
            }).get();

            const sellPrices = $('.sell-prices .price-entry').map((_, el) => {
                const $el = $(el);
                return createPriceEntry({
                    commodity: code,
                    price: parseFloat($el.find('.price').text().trim()),
                    quantity: parseInt($el.find('.quantity').text().trim(), 10),
                    demand: $el.find('.demand').text().trim()
                });
            }).get();

            const locations = $('.location-item').map((_, el) => {
                const $el = $(el);
                const name = $el.find('.name').text().trim();
                const system = $el.find('.system').text().trim();
                const orbit = $el.find('.orbit').text().trim() || undefined;
                const type = $el.find('.type').text().trim() || undefined;

                const price = {
                    current: parseFloat($el.find('.current-price').text().trim()),
                    avg: parseFloat($el.find('.avg-price').text().trim()),
                    min: parseFloat($el.find('.min-price').text().trim()),
                    max: parseFloat($el.find('.max-price').text().trim())
                };

                const inventory = {
                    current: parseInt($el.find('.current-inventory').text().trim(), 10),
                    max: parseInt($el.find('.max-inventory').text().trim(), 10),
                    avg: parseFloat($el.find('.avg-inventory').text().trim())
                };

                const containerSizes = $el.find('.container-sizes').text().trim().split(',').map(s => s.trim());
                const isNoQuestions = $el.hasClass('no-questions');

                return {
                    name,
                    system,
                    orbit,
                    type,
                    price,
                    prices: {
                        buy: buyPrices.filter(p => p.price > 0),
                        sell: sellPrices.filter(p => p.price > 0)
                    },
                    inventory,
                    containerSizes,
                    isNoQuestions
                } as LocationPrice;
            }).get();

            const prices = locations.map(l => l.price?.current || 0).filter(p => p > 0);
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
            const median = prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)];

            return {
                code,
                name,
                buy: buyPrices,
                sell: sellPrices,
                locations,
                min,
                max,
                avg,
                median
            };

        } catch (error) {
            console.error('Error fetching commodity prices:', error);
            throw TradeError.fromResponse(error as ErrorResponse);
        }
    }

    public async getLocations(): Promise<TradeLocation[]> {
        try {
            const html = await this.makeRequest(`${this.baseUrl}/locations`);
            const $ = cheerio.load(html);
            const locations: TradeLocation[] = [];

            $('.location-item').each((_, element) => {
                const $el = $(element);
                const code = $el.find('.code').text().trim();
                const name = $el.find('.name').text().trim();
                const type = $el.find('.type').text().trim();
                const system = $el.find('.system').text().trim();
                const description = $el.find('.description').text().trim();
                const orbit = $el.find('.orbit').text().trim() || undefined;

                locations.push({
                    code,
                    name,
                    type,
                    system,
                    description,
                    orbit
                });
            });

            return locations;

        } catch (error) {
            console.error('Error fetching locations:', error);
            throw TradeError.fromResponse(error as ErrorResponse);
        }
    }
}

// Create and export a singleton instance
const scraper = new TradeScraper();
export default scraper;
