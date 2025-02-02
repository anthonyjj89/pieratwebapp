import axios from 'axios';
import * as cheerio from 'cheerio';
import type { Organization, RSIProfile, ScrapeOptions, ErrorResponse } from './types';
import { RSIError } from './types';

/**
 * RSI Profile Scraper
 * Scrapes player profiles and organization data from the RSI website
 */
export class RSIScraper {
    private baseUrl: string;
    private headers: Record<string, string>;
    private options: Required<ScrapeOptions>;

    constructor(options: ScrapeOptions = {}) {
        this.baseUrl = 'https://robertsspaceindustries.com';
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        };
        this.options = {
            timeout: options.timeout || 10000,
            retries: options.retries || 3,
            retryDelay: options.retryDelay || 1000,
            cacheTime: options.cacheTime || 300000 // 5 minutes default
        };
    }

    private normalizeUrl(url: string | undefined): string | null {
        if (!url) return null;
        return url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    }

    private async makeRequest(url: string): Promise<string> {
        let retries = this.options.retries;
        let lastError: ErrorResponse = { message: 'Unknown error' };

        while (retries > 0) {
            try {
                const response = await axios({
                    url,
                    headers: this.headers,
                    timeout: this.options.timeout
                });
                return response.data;
            } catch (error) {
                lastError = error as ErrorResponse;
                retries--;
                if (retries === 0) break;
                console.log(`Request failed, retrying... (${retries} attempts left)`);
                await new Promise(resolve => setTimeout(resolve, this.options.retryDelay));
            }
        }

        throw RSIError.fromResponse(lastError);
    }

    public async getProfileData(username: string): Promise<RSIProfile> {
        try {
            // Get profile data
            console.log(`Fetching profile for ${username}...`);
            const profileHtml = await this.makeRequest(`${this.baseUrl}/citizens/${username}`);
            const $ = cheerio.load(profileHtml);

            // Check if profile exists
            if ($('.not-found').length > 0) {
                throw new RSIError('Profile not found', username);
            }

            // Get basic profile info
            const handle = $('.info .value').first().text().trim();
            const signupDate = $('.info .entry:contains("Handle name") .value').text().trim();
            const enlisted = $('.left-col .entry:contains("Enlisted") .value').text().trim();
            const location = $('.left-col .entry:contains("Location") .value').text().trim();
            const avatarUrl = this.normalizeUrl($('.profile .thumb img').attr('src'));

            // Get organizations data
            console.log(`Fetching org data for ${username}...`);
            const orgsHtml = await this.makeRequest(`${this.baseUrl}/citizens/${username}/organizations`);
            const org$ = cheerio.load(orgsHtml);
            
            // Process main organization
            const mainOrgElement = org$('.box-content.org.main');
            let mainOrg: Organization | null = null;

            if (mainOrgElement.length > 0) {
                const isRedacted = mainOrgElement.hasClass('visibility-R');
                
                if (isRedacted) {
                    mainOrg = {
                        name: 'REDACTED',
                        sid: 'REDACTED',
                        rank: 'REDACTED',
                        memberCount: 'REDACTED',
                        url: null,
                        logoUrl: null,
                        isRedacted: true,
                        stars: 0
                    };
                } else {
                    const orgLink = mainOrgElement.find('.info a').first();
                    const orgName = orgLink.text().trim();
                    const orgHref = orgLink.attr('href');
                    const orgSID = orgHref ? orgHref.split('/')[2] : null;
                    const orgRank = mainOrgElement.find('.info .value:contains("rank")').text().trim() || 'N/A';
                    const memberCount = mainOrgElement.find('.thumb .members').text().trim().split(' ')[0] || 'Unknown';
                    const logoUrl = this.normalizeUrl(mainOrgElement.find('.thumb img').attr('src'));

                    mainOrg = {
                        name: orgName,
                        sid: orgSID || 'UNKNOWN',
                        rank: orgRank,
                        memberCount,
                        url: orgSID ? `${this.baseUrl}/orgs/${orgSID}` : null,
                        logoUrl,
                        isRedacted: false,
                        stars: 0
                    };
                }
            }

            // Process affiliated organizations
            const affiliatedOrgs: Organization[] = [];
            const normalizeUrl = this.normalizeUrl.bind(this);
            const baseUrl = this.baseUrl;
            
            org$('.box-content.org.affiliation').each((_, element) => {
                const $el = org$(element);
                const isRedacted = $el.hasClass('visibility-R');
                
                if (isRedacted) {
                    affiliatedOrgs.push({
                        name: 'REDACTED',
                        sid: 'REDACTED',
                        rank: 'REDACTED',
                        memberCount: 'REDACTED',
                        url: null,
                        logoUrl: null,
                        isRedacted: true,
                        stars: 0
                    });
                } else {
                    const orgLink = $el.find('.info a').first();
                    const orgName = orgLink.text().trim();
                    const orgHref = orgLink.attr('href');
                    const orgSID = orgHref ? orgHref.split('/')[2] : null;
                    const orgRank = $el.find('.info .value:contains("rank")').text().trim() || 'N/A';
                    const memberCount = $el.find('.thumb .members').text().trim().split(' ')[0] || 'Unknown';
                    const logoUrl = normalizeUrl($el.find('.thumb img').attr('src'));

                    affiliatedOrgs.push({
                        name: orgName,
                        sid: orgSID || 'UNKNOWN',
                        rank: orgRank,
                        memberCount,
                        url: orgSID ? `${baseUrl}/orgs/${orgSID}` : null,
                        logoUrl,
                        isRedacted: false,
                        stars: 0
                    });
                }
            });

            // Extract profile data
            const data: RSIProfile = {
                handle,
                signupDate,
                enlisted,
                location,
                avatarUrl,
                mainOrg,
                affiliatedOrgs,
                organizations: {
                    main: mainOrg,
                    affiliated: affiliatedOrgs
                }
            };

            console.log(`Successfully fetched data for ${username}`);
            return data;

        } catch (error) {
            console.error(`Error fetching data for ${username}:`, error);
            const err = error as ErrorResponse;
            
            if (err.response?.status === 404) {
                throw new RSIError('Profile not found', username);
            }
            if (err.code === 'ECONNABORTED') {
                throw new RSIError('Request timed out. The RSI website might be slow or down.');
            }
            if (err.response?.status === 429) {
                throw new RSIError('Rate limited by RSI website. Please try again in a few minutes.');
            }
            throw RSIError.fromResponse(err);
        }
    }
}

// Create and export a singleton instance
const scraper = new RSIScraper();
export default scraper;
