import axios from 'axios';
import * as cheerio from 'cheerio';
import { v4 as uuidv4 } from 'uuid';

interface Organization {
  name: string;
  sid: string;
  rank: string;
  logoUrl: string;
  memberCount: number;
  hitHistory: {
    totalHits: number;
    totalValue: number;
  };
}

interface PlayerProfile {
  id: string;
  handle: string;
  displayName: string;
  citizenRecord: string;
  enlisted: string;
  location: string;
  avatarUrl: string;
  mainOrg: Organization;
  affiliatedOrgs: Organization[];
  hitHistory: {
    totalHits: number;
    totalValue: number;
  };
  lastUpdated: Date;
}

class RSIScraper {
  private baseUrl = 'https://robertsspaceindustries.com';

  private async makeRequest(url: string): Promise<string> {
    try {
      const response = await axios({
        url,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        },
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error('RSI request error:', error);
      throw error;
    }
  }

  private cleanText(text: string): string {
    // Remove extra whitespace and normalize
    return text.replace(/\s+/g, ' ').trim();
  }

  private cleanEnlistedDate(text: string): string {
    // Extract just the date part, removing any prefixes
    // Look for pattern: [any characters]Month DD[,] YYYY
    const match = text.match(/(?:[a-zA-Z0-9]+)?([A-Z][a-z]+\s+\d+(?:,\s*|\s+)\d{4})/);
    return match ? match[1] : text;
  }

  private cleanLocation(text: string): string {
    // First clean the text and normalize spaces
    const cleaned = this.cleanText(text);
    
    // Look for pattern: [handle] Location1, Location2
    // Or just: Location1, Location2
    const locationMatch = cleaned.match(/(?:[a-zA-Z0-9]+\s+)?([^,]+(?:,\s*[^,]+)*)/);
    
    if (locationMatch && locationMatch[1]) {
      // Split into parts and clean each part
      const parts = locationMatch[1].split(',').map(part => this.cleanText(part));
      // Filter out empty parts and parts containing the handle
      const cleanParts = parts.filter(part => part && !part.toLowerCase().includes('yanz'));
      
      // If we have multiple parts, ensure proper comma formatting
      if (cleanParts.length >= 2) {
        // Join with comma and space
        return cleanParts.join(', ');
      } else if (cleanParts.length === 1 && cleanParts[0].includes('United Kingdom')) {
        // Special case for "United Kingdom Derby" -> "United Kingdom, Derby"
        const ukMatch = cleanParts[0].match(/United Kingdom\s+(\w+)/);
        if (ukMatch) {
          return `United Kingdom, ${ukMatch[1]}`;
        }
      }
      return cleanParts.join(', ');
    }
    
    return cleaned;
  }

  private extractMemberCount(text: string): number {
    // Extract just the number from "X members"
    const match = text.match(/(\d+)\s*members?/);
    return match ? parseInt(match[1], 10) : 0;
  }

  public async getProfileData(handle: string): Promise<PlayerProfile> {
    try {
      // Get main profile page
      const profileHtml = await this.makeRequest(`${this.baseUrl}/citizens/${handle}`);
      const $ = cheerio.load(profileHtml);

      // Parse basic info
      const profile: PlayerProfile = {
        id: uuidv4(),
        handle: $('.profile .info .entry:nth-child(2) .value').text().trim(),
        displayName: $('.profile .info .entry:first-child .value').text().trim(),
        citizenRecord: $('.citizen-record .value').text().trim(),
        enlisted: this.cleanEnlistedDate($('.left-col .inner .entry:first-child .value').text()),
        location: this.cleanLocation($('.left-col .inner .entry:nth-child(2) .value').text()),
        avatarUrl: this.baseUrl + $('.profile .thumb img').attr('src'),
        mainOrg: {
          name: '',
          sid: '',
          rank: '',
          logoUrl: '',
          memberCount: 0,
          hitHistory: {
            totalHits: 0,
            totalValue: 0
          }
        },
        affiliatedOrgs: [],
        hitHistory: {
          totalHits: 0,
          totalValue: 0
        },
        lastUpdated: new Date()
      };

      // Parse main org if exists
      const mainOrgEl = $('.main-org');
      if (mainOrgEl.length > 0) {
        const sid = mainOrgEl.find('.info .entry:nth-child(2) .value').text().trim();
        profile.mainOrg = {
          name: mainOrgEl.find('.info .entry:first-child a.value').text().trim(),
          sid,
          rank: mainOrgEl.find('.info .entry:nth-child(3) .value').text().trim(),
          logoUrl: this.baseUrl + mainOrgEl.find('.thumb img').attr('src'),
          memberCount: 0,
          hitHistory: {
            totalHits: 0,
            totalValue: 0
          }
        };

        // Get org page to fetch member count
        if (profile.mainOrg.sid) {
          const orgHtml = await this.makeRequest(`${this.baseUrl}/orgs/${profile.mainOrg.sid}`);
          const $org = cheerio.load(orgHtml);
          profile.mainOrg.memberCount = this.extractMemberCount($org('.logo .count').text());
        }
      }

      // Get affiliated orgs page
      const orgsHtml = await this.makeRequest(`${this.baseUrl}/citizens/${handle}/organizations`);
      const $orgs = cheerio.load(orgsHtml);

      // Parse affiliated orgs
      $orgs('.org-row').each((i, el) => {
        const $org = $orgs(el);
        const org: Organization = {
          name: $org.find('.name .value').text().trim(),
          sid: $org.find('.sid .value').text().trim(),
          rank: $org.find('.rank .value').text().trim(),
          logoUrl: this.baseUrl + $org.find('.logo img').attr('src'),
          memberCount: parseInt($org.find('.members .value').text().trim()) || 0,
          hitHistory: {
            totalHits: 0,
            totalValue: 0
          }
        };
        if (org.name && org.sid) {
          profile.affiliatedOrgs.push(org);
        }
      });

      return profile;

    } catch (error) {
      console.error('Error fetching RSI profile:', error);
      throw error;
    }
  }
}

// Export singleton instance
const scraper = new RSIScraper();
export default scraper;
