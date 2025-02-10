#!/usr/bin/env ts-node
const mongoose = require('mongoose');
const { Organization, OrganizationMember, OrganizationInvite, JoinRequest } = require('../src/models/organization');
async function setupDatabase() {
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is not set');
    }
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected successfully');
        // Wait for connection to be ready
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('Database connection not established');
        }
        // Create collections if they don't exist
        const collections = await db.collections();
        const collectionNames = collections.map(c => c.collectionName);
        // Organizations collection
        if (!collectionNames.includes('organizations')) {
            console.log('Creating organizations collection...');
            await Organization.createCollection();
            console.log('Created organizations collection');
        }
        // Organization members collection
        if (!collectionNames.includes('organizationmembers')) {
            console.log('Creating organization members collection...');
            await OrganizationMember.createCollection();
            console.log('Created organization members collection');
        }
        // Organization invites collection
        if (!collectionNames.includes('organizationinvites')) {
            console.log('Creating organization invites collection...');
            await OrganizationInvite.createCollection();
            console.log('Created organization invites collection');
        }
        // Join requests collection
        if (!collectionNames.includes('joinrequests')) {
            console.log('Creating join requests collection...');
            await JoinRequest.createCollection();
            console.log('Created join requests collection');
        }
        // Create indexes
        console.log('Creating indexes...');
        // Organizations indexes
        await Organization.collection.createIndex({ discordGuildId: 1 }, { unique: true });
        await Organization.collection.createIndex({ ownerId: 1 });
        await Organization.collection.createIndex({ createdAt: -1 });
        await Organization.collection.createIndex({ updatedAt: -1 });
        await Organization.collection.createIndex({ 'members.discordUserId': 1 });
        // Organization members indexes
        await OrganizationMember.collection.createIndex({ organizationId: 1, discordUserId: 1 }, { unique: true });
        await OrganizationMember.collection.createIndex({ joinedAt: -1 });
        // Organization invites indexes
        await OrganizationInvite.collection.createIndex({ code: 1 }, { unique: true });
        await OrganizationInvite.collection.createIndex({ organizationId: 1 });
        await OrganizationInvite.collection.createIndex({ expiresAt: 1 });
        await OrganizationInvite.collection.createIndex({ isActive: 1 });
        await OrganizationInvite.collection.createIndex({ createdAt: -1 });
        // Join requests indexes
        await JoinRequest.collection.createIndex({ organizationId: 1, discordUserId: 1, status: 1 });
        await JoinRequest.collection.createIndex({ status: 1 });
        await JoinRequest.collection.createIndex({ createdAt: -1 });
        console.log('Successfully created all indexes');
        // Update existing documents to ensure they have all required fields
        console.log('Updating existing documents...');
        const organizations = await Organization.find({});
        for (const org of organizations) {
            // Ensure members array exists
            if (!org.members) {
                org.members = [];
            }
            // Ensure roles map exists
            if (!org.roles) {
                org.roles = new Map();
            }
            // Ensure settings exist
            if (!org.settings) {
                org.settings = {
                    profitSharing: {
                        defaultShare: 100,
                        method: 'equal'
                    }
                };
            }
            await org.save();
        }
        console.log('Successfully updated existing documents');
        console.log('Database setup complete');
    }
    catch (error) {
        console.error('Error setting up database:', error);
        process.exit(1);
    }
    finally {
        await mongoose.disconnect();
    }
}
setupDatabase().catch(console.error);
