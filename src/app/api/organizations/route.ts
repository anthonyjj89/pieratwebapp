import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CreateOrganizationInput, ApiResponse, Organization } from '@/types/organizations';

const DISCORD_API = 'https://discord.com/api/v10';

interface DiscordGuild {
    id: string;
    name: string;
    icon: string | null;
    owner: boolean;
    permissions: string;
    features: string[];
}

// Temporary in-memory storage until we add a database
const organizations: Organization[] = [];

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.accessToken || !session.user?.id) {
            return NextResponse.json<ApiResponse<null>>(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const input: CreateOrganizationInput = await request.json();

        // Validate required fields
        if (!input.name || !input.discordGuildId) {
            return NextResponse.json<ApiResponse<null>>(
                { error: 'Name and Discord guild ID are required' },
                { status: 400 }
            );
        }

        // Verify guild admin status
        const response = await fetch(`${DISCORD_API}/users/@me/guilds`, {
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to verify Discord permissions');
        }

        const guilds: DiscordGuild[] = await response.json();
        const isAdmin = guilds.some((guild) => {
            return guild.id === input.discordGuildId && 
                   (guild.owner || (BigInt(guild.permissions) & BigInt(0x8)) === BigInt(0x8));
        });

        if (!isAdmin) {
            return NextResponse.json<ApiResponse<null>>(
                { error: 'You must be a server admin to create an organization' },
                { status: 403 }
            );
        }

        // Check if organization already exists for this guild
        const existingOrg = organizations.find(org => org.discordGuildId === input.discordGuildId);
        if (existingOrg) {
            return NextResponse.json<ApiResponse<null>>(
                { error: 'An organization already exists for this Discord server' },
                { status: 409 }
            );
        }

        // Create new organization
        const organization: Organization = {
            id: crypto.randomUUID(),
            name: input.name,
            description: input.description,
            discordGuildId: input.discordGuildId,
            createdAt: new Date(),
            updatedAt: new Date(),
            ownerId: session.user.id,
            settings: {
                profitSharing: {
                    defaultShare: input.settings?.profitSharing?.defaultShare ?? 100,
                    method: input.settings?.profitSharing?.method ?? 'equal'
                }
            }
        };

        organizations.push(organization);

        return NextResponse.json<ApiResponse<Organization>>(
            { data: organization },
            { status: 201 }
        );

    } catch (error) {
        console.error('Error creating organization:', error);
        return NextResponse.json<ApiResponse<null>>(
            { error: 'Failed to create organization' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json<ApiResponse<null>>(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Filter organizations where user is owner
        const userOrgs = organizations.filter(org => org.ownerId === session.user?.id);

        return NextResponse.json<ApiResponse<Organization[]>>({ 
            data: userOrgs 
        });

    } catch (error) {
        console.error('Error fetching organizations:', error);
        return NextResponse.json<ApiResponse<null>>(
            { error: 'Failed to fetch organizations' },
            { status: 500 }
        );
    }
}
