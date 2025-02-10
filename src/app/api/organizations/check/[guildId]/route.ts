import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import { Organization } from '@/models/organization';
import { authOptions } from '@/lib/auth';

type Props = {
    params: Promise<{ guildId: string }>;
};

export async function GET(
    request: Request,
    { params }: Props
) {
    try {
        console.log('Checking organization for guild...');
        const session = await getServerSession(authOptions);
        
        if (!session) {
            console.log('No session found');
            return NextResponse.json(
                { error: 'Not authenticated - No session' },
                { status: 401 }
            );
        }

        if (!session.user) {
            console.log('No user in session:', session);
            return NextResponse.json(
                { error: 'Not authenticated - No user' },
                { status: 401 }
            );
        }

        const { guildId } = await params;
        console.log('Checking guild:', guildId);

        console.log('Connecting to database...');
        await dbConnect();
        console.log('Database connected');

        // Check if organization exists for this guild
        console.log('Querying organization...');
        const organization = await Organization.findOne({
            discordGuildId: guildId
        });

        if (!organization) {
            console.log('No organization found for guild:', guildId);
            return NextResponse.json({
                exists: false,
                orgId: null
            });
        }

        console.log('Found organization:', {
            id: organization._id.toString(),
            name: organization.name,
            guildId: organization.discordGuildId
        });

        return NextResponse.json({
            exists: true,
            orgId: organization._id.toString()
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error checking organization:', {
            error: errorMessage,
            stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json(
            { error: `Failed to check organization: ${errorMessage}` },
            { status: 500 }
        );
    }
}
