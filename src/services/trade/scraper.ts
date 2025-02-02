import axios from 'axios';
import * as cheerio from 'cheerio';
import { TradeError, LocationPrice, TradeLocation, ErrorResponse, PriceInfo, CommodityPrices } from './types';

export class TradeScraper {
    private baseUrl: string;
    private headers: Record<string, string>;

    constructor() {
        this.baseUrl = 'https://sc-trade.tools';
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

    private normalizeUrl(url: string | undefined): string | undefined {
        if (!url) return undefined;
        return url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    }

    public async getCommodities(): Promise<string[]> {
        try {
            const html = await this.makeRequest(`${this.baseUrl}/commodities`);
            const $ = cheerio.load(html);

            return $('.commodity')
                .map((_, el) => $(el).attr('data-code'))
                .get()
                .filter((code): code is string => code !== undefined);

        } catch (error) {
            console.error('Error fetching commodities:', error);
            throw TradeError.fromResponse(error as ErrorResponse);
        }
    }

    public async getCommodityPrices(code: string): Promise<CommodityPrices> {
        try {
            const locations = await this.getCommodityData(code);

            return {
                commodity: code,
                locations: locations.map(loc => ({
                    name: loc.name,
                    system: loc.system,
                    buy: loc.price.current,
                    sell: loc.price.current
                }))
            };

        } catch (error) {
            console.error('Error fetching commodity prices:', error);
            throw TradeError.fromResponse(error as ErrorResponse);
        }
    }

    public async getCommodityData(code: string): Promise<LocationPrice[]> {
        try {
            const html = await this.makeRequest(`${this.baseUrl}/commodities/${code}`);
            const $ = cheerio.load(html);

            // Parse commodity data
            const locations: LocationPrice[] = $('.location').map((_, el) => {
                const $el = $(el);
                const price: PriceInfo = {
                    current: parseFloat($el.find('.price-current').text()) || 0,
                    avg: parseFloat($el.find('.price-avg').text()) || 0,
                    min: parseFloat($el.find('.price-min').text()) || 0,
                    max: parseFloat($el.find('.price-max').text()) || 0
                };

                return {
                    name: $el.find('.name').text().trim(),
                    system: $el.find('.system').text().trim(),
                    type: $el.find('.type').text().trim(),
                    orbit: $el.find('.orbit').text().trim() || undefined,
                    price,
                    inventory: {
                        current: parseInt($el.find('.inventory-current').text()) || 0,
                        max: parseInt($el.find('.inventory-max').text()) || 0
                    }
                };
            }).get();

            return locations;

        } catch (error) {
            console.error('Error fetching commodity data:', error);
            throw TradeError.fromResponse(error as ErrorResponse);
        }
    }

    public async getLocations(): Promise<string[]> {
        try {
            const html = await this.makeRequest(`${this.baseUrl}/locations`);
            const $ = cheerio.load(html);

            return $('.location')
                .map((_, el) => $(el).attr('data-code'))
                .get()
                .filter((code): code is string => code !== undefined);

        } catch (error) {
            console.error('Error fetching locations:', error);
            throw TradeError.fromResponse(error as ErrorResponse);
        }
    }

    public async getLocationData(code: string): Promise<TradeLocation> {
        try {
            const html = await this.makeRequest(`${this.baseUrl}/locations/${code}`);
            const $ = cheerio.load(html);

            // Parse location data
            const location: TradeLocation = {
                code,
                name: $('.location-name').text().trim(),
                system: $('.location-system').text().trim(),
                type: $('.location-type').text().trim(),
                description: $('.location-description').text().trim(),
                orbit: $('.location-orbit').text().trim() || undefined,
                commodities: $('.commodity').map((_, el) => {
                    const $el = $(el);
                    return {
                        code: $el.attr('data-code') || '',
                        name: $el.find('.name').text().trim(),
                        price: parseFloat($el.find('.price').text()) || 0,
                        inventory: {
                            current: parseInt($el.find('.inventory-current').text()) || 0,
                            max: parseInt($el.find('.inventory-max').text()) || 0
                        }
                    };
                }).get()
            };

            return location;

        } catch (error) {
            console.error('Error fetching location data:', error);
            throw TradeError.fromResponse(error as ErrorResponse);
        }
    }

    public async getBestTrades(): Promise<LocationPrice[]> {
        try {
            const html = await this.makeRequest(`${this.baseUrl}/best-trades`);
            const $ = cheerio.load(html);

            // Parse trade data
            const trades: LocationPrice[] = $('.trade').map((_, el) => {
                const $el = $(el);
                const price: PriceInfo = {
                    current: parseFloat($el.find('.price-current').text()) || 0,
                    avg: parseFloat($el.find('.price-avg').text()) || 0,
                    min: parseFloat($el.find('.price-min').text()) || 0,
                    max: parseFloat($el.find('.price-max').text()) || 0
                };

                return {
                    name: $el.find('.name').text().trim(),
                    system: $el.find('.system').text().trim(),
                    type: $el.find('.type').text().trim(),
                    price,
                    inventory: {
                        current: parseInt($el.find('.inventory-current').text()) || 0,
                        max: parseInt($el.find('.inventory-max').text()) || 0
                    }
                };
            }).get();

            // Sort by profit margin
            return trades.sort((a, b) => {
                const profitA = a.price.current - a.price.min;
                const profitB = b.price.current - b.price.min;
                return profitB - profitA;
            });

        } catch (error) {
            console.error('Error fetching best trades:', error);
            throw TradeError.fromResponse(error as ErrorResponse);
        }
    }
}

// Create and export a singleton instance
const scraper = new TradeScraper();
export default scraper;
