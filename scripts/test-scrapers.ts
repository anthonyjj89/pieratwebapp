import { RSIScraper } from '../src/services/rsi/scraper';
import { TradeScraper } from '../src/services/trade/scraper';

async function main() {
  try {
    // Test RSI Scraper
    console.log('\nTesting RSI Scraper with handle "yanz89"...');
    const profile = await RSIScraper.getProfileData('yanz89');
    console.log('\nPlayer Profile:');
    console.log('-------------');
    console.log(`Handle: ${profile.handle}`);
    console.log(`Enlisted: ${profile.enlisted}`);
    console.log(`Location: ${profile.location}`);
    
    if (profile.mainOrg && !profile.mainOrg.isRedacted) {
      console.log('\nMain Organization:');
      console.log('----------------');
      console.log(`Name: ${profile.mainOrg.name}`);
      console.log(`Rank: ${profile.mainOrg.rank}`);
      console.log(`SID: ${profile.mainOrg.sid}`);
    }

    if (profile.affiliatedOrgs.length > 0) {
      console.log('\nAffiliated Organizations:');
      console.log('----------------------');
      profile.affiliatedOrgs.forEach(org => {
        if (!org.isRedacted) {
          console.log(`- ${org.name} (${org.rank})`);
        }
      });
    }

    // Test Trade Scraper
    console.log('\nTesting Trade Scraper with commodity "gold"...');
    const commodity = await TradeScraper.getCommodityPrices('gold');
    console.log('\nCommodity Prices:');
    console.log('----------------');
    console.log(`Name: ${commodity.name}`);
    console.log('\nBuy Prices:');
    console.log(`Min: ${commodity.prices.buy.min}`);
    console.log(`Max: ${commodity.prices.buy.max}`);
    console.log(`Avg: ${commodity.prices.buy.avg}`);
    console.log('\nSell Prices:');
    console.log(`Min: ${commodity.prices.sell.min}`);
    console.log(`Max: ${commodity.prices.sell.max}`);
    console.log(`Avg: ${commodity.prices.sell.avg}`);

    // Get best location to sell
    const locations = await TradeScraper.getLocationPrices('gold');
    if (locations.prices.sell.length > 0) {
      const bestSellLocation = locations.prices.sell.reduce((best, current) => 
        current.price > best.price ? current : best
      );
      console.log('\nBest Place to Sell:');
      console.log('------------------');
      console.log(`Location: ${locations.name}`);
      console.log(`System: ${locations.system}`);
      console.log(`Price: ${bestSellLocation.price}`);
    }

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
  }
}

main();
