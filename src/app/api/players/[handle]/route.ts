import { NextResponse, NextRequest } from 'next/server';
import { RSIScraper } from '@/services/rsi/scraper';
import type { RSIError } from '@/services/rsi/types';

type Props = {
  params: { handle: string }
}

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  props: Props
) {
  try {
    const profile = await RSIScraper.getProfileData(props.params.handle);
    
    // If the profile has an organization, fetch its details
    if (profile.organizations?.main) {
      const orgData = await RSIScraper.getOrganizationData(profile.organizations.main.sid);
      profile.organizations.main = { ...profile.organizations.main, ...orgData };
    }

    return NextResponse.json(profile);
  } catch (error) {
    const rsiError = error as RSIError;
    return NextResponse.json(
      {
        error: rsiError.code || 'UNKNOWN_ERROR',
        message: rsiError.message || 'An unexpected error occurred',
        details: rsiError.details
      },
      { status: 500 }
    );
  }
}
