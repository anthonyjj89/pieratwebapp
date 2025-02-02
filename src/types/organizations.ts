export interface Organization {
    id: string;
    name: string;
    description?: string;
    discordGuildId: string;
    createdAt: Date;
    updatedAt: Date;
    ownerId: string;
    settings: {
        profitSharing: {
            defaultShare: number;
            method: 'equal' | 'role' | 'contribution';
        };
    };
}

export interface CreateOrganizationInput {
    name: string;
    description?: string;
    discordGuildId: string;
    settings?: {
        profitSharing?: {
            defaultShare?: number;
            method?: 'equal' | 'role' | 'contribution';
        };
    };
}

export interface OrganizationMember {
    id: string;
    organizationId: string;
    userId: string;
    role: 'owner' | 'admin' | 'member';
    joinedAt: Date;
    settings?: {
        profitShare?: number;
    };
}

export interface OrganizationInvite {
    id: string;
    organizationId: string;
    code: string;
    createdBy: string;
    createdAt: Date;
    expiresAt?: Date;
    maxUses?: number;
    uses: number;
}

export interface ApiResponse<T> {
    data?: T;
    error?: string;
}
