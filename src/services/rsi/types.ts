export interface Organization {
    name: string;
    sid: string;
    rank: string;
    memberCount: string;
    url: string | null;
    logoUrl: string | null;
    isRedacted: boolean;
    stars?: number; // Optional star rating
    logo?: string; // Legacy logo field for compatibility
}

export interface RSIProfile {
    handle: string;
    signupDate: string;
    enlisted: string;
    location: string;
    avatarUrl: string | null;
    mainOrg: Organization | null;
    affiliatedOrgs: Organization[];
    organizations?: { // Optional organizations field for API compatibility
        main: Organization | null;
        affiliated: Organization[];
    };
}

export interface ScrapeOptions {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    cacheTime?: number; // Cache duration in milliseconds
}

export type ErrorResponse = {
    message?: string;
    code?: string;
    details?: string;
    response?: {
        status?: number;
        data?: {
            message?: string;
            code?: string;
            details?: string;
        };
    };
    isAxiosError?: boolean;
    username?: string;
};

export class RSIError extends Error {
    code?: number;
    details?: string;

    constructor(message: string, public username?: string) {
        super(message);
        this.name = 'RSIError';
    }

    static fromResponse(error: ErrorResponse): RSIError {
        const rsiError = new RSIError(error.message || 'Unknown error', error.username);
        
        // Handle status codes
        if (error.response?.status) {
            rsiError.code = error.response.status;
        } else if (error.code === 'ECONNABORTED') {
            rsiError.code = 408; // Request Timeout
        }

        // Handle error details
        rsiError.details = error.details || error.response?.data?.details || error.response?.data?.message;

        return rsiError;
    }
}
