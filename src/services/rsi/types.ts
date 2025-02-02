export interface ErrorResponse {
    message: string;
    response?: {
        status: number;
        data?: unknown;
    };
    code?: string;
}

export class RSIError extends Error {
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
}

export interface ScrapeOptions {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    cacheTime?: number;
}
