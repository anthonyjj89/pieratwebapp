import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { Organization } from '@/models/organization';
import { authOptions } from '@/lib/auth';
import { Report } from '@/types/reports';
import { OrganizationMember } from '@/types/organizations';
import { AnalyticsData, toAnalyticsResponse } from '@/types/analytics';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const client = await clientPromise;
        const db = client.db();

        // Check if organization exists and user is a member
        const organization = await Organization.findOne({
            _id: new ObjectId(params.id),
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

        // Get total members
        const totalMembers = organization.members.length;

        // Get reports data
        const reports = await db
            .collection<Report>('reports')
            .find({ organizationId: new ObjectId(params.id) })
            .toArray();

        const totalReports = reports.length;

        // Calculate total profit and profit by member
        let totalProfit = 0;
        const profitByMember = new Map<string, number>();

        // Initialize profit for all members
        organization.members.forEach((member: OrganizationMember) => {
            profitByMember.set(member.discordUserId, 0);
        });

        // Calculate profits from reports
        reports.forEach((report: Report) => {
            totalProfit += report.profit;

            // Split profit among participants based on organization settings
            const participantCount = report.participants.length;
            const profitPerParticipant = report.profit / participantCount;

            report.participants.forEach((participantId: string) => {
                const currentProfit = profitByMember.get(participantId) || 0;
                profitByMember.set(participantId, currentProfit + profitPerParticipant);
            });
        });

        const analyticsData: AnalyticsData = {
            totalMembers,
            totalReports,
            totalProfit,
            profitByMember
        };

        return NextResponse.json(toAnalyticsResponse(analyticsData));

    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
