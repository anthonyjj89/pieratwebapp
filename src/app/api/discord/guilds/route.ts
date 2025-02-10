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
        console.log('Fetching Discord guilds...');
        const session = await getServerSession(authOptions);
        
        if (!session) {
            console.log('No session found');
            return NextResponse.json(
                { error: 'Not authenticated - No session' },
                { status: 401 }
            );
        }

        if (!session.accessToken) {
            console.log('No access token in session:', session);
            return NextResponse.json(
                { error: 'Not authenticated - No access token' },
                { status: 401 }
            );
        }

        console.log('Fetching guilds with token:', session.accessToken.slice(0, 10) + '...');

        // Fetch user's guilds from Discord API
        const response = await fetch(`${DISCORD_API}/users/@me/guilds`, {
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Discord API error:', {
                status: response.status,
                statusText: response.statusText,
                error: errorText
            });
            throw new Error(`Discord API error: ${response.status} - ${errorText}`);
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
