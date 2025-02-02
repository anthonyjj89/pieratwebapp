import rsiScraper from '../src/services/rsi/scraper';
import tradeScraper from '../src/services/trade/scraper';
import { TradeError } from '../src/services/trade/types';

async function testRSIScraper() {
    try {
        console.log('Testing RSI Scraper...\n');

        // Test profile lookup
        console.log('Looking up profile...');
        const profile = await rsiScraper.getProfileData('AnthonyJJ89');
        console.log('Profile:', JSON.stringify(profile, null, 2));
        console.log('\n');

    } catch (error) {
        console.error('RSI Scraper Error:', error);
    }
}

async function testTradeScraper() {
    try {
        console.log('Testing Trade Scraper...\n');

        // Test commodities list
        console.log('Fetching commodities...');
        const commodities = await tradeScraper.getCommodities();
        console.log('Found', commodities.length, 'commodities');
        console.log('Sample:', commodities.slice(0, 5));
        console.log('\n');

        // Test commodity data
        if (commodities.length > 0) {
            const code = commodities[0];
            console.log(`Fetching data for commodity: ${code}`);
            const data = await tradeScraper.getCommodityData(code);
            console.log('Data:', JSON.stringify(data, null, 2));
            console.log('\n');
        }

        // Test locations list
        console.log('Fetching locations...');
        const locations = await tradeScraper.getLocations();
        console.log('Found', locations.length, 'locations');
        console.log('Sample:', locations.slice(0, 5));
        console.log('\n');

        // Test location data
        if (locations.length > 0) {
            const code = locations[0];
            console.log(`Fetching data for location: ${code}`);
            const data = await tradeScraper.getLocationData(code);
            console.log('Data:', JSON.stringify(data, null, 2));
            console.log('\n');
        }

        // Test best trades
        console.log('Fetching best trades...');
        const trades = await tradeScraper.getBestTrades();
        console.log('Found', trades.length, 'trades');
        console.log('Sample:', JSON.stringify(trades.slice(0, 3), null, 2));

    } catch (error) {
        if (error instanceof TradeError) {
            console.error('Trade Scraper Error:', error.message, error.statusCode);
        } else {
            console.error('Trade Scraper Error:', error);
        }
    }
}

// Run tests
async function main() {
    await testRSIScraper();
    console.log('\n----------------------------------------\n');
    await testTradeScraper();
}

main().catch(console.error);
