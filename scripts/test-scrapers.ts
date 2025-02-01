import rsiScraper from '../src/services/rsi/scraper';
import tradeScraper from '../src/services/trade/scraper';
import { RSIProfile } from '../src/services/rsi/types';
import { PriceData } from '../src/services/trade/types';

async function testRSIScraper() {
    try {
        // Test player lookup
        console.log('Testing RSI scraper...');
        const profile = await rsiScraper.getProfileData('Zyloh');
        logProfile(profile);
    } catch (error) {
        console.error('Error testing RSI scraper:', error);
    }
}

async function testTradeScraper() {
    try {
        // Test commodity list
        console.log('\nTesting Trade scraper...');
        console.log('Fetching commodities...');
        const commodities = await tradeScraper.getCommodities();
        console.log(`Found ${commodities.length} commodities`);

        // Test commodity prices
        if (commodities.length > 0) {
            const commodity = commodities[0];
            console.log(`\nFetching prices for ${commodity.name}...`);
            const prices = await tradeScraper.getCommodityPrices(commodity.code);
            logPriceData(prices);
        }

        // Test location prices
        console.log('\nFetching prices for Port Olisar...');
        const locationPrices = await tradeScraper.getLocationPrices('port-olisar');
        logPriceData(locationPrices);

    } catch (error) {
        console.error('Error testing Trade scraper:', error);
    }
}

function logProfile(profile: RSIProfile) {
    console.log('\nProfile Data:');
    console.log('-------------');
    console.log(`Handle: ${profile.handle}`);
    console.log(`Enlisted: ${profile.enlisted}`);
    console.log(`Location: ${profile.location}`);
    console.log(`Avatar URL: ${profile.avatarUrl}`);

    if (profile.mainOrg) {
        console.log('\nMain Organization:');
        console.log('------------------');
        console.log(`Name: ${profile.mainOrg.name}`);
        console.log(`SID: ${profile.mainOrg.sid}`);
        console.log(`Rank: ${profile.mainOrg.rank}`);
        console.log(`Members: ${profile.mainOrg.memberCount}`);
        console.log(`Redacted: ${profile.mainOrg.isRedacted}`);
    }

    if (profile.affiliatedOrgs.length > 0) {
        console.log('\nAffiliated Organizations:');
        console.log('------------------------');
        profile.affiliatedOrgs.forEach((org, i) => {
            console.log(`\n${i + 1}. ${org.name}`);
            console.log(`   SID: ${org.sid}`);
            console.log(`   Rank: ${org.rank}`);
            console.log(`   Members: ${org.memberCount}`);
            console.log(`   Redacted: ${org.isRedacted}`);
        });
    }
}

function logPriceData(data: PriceData) {
    console.log('\nPrice Data:');
    console.log('-----------');
    console.log(`Locations: ${data.locations.length}`);
    console.log(`Min Price: ${data.min} aUEC`);
    console.log(`Max Price: ${data.max} aUEC`);
    console.log(`Avg Price: ${Math.round(data.avg)} aUEC`);
    if (data.median) {
        console.log(`Median Price: ${data.median} aUEC`);
    }

    if (data.locations.length > 0) {
        console.log('\nSample Location:');
        console.log('----------------');
        const location = data.locations[0];
        console.log(`Name: ${location.name}`);
        console.log(`System: ${location.system}`);
        console.log(`Current Price: ${location.price.current} aUEC`);
        console.log(`Current Inventory: ${location.inventory.current} SCU`);
        console.log(`Container Sizes: ${location.containerSizes.join(', ')} SCU`);
        console.log(`No Questions Asked: ${location.isNoQuestions}`);
    }
}

// Run tests
console.log('Starting scraper tests...\n');
Promise.all([
    testRSIScraper(),
    testTradeScraper()
]).then(() => {
    console.log('\nAll tests completed.');
}).catch(console.error);
