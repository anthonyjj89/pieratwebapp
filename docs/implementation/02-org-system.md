# Organization System Implementation

## Overview
This guide details the implementation of the organization system, including creation by Discord admins, member management, and role permissions.

## Prerequisites
- Authentication system from [01-auth-setup.md](./01-auth-setup.md) must be implemented
- MongoDB connection set up
- Discord OAuth with `guilds` and `guilds.members.read` scopes

## Steps

### 1. Database Schema
Create `src/models/Organization.ts`:
```typescript
import { ObjectId } from 'mongodb';

export interface Organization {
  _id: ObjectId;
  name: string;
  discordServerId: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string; // Discord user ID of creator
  settings: {
    allowJoinRequests: boolean;
    autoApproveMembers: boolean;
    defaultRole: string;
  };
  roles: {
    name: string;
    permissions: string[];
  }[];
}

export interface OrganizationMember {
  _id: ObjectId;
  organizationId: ObjectId;
  userId: string; // Discord user ID
  roles: string[];
  joinedAt: Date;
  status: 'pending' | 'active' | 'inactive';
}

export interface JoinRequest {
  _id: ObjectId;
  organizationId: ObjectId;
  userId: string; // Discord user ID
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
}
```

### 2. Discord Admin Check Utility
Create `src/lib/discord.ts`:
```typescript
interface DiscordGuild {
  id: string;
  name: string;
  owner: boolean;
  permissions: string;
}

export async function getUserGuilds(accessToken: string): Promise<DiscordGuild[]> {
  const response = await fetch('https://discord.com/api/users/@me/guilds', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.json();
}

export function isGuildAdmin(guild: DiscordGuild): boolean {
  const ADMINISTRATOR = 0x8;
  const permissions = BigInt(guild.permissions);
  return guild.owner || (permissions & BigInt(ADMINISTRATOR)) === BigInt(ADMINISTRATOR);
}

export async function getAdminGuilds(accessToken: string): Promise<DiscordGuild[]> {
  const guilds = await getUserGuilds(accessToken);
  return guilds.filter(isGuildAdmin);
}
```

### 3. Organization Creation API
Create `src/app/api/organizations/route.ts`:
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getAdminGuilds } from '@/lib/discord';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { name, discordServerId } = await req.json();

  // Verify user is admin of the server
  const adminGuilds = await getAdminGuilds(session.accessToken);
  const isAdmin = adminGuilds.some(guild => guild.id === discordServerId);
  
  if (!isAdmin) {
    return new Response('Not a server admin', { status: 403 });
  }

  const client = await clientPromise;
  const db = client.db();

  // Check if org already exists for this server
  const existing = await db.collection('organizations').findOne({ discordServerId });
  if (existing) {
    return new Response('Organization already exists for this server', { status: 400 });
  }

  // Create organization
  const org = {
    _id: new ObjectId(),
    name,
    discordServerId,
    createdAt: new Date(),
    updatedAt: new Date(),
    ownerId: session.user.id,
    settings: {
      allowJoinRequests: true,
      autoApproveMembers: false,
      defaultRole: 'member',
    },
    roles: [
      {
        name: 'admin',
        permissions: ['manage_org', 'manage_members', 'manage_roles'],
      },
      {
        name: 'member',
        permissions: ['view_reports', 'create_reports'],
      },
    ],
  };

  await db.collection('organizations').insertOne(org);

  // Add creator as admin member
  await db.collection('organization_members').insertOne({
    organizationId: org._id,
    userId: session.user.id,
    roles: ['admin'],
    joinedAt: new Date(),
    status: 'active',
  });

  return new Response(JSON.stringify(org), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
}
```

### 4. Join Request System
Create `src/app/api/organizations/[id]/join/route.ts`:
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db();

  const orgId = new ObjectId(params.id);
  const org = await db.collection('organizations').findOne({ _id: orgId });
  
  if (!org) {
    return new Response('Organization not found', { status: 404 });
  }

  // Check if already a member
  const existingMember = await db.collection('organization_members').findOne({
    organizationId: orgId,
    userId: session.user.id,
  });

  if (existingMember) {
    return new Response('Already a member', { status: 400 });
  }

  // Check for existing request
  const existingRequest = await db.collection('join_requests').findOne({
    organizationId: orgId,
    userId: session.user.id,
    status: 'pending',
  });

  if (existingRequest) {
    return new Response('Request already pending', { status: 400 });
  }

  // Create join request
  const request = {
    organizationId: orgId,
    userId: session.user.id,
    requestedAt: new Date(),
    status: 'pending',
  };

  await db.collection('join_requests').insertOne(request);

  return new Response(JSON.stringify(request), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
}
```

### 5. Organization Creation UI
Create `src/app/dashboard/organizations/new/page.tsx`:
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getAdminGuilds } from '@/lib/discord';

export default function NewOrganizationPage() {
  const { data: session } = useSession({ required: true });
  const [adminGuilds, setAdminGuilds] = useState([]);
  const [name, setName] = useState('');
  const [selectedServer, setSelectedServer] = useState('');

  useEffect(() => {
    if (session?.accessToken) {
      getAdminGuilds(session.accessToken).then(setAdminGuilds);
    }
  }, [session]);

  async function handleSubmit(e) {
    e.preventDefault();
    
    const response = await fetch('/api/organizations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        discordServerId: selectedServer,
      }),
    });

    if (response.ok) {
      // Redirect to org dashboard
      const org = await response.json();
      router.push(`/dashboard/organizations/${org._id}`);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create Organization</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">Organization Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-2">Discord Server</label>
          <select
            value={selectedServer}
            onChange={(e) => setSelectedServer(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select a server...</option>
            {adminGuilds.map((guild) => (
              <option key={guild.id} value={guild.id}>
                {guild.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          Create Organization
        </button>
      </form>
    </div>
  );
}
```

### 6. Join Request UI
Create `src/app/dashboard/organizations/[id]/join/page.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function JoinOrganizationPage() {
  const params = useParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleJoinRequest() {
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/organizations/${params.id}/join`, {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/dashboard');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <h1 className="text-2xl font-bold mb-6">Join Organization</h1>
      <p className="mb-4">
        Request to join this organization. An admin will review your request.
      </p>
      <button
        onClick={handleJoinRequest}
        disabled={isSubmitting}
        className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Request to Join'}
      </button>
    </div>
  );
}
```

### 7. Testing
1. Create Discord application with required scopes
2. Set up environment variables
3. Test organization creation:
   - Sign in as server admin
   - Create organization
   - Verify MongoDB entries
4. Test join requests:
   - Sign in as regular user
   - Submit join request
   - Verify request in database

### Next Steps
1. Implement request approval/rejection UI
2. Add role management
3. Set up member permissions system
4. Create organization settings page
