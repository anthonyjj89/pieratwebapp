import 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            accessToken: string;
            tokenType: string;
        };
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        sub?: string;
        accessToken?: string;
        tokenType?: string;
        access_token?: string;
        token_type?: string;
    }
}

declare module 'next-auth/providers/discord' {
    interface DiscordProfile {
        accent_color?: number;
        avatar?: string;
        banner?: string;
        banner_color?: string;
        discriminator: string;
        email: string;
        flags: number;
        id: string;
        image_url?: string;
        locale: string;
        mfa_enabled: boolean;
        premium_type: number;
        public_flags: number;
        username: string;
        verified: boolean;
    }
}
