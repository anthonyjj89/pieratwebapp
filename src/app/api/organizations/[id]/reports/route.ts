import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import dbConnect from '@/lib/db';
import { Organization } from '@/models/organization';
import { authOptions } from '@/lib/auth';
import { CreateReportBody } from '@/types/reports';
import { OrganizationMember } from '@/types/organizations';

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

        // Check if organization exists and user is a member
        const organization = await Organization.findOne({
            _id: new ObjectId(id),
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

        // Get reports for this organization
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports?organizationId=${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch reports');
        }

        const data = await response.json();
        return NextResponse.json({ reports: data.reports });

    } catch (error) {
        console.error('Error fetching reports:', error);
        return NextResponse.json(
            { error: 'Failed to fetch reports' },
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
        const { type, profit, participants, details } = body;

        if (!type || !profit || !participants || participants.length === 0) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Check if organization exists and user is a member
        const organization = await Organization.findOne({
            _id: new ObjectId(id),
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

        // Verify all participants are members
        const invalidParticipants = participants.filter(
            (participantId: string) => !organization.members.some((member: OrganizationMember) => member.discordUserId === participantId)
        );

        if (invalidParticipants.length > 0) {
            return NextResponse.json(
                { error: 'Some participants are not members of this organization' },
                { status: 400 }
            );
        }

        // Create report
        const reportData: CreateReportBody = {
            organizationId: id,
            type,
            profit,
            participants,
            details,
            createdBy: session.user.discordId
        };

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reportData)
        });

        if (!response.ok) {
            throw new Error('Failed to create report');
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Error creating report:', error);
        return NextResponse.json(
            { error: 'Failed to create report' },
            { status: 500 }
        );
    }
}
