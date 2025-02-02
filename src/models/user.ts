import mongoose from 'mongoose';

export interface DiscordGuild {
    id: string;
    name: string;
    icon: string | null;
    owner: boolean;
    permissions: string;
    features: string[];
}

const userSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        unique: true
    },
    emailVerified: Date,
    image: String,
    discordId: {
        type: String,
        required: true,
        unique: true,
        sparse: true
    },
    discordGuilds: [{
        id: String,
        name: String,
        icon: String,
        owner: Boolean,
        permissions: String,
        features: [String]
    }]
}, {
    timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ discordId: 1 });

export interface UserDocument extends mongoose.Document {
    name?: string | null;
    email?: string | null;
    emailVerified?: Date | null;
    image?: string | null;
    discordId: string;
    discordGuilds?: DiscordGuild[];
}

export const User = mongoose.models.User || mongoose.model<UserDocument>('User', userSchema);
