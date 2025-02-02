export interface ErrorResponse {
    message: string;
    response?: {
        status: number;
        data?: unknown;
    };
    code?: string;
}

export class RSIError extends Error {
    static PLAYER_NOT_FOUND = 'Player not found. Please check the spelling of the handle and try again.';
    static RATE_LIMITED = 'Too many requests. Please try again in a few minutes.';
    static NETWORK_ERROR = 'Unable to connect to RSI website. Please try again later.';

    constructor(
        message: string,
        public statusCode?: number
    ) {
        super(message);
        this.name = 'RSIError';
    }

    static fromResponse(error: ErrorResponse): RSIError {
        const message = error.message || 'Unknown error';
        const statusCode = error.response?.status;
        return new RSIError(message, statusCode);
    }
}

export interface RSIOrg {
    name: string;
    sid: string;
    rank: string;
    logoUrl?: string;
    memberCount: number;
    hitHistory?: {
        lastHit?: Date;
        totalHits: number;
        totalValue: number;
    };
}

export interface RSIProfile {
    id: string;
    handle: string;
    displayName: string;
    citizenRecord?: string;
    enlisted: string;
    location?: string;
    avatarUrl?: string;
    mainOrg?: RSIOrg;
    affiliatedOrgs: RSIOrg[];
    hitHistory?: {
        lastHit?: Date;
        totalHits: number;
        totalValue: number;
    };
    lastUpdated?: Date;
}

export interface ScrapeOptions {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    cacheTime?: number;
}

export interface RequestConfig {
    maxRetries: number;
    minDelay: number;
    maxDelay: number;
    userAgents: string[];
    backoffFactor: number;
}
