import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import { Organization } from '@/models/organization';
import { authOptions } from '@/lib/auth';

export async function GET(
    request: Request,
    { params }: { params: { guildId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        await dbConnect();

        // Check if organization exists for this guild
        const organization = await Organization.findOne({
            discordGuildId: params.guildId
        });

        if (!organization) {
            return NextResponse.json({
                exists: false,
                orgId: null
            });
        }

        return NextResponse.json({
            exists: true,
            orgId: organization._id.toString()
        });

    } catch (error) {
        console.error('Error checking organization:', error);
        return NextResponse.json(
            { error: 'Failed to check organization' },
            { status: 500 }
        );
    }
}
