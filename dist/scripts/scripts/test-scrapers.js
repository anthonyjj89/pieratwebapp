"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const scraper_1 = __importDefault(require("../src/services/rsi/scraper"));
const scraper_2 = __importDefault(require("../src/services/trade/scraper"));
async function main() {
    try {
        // Test RSI player scraping
        console.log('=== Testing RSI Player Scraping ===');
        const profile = await scraper_1.default.getProfileData('yanz89');
        console.log('Player Profile:', JSON.stringify(profile, null, 2).replace(/"/g, ''));
        // Test trade commodities scraping
        console.log('\n=== Testing Trade Commodities Scraping ===');
        const commodities = await scraper_2.default.getCommodities();
        console.log('Total Commodities:', commodities.length);
        console.log('First 5 Commodities:', JSON.stringify(commodities.slice(0, 5), null, 2).replace(/"/g, ''));
        // Test commodity price scraping
        console.log('\n=== Testing Commodity Price Scraping ===');
        console.log('Attempting to fetch prices for: agricultural-supplies');
        const prices = await scraper_2.default.getCommodityPrices('agricultural-supplies');
        console.log('Prices for agricultural-supplies:', JSON.stringify(prices, null, 2).replace(/"/g, ''));
    }
    catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}
main();
