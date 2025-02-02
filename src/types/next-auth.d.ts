import 'next-auth';
import { DefaultSession, DefaultUser } from 'next-auth';

interface DiscordGuild {
    id: string;
    name: string;
    icon: string | null;
    owner: boolean;
    permissions: string;
    features: string[];
}

declare module 'next-auth' {
    interface Session extends DefaultSession {
        accessToken?: string;
        discordGuilds?: DiscordGuild[];
        user: {
            id: string;
            discordId: string;
            email: string;
            name: string;
            image?: string;
        } & DefaultSession['user'];
    }

    interface User extends DefaultUser {
        discordId: string;
        discordGuilds?: DiscordGuild[];
    }

    interface Profile {
        id: string;
        username: string;
        discriminator: string;
        avatar: string | null;
        email: string;
        verified: boolean;
        guilds?: DiscordGuild[];
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        accessToken?: string;
        discordId?: string;
        discordGuilds?: DiscordGuild[];
        id?: string;
    }
}
