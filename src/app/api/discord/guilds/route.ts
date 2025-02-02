import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface DiscordGuild {
    id: string;
    name: string;
    icon: string | null;
    owner: boolean;
    permissions: string;
    features: string[];
}

const DISCORD_API = 'https://discord.com/api/v10';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.accessToken) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Fetch user's guilds from Discord API
        const response = await fetch(`${DISCORD_API}/users/@me/guilds`, {
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Discord API error: ${response.statusText}`);
        }

        const guilds: DiscordGuild[] = await response.json();

        // Filter for guilds where user has admin permissions
        // Permission 0x8 is ADMINISTRATOR
        const adminGuilds = guilds.filter(guild => {
            const permissions = BigInt(guild.permissions);
            return (permissions & BigInt(0x8)) === BigInt(0x8);
        });

        return NextResponse.json({
            guilds: adminGuilds.map(guild => ({
                id: guild.id,
                name: guild.name,
                icon: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : null,
                features: guild.features
            }))
        });

    } catch (error) {
        console.error('Error fetching Discord guilds:', error);
        return NextResponse.json(
            { error: 'Failed to fetch Discord guilds' },
            { status: 500 }
        );
    }
}
