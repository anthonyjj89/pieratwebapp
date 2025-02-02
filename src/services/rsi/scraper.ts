import axios from 'axios';
import * as cheerio from 'cheerio';
import { RSIError, RSIProfile, RSIOrg, ErrorResponse } from './types';

export class RSIScraper {
    private baseUrl: string;
    private headers: Record<string, string>;

    constructor() {
        this.baseUrl = 'https://robertsspaceindustries.com';
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        };
    }

    private async makeRequest(url: string): Promise<string> {
        try {
            const response = await axios({
                url,
                headers: this.headers,
                timeout: 10000
            });
            return response.data;
        } catch (error) {
            throw RSIError.fromResponse(error as ErrorResponse);
        }
    }

    private normalizeUrl(url: string | undefined): string | undefined {
        if (!url) return undefined;
        return url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    }

    public async getProfileData(handle: string): Promise<RSIProfile> {
        try {
            const html = await this.makeRequest(`${this.baseUrl}/citizens/${handle}`);
            const $ = cheerio.load(html);

            // Check if profile exists
            if ($('.profile').length === 0) {
                throw new RSIError('Profile not found', 404);
            }

            // Parse main organization
            const mainOrg: RSIOrg | undefined = $('.org-main').length ? {
                name: $('.org-main .org-name').text().trim(),
                rank: $('.org-main .org-rank').text().trim(),
                logoUrl: this.normalizeUrl($('.org-main .org-logo img').attr('src')),
                memberCount: parseInt($('.org-main .member-count').text().trim()) || 0,
                hitHistory: {
                    totalHits: 0,
                    totalValue: 0
                }
            } : undefined;

            // Parse affiliated organizations
            const affiliatedOrgs: RSIOrg[] = $('.org-affiliated').map((_, el) => {
                const $el = $(el);
                return {
                    name: $el.find('.org-name').text().trim(),
                    rank: $el.find('.org-rank').text().trim(),
                    logoUrl: this.normalizeUrl($el.find('.org-logo img').attr('src')),
                    memberCount: parseInt($el.find('.member-count').text().trim()) || 0,
                    hitHistory: {
                        totalHits: 0,
                        totalValue: 0
                    }
                };
            }).get();

            // Construct profile data
            const profile: RSIProfile = {
                id: $('.profile').attr('data-id') || crypto.randomUUID(),
                handle: $('.profile .handle').text().trim(),
                enlisted: $('.profile .enlisted').text().trim(),
                location: $('.profile .location').text().trim() || undefined,
                avatarUrl: this.normalizeUrl($('.profile .avatar img').attr('src')),
                mainOrg,
                affiliatedOrgs,
                hitHistory: {
                    totalHits: 0,
                    totalValue: 0
                }
            };

            return profile;

        } catch (error) {
            console.error('Error fetching profile data:', error);
            throw RSIError.fromResponse(error as ErrorResponse);
        }
    }
}

// Create and export a singleton instance
const scraper = new RSIScraper();
export default scraper;
