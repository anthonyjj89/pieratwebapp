export interface Organization {
  sid: string;
  name: string;
  logo?: string;
  rank?: string;
  stars?: number;
  memberCount?: number;
  recruiting?: boolean;
  archetype?: string;
  commitment?: string;
  roleplay?: boolean;
  primaryFocus?: string;
  primaryImage?: string;
  secondaryFocus?: string;
  secondaryImage?: string;
}

export interface ProfileData {
  handle: string;
  displayName?: string;
  title?: string;
  bio?: string;
  enlisted?: string;
  location?: string;
  languages?: string[];
  avatarUrl?: string;
  badges?: string[];
  organizations?: {
    main: Organization | null;
    affiliated: Organization[];
  };
  // Additional fields that might be useful
  lastSeen?: string;
  website?: string;
  discord?: string;
}

export interface RSIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Additional type definitions for scraping
export interface ScrapeOptions {
  timeout?: number;
  retries?: number;
  cacheTime?: number;
}

export interface ScrapedPage {
  url: string;
  html: string;
  timestamp: string;
}
