import axios from 'axios';
import * as cheerio from 'cheerio';
import { RSIError } from './types';
import type { RSIProfile, Organization, ScrapeOptions } from './types';

const BASE_URL = 'https://robertsspaceindustries.com';
const DEFAULT_OPTIONS: ScrapeOptions = {
  timeout: 10000,
  retries: 3,
  cacheTime: 3600, // 1 hour
};

export class RSIScraper {
  private static cache = new Map<string, { data: RSIProfile | Organization; timestamp: number }>();

  private static async fetchWithRetry(url: string, options: ScrapeOptions = DEFAULT_OPTIONS): Promise<string> {
    let lastError: Error | null = null;
    
    for (let i = 0; i < (options.retries || DEFAULT_OPTIONS.retries!); i++) {
      try {
        const response = await axios.get(url, {
          timeout: options.timeout || DEFAULT_OPTIONS.timeout,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        return response.data;
      } catch (error) {
        lastError = error as Error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }

    throw new Error(`Failed to fetch ${url}: ${lastError?.message}`);
  }

  private static getCacheKey(type: string, id: string): string {
    return `${type}:${id}`;
  }

  private static getFromCache<T extends RSIProfile | Organization>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > (DEFAULT_OPTIONS.cacheTime! * 1000)) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  private static setCache<T extends RSIProfile | Organization>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  static async getProfileData(handle: string): Promise<RSIProfile> {
    const cacheKey = this.getCacheKey('profile', handle);
    const cached = this.getFromCache<RSIProfile>(cacheKey);
    if (cached) return cached;

    try {
      const html = await this.fetchWithRetry(`${BASE_URL}/citizens/${handle}`);
      const $ = cheerio.load(html);

      const profile: RSIProfile = {
        handle,
        signupDate: $('.profile-content .info .value').first().text().trim(),
        enlisted: $('.profile-content .info .value').eq(1).text().trim(),
        location: $('.profile-wrapper .location .value').text().trim(),
        avatarUrl: $('.profile .thumb img').attr('src') || null,
        mainOrg: null,
        affiliatedOrgs: [],
        organizations: {
          main: null,
          affiliated: []
        }
      };

      // Parse organizations
      const mainOrg = $('.main-org');
      if (mainOrg.length) {
        const orgSid = mainOrg.find('.org-name a').attr('href')?.split('/').pop() || '';
        profile.mainOrg = {
          sid: orgSid,
          name: mainOrg.find('.org-name a').text().trim(),
          rank: mainOrg.find('.org-rank .value').text().trim(),
          memberCount: mainOrg.find('.member-count').text().trim(),
          url: orgSid ? `${BASE_URL}/orgs/${orgSid}` : null,
          logoUrl: mainOrg.find('.org-logo img').attr('src') || null,
          isRedacted: false,
          stars: mainOrg.find('.stars').children().length,
          logo: mainOrg.find('.org-logo img').attr('src')
        };
        profile.organizations!.main = profile.mainOrg;
      }

      $('.affiliated-org').each((_, elem) => {
        const orgSid = $(elem).find('.org-name a').attr('href')?.split('/').pop() || '';
        const org: Organization = {
          sid: orgSid,
          name: $(elem).find('.org-name a').text().trim(),
          rank: $(elem).find('.org-rank .value').text().trim(),
          memberCount: $(elem).find('.member-count').text().trim(),
          url: orgSid ? `${BASE_URL}/orgs/${orgSid}` : null,
          logoUrl: $(elem).find('.org-logo img').attr('src') || null,
          isRedacted: false,
          stars: $(elem).find('.stars').children().length,
          logo: $(elem).find('.org-logo img').attr('src')
        };
        profile.affiliatedOrgs.push(org);
        profile.organizations!.affiliated.push(org);
      });

      this.setCache(cacheKey, profile);
      return profile;

    } catch (error) {
      throw RSIError.fromResponse({
        code: 'PROFILE_FETCH_ERROR',
        message: `Failed to fetch profile for ${handle}`,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
  }

  static async getOrganizationData(sid: string): Promise<Organization> {
    const cacheKey = this.getCacheKey('org', sid);
    const cached = this.getFromCache<Organization>(cacheKey);
    if (cached) return cached;

    try {
      const html = await this.fetchWithRetry(`${BASE_URL}/orgs/${sid}`);
      const $ = cheerio.load(html);

      const org: Organization = {
        sid,
        name: $('.org-title').text().trim(),
        rank: 'N/A', // Organization page doesn't show rank
        memberCount: parseInt($('.members .value').text().trim(), 10),
        url: `${BASE_URL}/orgs/${sid}`,
        logoUrl: $('.org-logo img').attr('src') || null,
        isRedacted: false,
        logo: $('.org-logo img').attr('src'),
        recruiting: $('.recruiting .value').text().trim().toLowerCase() === 'yes',
        archetype: $('.archetype .value').text().trim(),
        commitment: $('.commitment .value').text().trim(),
        roleplay: $('.roleplay .value').text().trim().toLowerCase() === 'yes',
        primaryFocus: $('.primary-focus .focus-name').text().trim(),
        primaryImage: $('.primary-focus .focus-image').attr('src'),
        secondaryFocus: $('.secondary-focus .focus-name').text().trim(),
        secondaryImage: $('.secondary-focus .focus-image').attr('src')
      };

      this.setCache(cacheKey, org);
      return org;

    } catch (error) {
      throw RSIError.fromResponse({
        code: 'ORG_FETCH_ERROR',
        message: `Failed to fetch organization ${sid}`,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
  }
}
