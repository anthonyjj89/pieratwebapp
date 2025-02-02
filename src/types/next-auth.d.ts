import 'next-auth';
import { DefaultSession, DefaultUser } from 'next-auth';
import { Profile as DiscordProfile } from 'next-auth/providers/discord';

declare module 'next-auth' {
    interface Session extends DefaultSession {
        accessToken?: string;
        user: {
            id: string;
            discordId: string;
            email: string;
            name: string;
            image?: string;
        } & DefaultSession['user'];
    }

    interface User extends DefaultUser {
        discordId?: string;
    }

    interface Profile extends DiscordProfile {
        id: string;
        username: string;
        discriminator: string;
        avatar: string | null;
        email: string;
        verified: boolean;
        locale: string;
        mfa_enabled: boolean;
        flags: number;
        premium_type: number;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        accessToken?: string;
        discordId?: string;
        id?: string;
    }
}
