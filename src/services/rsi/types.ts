export interface Organization {
    name: string;
    sid: string;
    rank: string;
    memberCount: string;
    url: string | null;
    logoUrl: string | null;
    isRedacted: boolean;
    stars: number;
}

export interface RSIProfile {
    handle: string;
    signupDate: string;
    enlisted: string;
    location: string;
    avatarUrl: string | null;
    mainOrg: Organization | null;
    affiliatedOrgs: Organization[];
    organizations: {
        main: Organization | null;
        affiliated: Organization[];
    };
}

export interface ScrapeOptions {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    cacheTime?: number;
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
};

export class RSIError extends Error {
    code?: number;
    details?: string;
    statusCode?: number;
    username?: string;

    constructor(message: string, username?: string) {
        super(message);
        this.name = 'RSIError';
        this.username = username;
    }

    static fromResponse(error: ErrorResponse): RSIError {
        const rsiError = new RSIError(error.message || 'Unknown error');
        if (error.response?.status) {
            rsiError.code = error.response.status;
            rsiError.statusCode = error.response.status;
        } else if (error.code === 'ECONNABORTED') {
            rsiError.code = 408; // Request Timeout
            rsiError.statusCode = 408;
        }
        rsiError.details = error.details || error.response?.data?.details || error.response?.data?.message;
        return rsiError;
    }
}
