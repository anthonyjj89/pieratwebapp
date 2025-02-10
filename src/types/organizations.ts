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

// Helper function to convert MongoDB document to client-safe object
export function toClientOrganization(org: Organization): Omit<Organization, '_id'> & { id: string } {
    const { _id, ...rest } = org;
    return {
        ...rest,
        id: _id.toString()
    };
}

// Helper function to convert MongoDB document to client-safe member
export function toClientMember(member: OrganizationMember): OrganizationMember {
    return {
        ...member,
        userId: member.discordUserId // Ensure userId is set for backward compatibility
    };
}
