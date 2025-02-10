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

// MongoDB document type
export interface MongoOrganization extends Omit<Organization, 'id' | 'roles'> {
    _id: ObjectId;
    roles: Map<string, { ratio: number }> | { [key: string]: { ratio: number } };
}

// Helper function to convert MongoDB document to client-safe object
export function toClientOrganization(org: MongoOrganization): Omit<Organization, '_id'> & { id: string } {
    const { _id, roles, members, ...rest } = org;

    // Convert Map to plain object for roles
    const rolesObj = roles instanceof Map ? 
        Object.fromEntries(roles) : 
        (typeof roles === 'object' ? roles : {});

    // Ensure members have userId set for backward compatibility
    const processedMembers = members?.map((member: OrganizationMember) => ({
        ...member,
        userId: member.userId || member.discordUserId,
        role: member.role || 'member',
        joinedAt: member.joinedAt || new Date(),
        settings: member.settings || {}
    })) || [];

    return {
        ...rest,
        id: _id.toString(),
        roles: rolesObj,
        members: processedMembers
    };
}

// Helper function to convert MongoDB document to client-safe member
export function toClientMember(member: OrganizationMember): OrganizationMember {
    return {
        ...member,
        userId: member.discordUserId // Ensure userId is set for backward compatibility
    };
}
