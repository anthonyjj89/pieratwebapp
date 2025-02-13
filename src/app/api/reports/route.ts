import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { Organization } from '@/models/organization';
import { authOptions } from '@/lib/auth';
import { Report, CreateReportBody, toClientReport } from '@/types/reports';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const organizationId = searchParams.get('organizationId');

        if (!organizationId) {
            return NextResponse.json(
                { error: 'Organization ID is required' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db();

        // Check if organization exists and user is a member
        const organization = await Organization.findOne({
            _id: new ObjectId(organizationId),
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
        const reports = await db
            .collection<Report>('reports')
            .find({ organizationId: new ObjectId(organizationId) })
            .sort({ createdAt: -1 })
            .toArray();

        // Convert to client format
        const clientReports = reports.map(toClientReport);

        return NextResponse.json({ reports: clientReports });

    } catch (error) {
        console.error('Error fetching reports:', error);
        return NextResponse.json(
            { error: 'Failed to fetch reports' },
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

        const body: CreateReportBody = await request.json();
        const {
            organizationId,
            type,
            profit,
            participants,
            details,
            createdBy,
            createdAt
        } = body;

        if (!organizationId || !type || !profit || !participants || !createdBy) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db();

        // Check if organization exists and user is a member
        const organization = await Organization.findOne({
            _id: new ObjectId(organizationId),
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

        // Create report
        const report: Report = {
            _id: new ObjectId(),
            organizationId: new ObjectId(organizationId),
            type,
            profit,
            participants,
            details,
            createdBy,
            createdAt: createdAt ? new Date(createdAt) : new Date()
        };

        await db.collection<Report>('reports').insertOne(report);

        // Convert to client format
        const clientReport = toClientReport(report);

        return NextResponse.json(clientReport);

    } catch (error) {
        console.error('Error creating report:', error);
        return NextResponse.json(
            { error: 'Failed to create report' },
            { status: 500 }
        );
    }
}
