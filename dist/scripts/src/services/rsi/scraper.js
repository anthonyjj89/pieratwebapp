"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const uuid_1 = require("uuid");
class RSIScraper {
    constructor() {
        this.baseUrl = 'https://robertsspaceindustries.com';
    }
    async makeRequest(url) {
        try {
            const response = await (0, axios_1.default)({
                url,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5'
                },
                timeout: 10000
            });
            return response.data;
        }
        catch (error) {
            console.error('RSI request error:', error);
            throw error;
        }
    }
    cleanText(text) {
        // Remove extra whitespace and normalize
        return text.replace(/\s+/g, ' ').trim();
    }
    cleanEnlistedDate(text) {
        // Extract just the date part, removing any prefixes
        // Look for pattern: [any characters]Month DD[,] YYYY
        const match = text.match(/(?:[a-zA-Z0-9]+)?([A-Z][a-z]+\s+\d+(?:,\s*|\s+)\d{4})/);
        return match ? match[1] : text;
    }
    cleanLocation(text) {
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
            }
            else if (cleanParts.length === 1 && cleanParts[0].includes('United Kingdom')) {
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
    extractMemberCount(text) {
        // Extract just the number from "X members"
        const match = text.match(/(\d+)\s*members?/);
        return match ? parseInt(match[1], 10) : 0;
    }
    async getProfileData(handle) {
        try {
            // Get main profile page
            const profileHtml = await this.makeRequest(`${this.baseUrl}/citizens/${handle}`);
            const $ = cheerio.load(profileHtml);
            // Parse basic info
            const profile = {
                id: (0, uuid_1.v4)(),
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
                const org = {
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
        }
        catch (error) {
            console.error('Error fetching RSI profile:', error);
            throw error;
        }
    }
}
// Export singleton instance
const scraper = new RSIScraper();
exports.default = scraper;
