# Authentication Setup Guide

## Overview
This guide details the implementation of authentication using NextAuth.js with Discord as the provider, including admin permission verification.

## Steps

### 1. Install Dependencies
```bash
npm install next-auth @auth/core @auth/mongodb-adapter mongodb
```

### 2. Environment Variables
Add to `.env.local`:
```env
# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Discord OAuth
DISCORD_CLIENT_ID=your-client-id
DISCORD_CLIENT_SECRET=your-client-secret

# MongoDB
MONGODB_URI=your-mongodb-uri
```

### 3. Discord Application Setup
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create new application
3. Under OAuth2:
   - Add redirect URI: `http://localhost:3000/api/auth/callback/discord`
   - Request scopes:
     - `identify` (basic user info)
     - `guilds` (server membership)
     - `guilds.members.read` (server permissions)

### 4. NextAuth Configuration
Create `src/app/api/auth/[...nextauth]/route.ts`:
```typescript
import NextAuth from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb';

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'identify guilds guilds.members.read',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: '/signin',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### 5. MongoDB Connection
Create `src/lib/mongodb.ts`:
```typescript
import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
```

### 6. Auth Provider Component
Create `src/components/providers/NextAuthProvider.tsx`:
```typescript
'use client';

import { SessionProvider } from 'next-auth/react';

export function NextAuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

### 7. Root Layout Update
Update `src/app/layout.tsx`:
```typescript
import { NextAuthProvider } from '@/components/providers/NextAuthProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
```

### 8. Sign In Page
Create `src/app/(auth)/signin/page.tsx`:
```typescript
import { SignInForm } from '@/components/auth/SignInForm';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6">
        <h1 className="text-2xl font-bold mb-6">Sign in to PieRat</h1>
        <SignInForm />
      </div>
    </div>
  );
}
```

### 9. Sign In Form Component
Create `src/components/auth/SignInForm.tsx`:
```typescript
'use client';

import { signIn } from 'next-auth/react';

export function SignInForm() {
  return (
    <button
      onClick={() => signIn('discord', { callbackUrl: '/dashboard' })}
      className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
    >
      Sign in with Discord
    </button>
  );
}
```

### 10. Middleware for Protected Routes
Create `src/middleware.ts`:
```typescript
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

### 11. Testing
1. Start development server:
```bash
npm run dev
```

2. Test auth flow:
   - Visit homepage
   - Click sign in
   - Authorize with Discord
   - Should redirect to dashboard
   - Protected routes should require auth

### Next Steps
After basic auth is working:
1. Add admin permission checks
2. Set up organization system
3. Implement user roles
