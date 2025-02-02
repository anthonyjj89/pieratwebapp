import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import { Organization, OrganizationMember } from '@/models/organization';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        await dbConnect();

        // Find the user's organization membership
        const membership = await OrganizationMember.findOne({
            userId: session.user.id,
        }).sort({ joinedAt: -1 }); // Get most recent membership

        if (!membership) {
            return NextResponse.json(
                { error: 'No organization found' },
                { status: 404 }
            );
        }

        // Get the organization details
        const organization = await Organization.findOne({
            id: membership.organizationId,
        });

        if (!organization) {
            return NextResponse.json(
                { error: 'Organization not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ organization });

    } catch (error) {
        console.error('Error fetching current organization:', error);
        return NextResponse.json(
            { error: 'Failed to fetch organization' },
            { status: 500 }
        );
    }
}
