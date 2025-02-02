import { NextAuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import { CustomAdapter } from './auth-adapter';
import type { DiscordProfile, DiscordGuild } from '@/types/discord';

export const authOptions: NextAuthOptions = {
    adapter: CustomAdapter(),
    providers: [
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID!,
            clientSecret: process.env.DISCORD_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: 'identify email guilds guilds.members.read',
                }
            }
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: 'jwt'
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === 'discord' && profile) {
                const discordProfile = profile as DiscordProfile;
                
                // Store Discord data
                user.discordId = discordProfile.id;
                user.name = discordProfile.username;
                user.image = discordProfile.avatar 
                    ? `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png`
                    : null;

                // Store guilds if available
                if ('guilds' in discordProfile) {
                    user.discordGuilds = discordProfile.guilds || [];
                }
            }
            return true;
        },
        async jwt({ token, account, profile, user }) {
            if (account && profile) {
                const discordProfile = profile as DiscordProfile;
                token.accessToken = account.access_token;
                token.discordId = discordProfile.id;
                token.discordGuilds = ('guilds' in discordProfile) ? discordProfile.guilds : [];
            }

            // Keep user data in sync
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.image = user.image;
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.discordId = token.discordId as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
                session.user.image = token.image as string;
                
                // Add Discord-specific data
                session.accessToken = token.accessToken as string;
                session.discordGuilds = token.discordGuilds as DiscordGuild[];
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            // Handle post-sign-in flow
            if (url.startsWith(baseUrl)) {
                // Check if user needs to set up organization
                if (url === `${baseUrl}/dashboard`) {
                    return `${baseUrl}/setup`;
                }
                return url;
            }
            // Allow relative callback URLs
            else if (url.startsWith('/')) {
                return `${baseUrl}${url}`;
            }
            return baseUrl;
        }
    },
    events: {
        async createUser({ user }) {
            console.log('New user created:', {
                id: user.id,
                discordId: user.discordId,
                email: user.email
            });
        },
        async signIn({ user }) {
            console.log('User signed in:', {
                id: user.id,
                discordId: user.discordId,
                email: user.email
            });
        },
        async signOut({ session }) {
            if (session?.user) {
                console.log('User signed out:', {
                    userId: session.user.id,
                    discordId: session.user.discordId
                });
            }
        }
    },
    pages: {
        signIn: '/signin',
        error: '/signin',
        newUser: '/setup'
    },
    debug: process.env.NODE_ENV === 'development'
};
