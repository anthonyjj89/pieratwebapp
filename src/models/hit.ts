import mongoose from 'mongoose';

const cargoSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    value: {
        type: Number,
        required: true
    }
});

const participantSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    organizationId: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    profitShare: {
        type: Number,
        required: true
    }
});

const hitReportSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    targetId: {
        type: String,
        required: true
    },
    organizationId: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    cargo: {
        type: [cargoSchema],
        required: true,
        default: []
    },
    participants: {
        type: [participantSchema],
        required: true,
        default: []
    },
    totalValue: {
        type: Number,
        required: true,
        default: 0
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        required: true
    },
    profitDistribution: {
        method: {
            type: String,
            enum: ['equal', 'role', 'contribution'],
            default: 'equal',
            required: true
        },
        shares: [{
            userId: {
                type: String,
                required: true
            },
            amount: {
                type: Number,
                required: true
            },
            percentage: {
                type: Number,
                required: true
            },
            status: {
                type: String,
                enum: ['pending', 'paid'],
                default: 'pending',
                required: true
            }
        }]
    },
    metadata: {
        submittedBy: String,
        approvedBy: String,
        approvedAt: Date,
        notes: String
    }
});

// Virtual for total cargo value
hitReportSchema.virtual('totalCargoValue').get(function() {
    return this.cargo.reduce((total, item) => total + (item.value || 0), 0);
});

// Pre-save hook to calculate total value
hitReportSchema.pre('save', function(next) {
    this.totalValue = this.cargo.reduce((total, item) => total + (item.value || 0), 0);
    next();
});

export const HitReport = mongoose.models.HitReport || mongoose.model('HitReport', hitReportSchema);
export const Cargo = mongoose.models.Cargo || mongoose.model('Cargo', cargoSchema);
export const Participant = mongoose.models.Participant || mongoose.model('Participant', participantSchema);
