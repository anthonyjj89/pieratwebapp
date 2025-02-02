import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    discordGuildId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    ownerId: {
        type: String,
        required: true,
        index: true
    },
    settings: {
        profitSharing: {
            defaultShare: {
                type: Number,
                required: true,
                default: 100,
                min: 0,
                max: 100
            },
            method: {
                type: String,
                enum: ['equal', 'role', 'contribution'],
                default: 'equal',
                required: true
            }
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
organizationSchema.index({ createdAt: -1 });
organizationSchema.index({ updatedAt: -1 });

const memberSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    discordUserId: {
        type: String,
        required: true,
        index: true
    },
    role: {
        type: String,
        enum: ['owner', 'admin', 'member'],
        default: 'member',
        required: true
    },
    settings: {
        profitShare: {
            type: Number,
            min: 0,
            max: 100
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Compound index for unique membership
memberSchema.index({ organizationId: 1, discordUserId: 1 }, { unique: true });
memberSchema.index({ joinedAt: -1 });

const inviteSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    createdBy: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    },
    maxUses: {
        type: Number,
        default: 0 // 0 means unlimited
    },
    uses: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for checking if invite is valid
inviteSchema.virtual('isValid').get(function() {
    return this.isActive && 
           (!this.maxUses || this.uses < this.maxUses) && 
           new Date() < this.expiresAt;
});

// Indexes for invite lookups
inviteSchema.index({ createdAt: -1 });

// Request to join schema
const joinRequestSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    discordUserId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        required: true,
        index: true
    },
    respondedBy: {
        type: String
    },
    respondedAt: {
        type: Date
    },
    message: String
}, {
    timestamps: true
});

// Compound index for unique requests
joinRequestSchema.index({ organizationId: 1, discordUserId: 1, status: 1 });

export const Organization = mongoose.models.Organization || mongoose.model('Organization', organizationSchema);
export const OrganizationMember = mongoose.models.OrganizationMember || mongoose.model('OrganizationMember', memberSchema);
export const OrganizationInvite = mongoose.models.OrganizationInvite || mongoose.model('OrganizationInvite', inviteSchema);
export const JoinRequest = mongoose.models.JoinRequest || mongoose.model('JoinRequest', joinRequestSchema);
