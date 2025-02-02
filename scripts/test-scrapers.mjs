import rsiScraper from '../src/services/rsi/scraper.js';
import tradeScraper from '../src/services/trade/scraper.js';

async function main() {
  try {
    // Test RSI player scraping
    console.log('=== Testing RSI Player Scraping ===');
    const profile = await rsiScraper.getProfileData('yanz89');
    console.log('Player Profile:', JSON.stringify(profile, null, 2).replace(/"/g, ''));

    // Test trade commodities scraping
    console.log('\n=== Testing Trade Commodities Scraping ===');
    const commodities = await tradeScraper.getCommodities();
    console.log('Total Commodities:', commodities.length);
    console.log('First 5 Commodities:', JSON.stringify(commodities.slice(0, 5), null, 2).replace(/"/g, ''));

    // Test commodity price scraping
    console.log('\n=== Testing Commodity Price Scraping ===');
    console.log('Attempting to fetch prices for: agricultural-supplies');
    const prices = await tradeScraper.getCommodityPrices('agricultural-supplies');
    console.log('Prices for agricultural-supplies:', JSON.stringify(prices, null, 2).replace(/"/g, ''));

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
