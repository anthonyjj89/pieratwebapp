export interface RSIProfile {
  handle: string;
  signupDate: string;
  enlisted: string;
  location: string;
  avatarUrl: string | null;
  mainOrg: Organization | null;
  affiliatedOrgs: Organization[];
  organizations?: {
    main: Organization | null;
    affiliated: Organization[];
  };
}

export interface Organization {
  name: string;
  sid: string;
  rank: string;
  memberCount: string | number;
  url: string | null;
  logoUrl: string | null;
  isRedacted: boolean;
  stars?: number;
  logo?: string;
  recruiting?: boolean;
  archetype?: string;
  commitment?: string;
  roleplay?: boolean;
  primaryFocus?: string;
  secondaryFocus?: string;
  primaryImage?: string;
  secondaryImage?: string;
  banner?: string;
}

export interface ScraperConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  retryDelay: number;
}

export interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  timeout?: number;
  data?: unknown;
}

export interface ScrapeOptions {
  retries?: number;
  timeout?: number;
  cacheTime?: number;
}

export interface RSIErrorResponse {
  code: string;
  message: string;
  details: RSIErrorDetails;
}

export interface RSIErrorDetails {
  error: string;
}

export class RSIError extends Error {
  constructor(
    message: string,
    public username?: string,
    public statusCode?: number,
    public code?: string | RSIErrorDetails,
    public details?: string | RSIErrorDetails
  ) {
    super(message);
    this.name = 'RSIError';
  }

  static fromResponse(response: RSIErrorResponse): RSIError {
    return new RSIError(
      response.message,
      undefined,
      undefined,
      response.code,
      response.details
    );
  }
}

// Alias for backward compatibility
export type ProfileData = RSIProfile;
