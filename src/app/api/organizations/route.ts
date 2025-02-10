import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import dbConnect from '@/lib/db';
import { Organization } from '@/models/organization';
import { authOptions } from '@/lib/auth';
import { OrganizationMember, toClientOrganization, CreateOrganizationInput } from '@/types/organizations';

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

        // Convert to client-safe format
        const clientOrgs = organizations.map(toClientOrganization);

        return NextResponse.json({ organizations: clientOrgs });

    } catch (error) {
        console.error('Error fetching organizations:', error);
        return NextResponse.json(
            { error: 'Failed to fetch organizations' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const input: CreateOrganizationInput = await request.json();
        const { name, discordGuildId, roles } = input;

        if (!name || !discordGuildId) {
            return NextResponse.json(
                { error: 'Name and Discord guild ID are required' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Check if organization already exists for this guild
        const existingOrg = await Organization.findOne({ discordGuildId });
        if (existingOrg) {
            return NextResponse.json(
                { error: 'Organization already exists for this Discord server' },
                { status: 400 }
            );
        }

        // Create owner member record
        const ownerMember: OrganizationMember = {
            userId: session.user.id, // For backward compatibility
            discordUserId: session.user.discordId,
            role: 'owner',
            joinedAt: new Date()
        };

        // Create organization
        const organization = new Organization({
            _id: new ObjectId(),
            name,
            discordGuildId,
            ownerId: session.user.id,
            members: [ownerMember],
            roles: roles || { // Use provided roles or default to empty object
                'owner': {
                    ratio: 1.0
                }
            },
            settings: {
                profitSharing: {
                    defaultShare: 100,
                    method: 'equal'
                }
            },
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await organization.save();

        return NextResponse.json({
            message: 'Organization created successfully',
            organization: toClientOrganization(organization)
        });

    } catch (error) {
        console.error('Error creating organization:', error);
        return NextResponse.json(
            { error: 'Failed to create organization' },
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
        const { id, name, description, settings } = body;

        if (!id || !name) {
            return NextResponse.json(
                { error: 'Organization ID and name are required' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Check if organization exists
        const organization = await Organization.findOne({
            _id: new ObjectId(id)
        });

        if (!organization) {
            return NextResponse.json(
                { error: 'Organization not found' },
                { status: 404 }
            );
        }

        // Only owner can update organization
        if (organization.ownerId !== session.user.id) {
            return NextResponse.json(
                { error: 'Not authorized' },
                { status: 403 }
            );
        }

        // Update organization
        const updatedOrg = await Organization.findOneAndUpdate(
            { _id: new ObjectId(id) },
            {
                $set: {
                    name,
                    description,
                    settings,
                    updatedAt: new Date()
                }
            },
            { new: true }
        );

        if (!updatedOrg) {
            return NextResponse.json(
                { error: 'Failed to update organization' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: 'Organization updated successfully',
            organization: toClientOrganization(updatedOrg)
        });

    } catch (error) {
        console.error('Error updating organization:', error);
        return NextResponse.json(
            { error: 'Failed to update organization' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Organization ID is required' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Check if organization exists
        const organization = await Organization.findOne({
            _id: new ObjectId(id)
        });

        if (!organization) {
            return NextResponse.json(
                { error: 'Organization not found' },
                { status: 404 }
            );
        }

        // Only owner can delete organization
        if (organization.ownerId !== session.user.id) {
            return NextResponse.json(
                { error: 'Not authorized' },
                { status: 403 }
            );
        }

        // Delete organization
        await Organization.deleteOne({ _id: new ObjectId(id) });

        // TODO: Clean up related data (reports, etc.)

        return NextResponse.json({
            message: 'Organization deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting organization:', error);
        return NextResponse.json(
            { error: 'Failed to delete organization' },
            { status: 500 }
        );
    }
}
