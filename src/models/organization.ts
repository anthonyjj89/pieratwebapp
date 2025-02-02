import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
    id: String,
    name: String,
    description: String,
    discordGuildId: String,
    createdAt: Date,
    updatedAt: Date,
    ownerId: String,
    settings: {
        profitSharing: {
            defaultShare: Number,
            method: {
                type: String,
                enum: ['equal', 'role', 'contribution'],
                default: 'equal'
            }
        }
    }
});

const memberSchema = new mongoose.Schema({
    id: String,
    organizationId: String,
    userId: String,
    role: {
        type: String,
        enum: ['owner', 'admin', 'member'],
        default: 'member'
    },
    joinedAt: Date,
    settings: {
        profitShare: Number
    }
});

const inviteSchema = new mongoose.Schema({
    id: String,
    organizationId: String,
    code: String,
    createdBy: String,
    createdAt: Date,
    expiresAt: Date,
    maxUses: Number,
    uses: Number
});

export const Organization = mongoose.models.Organization || mongoose.model('Organization', organizationSchema);
export const OrganizationMember = mongoose.models.OrganizationMember || mongoose.model('OrganizationMember', memberSchema);
export const OrganizationInvite = mongoose.models.OrganizationInvite || mongoose.model('OrganizationInvite', inviteSchema);
