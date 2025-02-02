import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { HitReport } from '@/models/hit';
import { Organization } from '@/models/organization';
import { OrganizationMember } from '@/types/organizations';

interface CargoEntry {
    code: string;
    name: string;
    quantity: number;
    value: number;
}

interface HitReportData {
    targetId: string;
    organizationId: string;
    location: string;
    cargo: CargoEntry[];
    participants: OrganizationMember[];
    timestamp: Date;
}

export async function POST(request: Request) {
    try {
        await dbConnect();

        const data: HitReportData = await request.json();
        const { targetId, organizationId, location, cargo, participants, timestamp } = data;

        // Calculate total value
        const totalValue = cargo.reduce((sum: number, item: CargoEntry) => sum + item.value, 0);

        // Get organization's profit sharing settings
        const organization = await Organization.findOne({ id: organizationId });
        if (!organization) {
            return NextResponse.json(
                { error: 'Organization not found' },
                { status: 404 }
            );
        }

        // Calculate profit shares based on organization settings
        const shares = participants.map((participant: OrganizationMember) => {
            let percentage = organization.settings.profitSharing.defaultShare;

            // Adjust percentage based on method
            switch (organization.settings.profitSharing.method) {
                case 'role':
                    // TODO: Implement role-based profit sharing
                    break;
                case 'contribution':
                    // TODO: Implement contribution-based profit sharing
                    break;
                case 'equal':
                default:
                    percentage = 100 / participants.length;
            }

            return {
                userId: participant.userId,
                amount: (totalValue * percentage) / 100,
                percentage,
                status: 'pending'
            };
        });

        // Create hit report
        const report = new HitReport({
            targetId,
            organizationId,
            location,
            cargo,
            participants,
            timestamp,
            totalValue,
            status: 'pending',
            profitDistribution: {
                method: organization.settings.profitSharing.method,
                shares
            },
            metadata: {
                submittedBy: participants[0].userId, // Assuming first participant is submitter
                submittedAt: new Date()
            }
        });

        await report.save();

        return NextResponse.json({ success: true, report });

    } catch (error) {
        console.error('Error creating hit report:', error);
        return NextResponse.json(
            { error: 'Failed to create hit report' },
            { status: 500 }
        );
    }
}
