import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import { Organization } from '@/models/organization';
import { authOptions } from '@/lib/auth';
import { OrganizationMember, toClientOrganization } from '@/types/organizations';

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

        // Find organizations where user is a member
        const organizations = await Organization.find({
            $or: [
                { ownerId: session.user.id },
                { 'members.discordUserId': session.user.discordId }
            ]
        });

        if (organizations.length === 0) {
            return NextResponse.json(
                { error: 'No organization found' },
                { status: 404 }
            );
        }

        // For now, return the first organization
        // TODO: Add support for selecting active organization
        const currentOrg = organizations[0];

        // Get user's role in the organization
        const member = currentOrg.members.find(
            (member: OrganizationMember) => member.discordUserId === session.user.discordId
        );

        const role = member?.role || (currentOrg.ownerId === session.user.id ? 'owner' : 'member');

        return NextResponse.json({
            organization: toClientOrganization(currentOrg),
            role
        });

    } catch (error) {
        console.error('Error fetching current organization:', error);
        return NextResponse.json(
            { error: 'Failed to fetch current organization' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { organizationId } = body;

        if (!organizationId) {
            return NextResponse.json(
                { error: 'Organization ID is required' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Check if user is a member of the organization
        const organization = await Organization.findOne({
            _id: organizationId,
            $or: [
                { ownerId: session.user.id },
                { 'members.discordUserId': session.user.discordId }
            ]
        });

        if (!organization) {
            return NextResponse.json(
                { error: 'Organization not found or not a member' },
                { status: 404 }
            );
        }

        // Get user's role in the organization
        const member = organization.members.find(
            (member: OrganizationMember) => member.discordUserId === session.user.discordId
        );

        const role = member?.role || (organization.ownerId === session.user.id ? 'owner' : 'member');

        // TODO: Store active organization selection in user preferences

        return NextResponse.json({
            organization: toClientOrganization(organization),
            role
        });

    } catch (error) {
        console.error('Error updating current organization:', error);
        return NextResponse.json(
            { error: 'Failed to update current organization' },
            { status: 500 }
        );
    }
}
