# Organization System Implementation

## Overview
This guide details the implementation of the organization system, including creation by Discord admins, member management, role permissions, and analytics.

## Prerequisites
- Authentication system from [01-auth-setup.md](./01-auth-setup.md) must be implemented
- MongoDB connection set up
- Discord OAuth with `guilds` and `guilds.members.read` scopes

## Steps

### 1. Database Schema
Create `src/types/organizations.ts`:
```typescript
import { ObjectId } from 'mongodb';

export interface OrganizationMember {
    userId: string; // For backward compatibility
    discordUserId: string;
    role: string; // Use custom roles defined by the organization
    joinedAt: Date;
    settings?: {
        profitShare?: number;
    };
}

export interface Organization {
    _id: ObjectId;
    id: string; // For client-side use
    name: string;
    description?: string;
    discordGuildId: string;
    ownerId: string;
    members: OrganizationMember[];
    roles: { // Define custom roles with profit sharing ratios
        [roleName: string]: {
            ratio: number;
        };
    };
    settings: {
        profitSharing: {
            defaultShare: number;
            method: 'equal' | 'role' | 'contribution';
        };
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateOrganizationInput {
    name: string;
    description?: string;
    discordGuildId: string;
    roles: { // Define custom roles with profit sharing ratios
        [roleName: string]: {
            ratio: number;
        };
    };
    settings: {
        profitSharing: {
            defaultShare: number;
            method: 'equal';
        };
    };
}

export interface JoinRequestStatus {
    _id: ObjectId;
    organizationId: ObjectId;
    discordUserId: string;
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: Date;
    respondedAt?: Date;
    respondedBy?: string;
    message?: string;
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
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAdminGuilds } from '@/lib/discord';
import { ObjectId } from 'mongodb';
import { CreateOrganizationInput } from '@/types/organizations';

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const input: CreateOrganizationInput = await request.json();

    // Verify user is admin of the server
    const adminGuilds = await getAdminGuilds(session.accessToken);
    const isAdmin = adminGuilds.some(guild => guild.id === input.discordGuildId);
    
    if (!isAdmin) {
        return NextResponse.json({ error: 'Not a server admin' }, { status: 403 });
    }

    const organization = {
        _id: new ObjectId(),
        ...input,
        ownerId: session.user.id,
        members: [{
            discordUserId: session.user.id,
            role: 'owner',
            joinedAt: new Date()
        }],
        createdAt: new Date(),
        updatedAt: new Date()
    };

    await db.collection('organizations').insertOne(organization);

    return NextResponse.json(organization);
}
```

### 4. Analytics System
Create `src/app/api/organizations/[id]/analytics/route.ts`:
```typescript
type Props = {
    params: Promise<{ id: string }>;
};

export async function GET(
    request: Request,
    { params }: Props
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const organization = await Organization.findOne({
            _id: new ObjectId(id),
            $or: [
                { ownerId: session.user.id },
                { 'members.discordUserId': session.user.discordId }
            ]
        });

        if (!organization) {
            return NextResponse.json(
                { error: 'Organization not found or not a member' },
                { status: 404 }
            );
        }

        // Calculate analytics
        const analyticsData: AnalyticsData = {
            totalMembers: organization.members.length,
            totalReports: await Report.countDocuments({ organizationId: new ObjectId(id) }),
            totalProfit: 0,
            profitByMember: new Map()
        };

        // Initialize profit for all members
        organization.members.forEach((member: OrganizationMember) => {
            analyticsData.profitByMember.set(member.discordUserId, 0);
        });

        // Calculate profits from reports
        const reports = await Report.find({ organizationId: new ObjectId(id) });
        reports.forEach(report => {
            analyticsData.totalProfit += report.profit;
            const profitPerParticipant = report.profit / report.participants.length;
            report.participants.forEach(participantId => {
                const currentProfit = analyticsData.profitByMember.get(participantId) || 0;
                analyticsData.profitByMember.set(participantId, currentProfit + profitPerParticipant);
            });
        });

        return NextResponse.json(toAnalyticsResponse(analyticsData));

    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
```

### 5. Organization Creation UI
Create `src/components/organizations/CreateOrgForm.tsx`:
```typescript
'use client';

import { useState, useEffect } from 'react';
import { CreateOrganizationInput } from '@/types/organizations';

interface CreateOrgFormProps {
    onSubmit: (data: CreateOrganizationInput) => Promise<void>;
}

export default function CreateOrgForm({ onSubmit }: CreateOrgFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [guilds, setGuilds] = useState<DiscordGuild[]>([]);
    const [selectedGuild, setSelectedGuild] = useState<string>('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    // Form submission handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGuild || !name) return;

        setLoading(true);
        setError(null);

        try {
            await onSubmit({
                name,
                description,
                discordGuildId: selectedGuild,
                settings: {
                    profitSharing: {
                        defaultShare: 100,
                        method: 'equal'
                    }
                }
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create organization');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form fields */}
        </form>
    );
}
```

### 6. Testing
1. Create Discord application with required scopes
2. Set up environment variables
3. Test organization creation:
   - Sign in as server admin
   - Create organization with profit sharing settings
   - Verify MongoDB entries
4. Test analytics:
   - Create test reports
   - Verify profit calculations
   - Check member profit distribution

### Next Steps
1. Implement request approval/rejection UI
2. Add role management
3. Set up member permissions system
4. Create organization settings page
5. Add profit sharing configuration UI
