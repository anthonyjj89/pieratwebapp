export interface DiscordGuild {
    id: string;
    name: string;
    icon: string | null;
    owner: boolean;
    permissions: string;
    features: string[];
}

export interface DiscordProfile {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    email: string;
    verified: boolean;
    guilds?: DiscordGuild[];
}
