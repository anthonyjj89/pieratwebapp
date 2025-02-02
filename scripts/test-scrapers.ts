import { RSIError } from '../src/services/rsi/types';
import { TradeError } from '../src/services/trade/types';
import rsiScraper from '../src/services/rsi/scraper';
import tradeScraper from '../src/services/trade/scraper';

async function testRSIScraper() {
    try {
        console.log('Testing RSI Profile Scraper...\n');

        // Test valid profile
        console.log('Testing valid profile...');
        const validProfile = await rsiScraper.getProfileData('Nighthawk5');
        console.log('Profile found:', validProfile.handle);
        console.log('Enlisted:', validProfile.enlisted);
        console.log('Location:', validProfile.location);
        if (validProfile.mainOrg) {
            console.log('Main Org:', validProfile.mainOrg.name);
            console.log('Rank:', validProfile.mainOrg.rank);
        }
        console.log('\n');

        // Test invalid profile
        console.log('Testing invalid profile...');
        try {
            await rsiScraper.getProfileData('ThisProfileShouldNotExist12345');
        } catch (error) {
            if (error instanceof RSIError) {
                console.log('Expected error:', error.message);
            }
        }
        console.log('\n');

    } catch (error) {
        console.error('Error testing RSI scraper:', error);
    }
}

async function testTradeScraper() {
    try {
        console.log('Testing Trade Scraper...\n');

        // Test commodities
        console.log('Testing commodities...');
        const commodities = await tradeScraper.getCommodities();
        console.log(`Found ${commodities.length} commodities`);
        console.log('Sample commodity:', commodities[0]);
        console.log('\n');

        // Test commodity prices
        console.log('Testing commodity prices...');
        const prices = await tradeScraper.getCommodityPrices('SLAM');
        console.log('Price data:', {
            locations: prices.locations.length,
            min: prices.min,
            max: prices.max,
            avg: prices.avg,
            median: prices.median
        });
        console.log('\n');

        // Test invalid commodity
        console.log('Testing invalid commodity...');
        try {
            await tradeScraper.getCommodityPrices('INVALID_COMMODITY');
        } catch (error) {
            if (error instanceof TradeError) {
                console.log('Expected error:', error.message);
            }
        }
        console.log('\n');

        // Test locations
        console.log('Testing locations...');
        const locations = await tradeScraper.getLocations();
        console.log(`Found ${locations.length} locations`);
        console.log('Sample location:', locations[0]);
        console.log('\n');

    } catch (error) {
        if (error instanceof TradeError) {
            console.error('Trade error:', error.message);
        } else {
            console.error('Error testing trade scraper:', error);
        }
    }
}

// Run tests
async function runTests() {
    console.log('Starting scraper tests...\n');
    await testRSIScraper();
    await testTradeScraper();
    console.log('Tests complete.');
}

runTests().catch(console.error);
