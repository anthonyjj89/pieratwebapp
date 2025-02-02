import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import dbConnect from '@/lib/db';
import { Organization } from '@/models/organization';
import { authOptions } from '@/lib/auth';
import { OrganizationMember, toClientMember } from '@/types/organizations';

type Props = {
    params: Promise<{ id: string }>;
};

export async function GET(
    request: Request,
    { params }: Props
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const { id } = await params;
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

        // Check if user is a member
        const isMember = organization.members.some(
            (member: OrganizationMember) => member.discordUserId === session.user.discordId
        );

        if (!isMember) {
            return NextResponse.json(
                { error: 'Not a member of this organization' },
                { status: 403 }
            );
        }

        // Convert members to client-safe format
        const members = organization.members.map(toClientMember);

        return NextResponse.json({ members });

    } catch (error) {
        console.error('Error fetching members:', error);
        return NextResponse.json(
            { error: 'Failed to fetch members' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: Request,
    { params }: Props
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = await request.json();
        const { discordUserId, role } = body;

        if (!discordUserId || !role || !['admin', 'member'].includes(role)) {
            return NextResponse.json(
                { error: 'Invalid member data' },
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

        // Only owner can add members
        if (organization.ownerId !== session.user.id) {
            return NextResponse.json(
                { error: 'Not authorized' },
                { status: 403 }
            );
        }

        // Check if user is already a member
        if (organization.members.some((member: OrganizationMember) => member.discordUserId === discordUserId)) {
            return NextResponse.json(
                { error: 'User is already a member' },
                { status: 400 }
            );
        }

        // Create new member
        const newMember: OrganizationMember = {
            userId: discordUserId, // For backward compatibility
            discordUserId,
            role,
            joinedAt: new Date()
        };

        // Add member
        await Organization.updateOne(
            { _id: organization._id },
            { $push: { members: newMember } }
        );

        return NextResponse.json({
            message: 'Member added successfully',
            member: toClientMember(newMember)
        });

    } catch (error) {
        console.error('Error adding member:', error);
        return NextResponse.json(
            { error: 'Failed to add member' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: Props
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const discordUserId = searchParams.get('discordUserId');

        if (!discordUserId) {
            return NextResponse.json(
                { error: 'Discord user ID is required' },
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

        // Only owner can remove members
        if (organization.ownerId !== session.user.id) {
            return NextResponse.json(
                { error: 'Not authorized' },
                { status: 403 }
            );
        }

        // Cannot remove owner
        if (discordUserId === organization.ownerId) {
            return NextResponse.json(
                { error: 'Cannot remove organization owner' },
                { status: 400 }
            );
        }

        // Remove member
        await Organization.updateOne(
            { _id: organization._id },
            {
                $pull: {
                    members: {
                        discordUserId
                    }
                }
            }
        );

        return NextResponse.json({
            message: 'Member removed successfully'
        });

    } catch (error) {
        console.error('Error removing member:', error);
        return NextResponse.json(
            { error: 'Failed to remove member' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: Props
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = await request.json();
        const { discordUserId, role } = body;

        if (!discordUserId || !role || !['admin', 'member'].includes(role)) {
            return NextResponse.json(
                { error: 'Invalid member data' },
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

        // Only owner can update roles
        if (organization.ownerId !== session.user.id) {
            return NextResponse.json(
                { error: 'Not authorized' },
                { status: 403 }
            );
        }

        // Cannot update owner's role
        if (discordUserId === organization.ownerId) {
            return NextResponse.json(
                { error: 'Cannot modify organization owner role' },
                { status: 400 }
            );
        }

        // Update member role
        await Organization.updateOne(
            {
                _id: organization._id,
                'members.discordUserId': discordUserId
            },
            {
                $set: {
                    'members.$.role': role
                }
            }
        );

        return NextResponse.json({
            message: 'Member role updated successfully'
        });

    } catch (error) {
        console.error('Error updating member role:', error);
        return NextResponse.json(
            { error: 'Failed to update member role' },
            { status: 500 }
        );
    }
}
