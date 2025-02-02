import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { Organization } from '@/models/organization';
import { authOptions } from '@/lib/auth';
import { Report } from '@/types/reports';

type Props = {
    params: Promise<{ id: string }>;
};

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
        const client = await clientPromise;
        const db = client.db();

        // Get report
        const report = await db
            .collection<Report>('reports')
            .findOne({ _id: new ObjectId(id) });

        if (!report) {
            return NextResponse.json(
                { error: 'Report not found' },
                { status: 404 }
            );
        }

        // Check if user has permission to delete report
        const organization = await Organization.findOne({
            _id: report.organizationId,
            $or: [
                { ownerId: session.user.id },
                { 'members.discordUserId': session.user.discordId, 'members.role': 'admin' }
            ]
        });

        if (!organization) {
            return NextResponse.json(
                { error: 'Not authorized to delete this report' },
                { status: 403 }
            );
        }

        // Delete report
        await db
            .collection<Report>('reports')
            .deleteOne({ _id: new ObjectId(id) });

        return NextResponse.json({
            message: 'Report deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting report:', error);
        return NextResponse.json(
            { error: 'Failed to delete report' },
            { status: 500 }
        );
    }
}
