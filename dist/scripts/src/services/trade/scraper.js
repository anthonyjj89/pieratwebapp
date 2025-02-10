"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradeScraper = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const types_1 = require("./types");
class TradeScraper {
    constructor() {
        this.baseUrl = 'https://uexcorp.space';
        this.cache = new Map();
    }
    async makeRequest(url) {
        try {
            const response = await (0, axios_1.default)({
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
        }
        catch (error) {
            console.error('Trade request error:', error);
            throw types_1.TradeError.fromResponse(error);
        }
    }
    extractNumber(text) {
        const match = text.match(/[\d,.]+/);
        if (match) {
            return parseFloat(match[0].replace(/,/g, ''));
        }
        return 0;
    }
    parseSCUBoxSizes(text) {
        // Convert "1-16" or "1-32" format to array of power-of-2 numbers
        if (!text)
            return [];
        const match = text.match(/(\d+)-(\d+)/);
        if (match) {
            const end = parseInt(match[2]);
            const sizes = [];
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
    async getCommodities() {
        try {
            const html = await this.makeRequest(`${this.baseUrl}/commodities`);
            const $ = cheerio.load(html);
            // Get all commodity codes from the grid
            const commodities = $('.commodities-bar .label-commodity')
                .map((_, el) => {
                const code = $(el).attr('slug');
                const name = $(el).text().trim();
                if (typeof code === 'string') {
                    return { code, name };
                }
                return null;
            })
                .get()
                .filter((commodity) => commodity !== null);
            return commodities;
        }
        catch (error) {
            console.error('Error fetching commodities:', error);
            throw types_1.TradeError.fromResponse(error);
        }
    }
    async getCommodityPrices(code) {
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
            const locations = [];
            let bestSellLocation;
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
                    const location = {
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
            const commodityPrice = {
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
        }
        catch (error) {
            if (error instanceof types_1.TradeError && error.statusCode === 404) {
                throw new types_1.TradeError(types_1.TradeError.COMMODITY_NOT_FOUND, 404);
            }
            throw error;
        }
    }
}
exports.TradeScraper = TradeScraper;
// Export singleton instance
const scraper = new TradeScraper();
exports.default = scraper;
