import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import dbConnect from '@/lib/db';
import { Organization, JoinRequest } from '@/models/organization';
import { authOptions } from '@/lib/auth';

type Props = {
    params: Promise<{ id: string }>;
};

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

        // Check if user already has a pending request
        const existingRequest = await JoinRequest.findOne({
            organizationId: organization._id,
            discordUserId: session.user.discordId,
            status: 'pending'
        });

        if (existingRequest) {
            return NextResponse.json(
                { error: 'Join request already pending' },
                { status: 400 }
            );
        }

        // Create join request
        const joinRequest = new JoinRequest({
            _id: new ObjectId(),
            organizationId: organization._id,
            discordUserId: session.user.discordId,
            status: 'pending',
            requestedAt: new Date()
        });

        await joinRequest.save();

        // TODO: Send Discord notification to org owner

        return NextResponse.json({
            message: 'Join request submitted successfully'
        });

    } catch (error) {
        console.error('Error submitting join request:', error);
        return NextResponse.json(
            { error: 'Failed to submit join request' },
            { status: 500 }
        );
    }
}

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

        // Only org owner can view join requests
        if (organization.ownerId !== session.user.id) {
            return NextResponse.json(
                { error: 'Not authorized' },
                { status: 403 }
            );
        }

        // Get all pending join requests
        const requests = await JoinRequest.find({
            organizationId: organization._id,
            status: 'pending'
        }).sort({ requestedAt: -1 });

        return NextResponse.json({ requests });

    } catch (error) {
        console.error('Error fetching join requests:', error);
        return NextResponse.json(
            { error: 'Failed to fetch join requests' },
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
        const { requestId, status, message } = body;

        if (!requestId || !status || !['approved', 'rejected'].includes(status)) {
            return NextResponse.json(
                { error: 'Invalid request data' },
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

        // Only org owner can approve/reject requests
        if (organization.ownerId !== session.user.id) {
            return NextResponse.json(
                { error: 'Not authorized' },
                { status: 403 }
            );
        }

        // Update request status
        const joinRequest = await JoinRequest.findOneAndUpdate(
            {
                _id: new ObjectId(requestId),
                organizationId: organization._id,
                status: 'pending'
            },
            {
                $set: {
                    status,
                    message,
                    respondedBy: session.user.id,
                    respondedAt: new Date()
                }
            },
            { new: true }
        );

        if (!joinRequest) {
            return NextResponse.json(
                { error: 'Join request not found' },
                { status: 404 }
            );
        }

        // If approved, create member record
        if (status === 'approved') {
            await Organization.updateOne(
                { _id: organization._id },
                {
                    $push: {
                        members: {
                            discordUserId: joinRequest.discordUserId,
                            role: 'member',
                            joinedAt: new Date()
                        }
                    }
                }
            );
        }

        // TODO: Send Discord notification to user

        return NextResponse.json({
            message: `Join request ${status} successfully`
        });

    } catch (error) {
        console.error('Error updating join request:', error);
        return NextResponse.json(
            { error: 'Failed to update join request' },
            { status: 500 }
        );
    }
}
