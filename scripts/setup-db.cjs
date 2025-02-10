#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function setupDatabase() {
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is not set');
    }

    const client = new MongoClient(process.env.MONGODB_URI);

    try {
        console.log('Connecting to MongoDB...');
        await client.connect();
        console.log('Connected successfully');

        const db = client.db();

        // Create collections if they don't exist
        const collections = await db.collections();
        const collectionNames = collections.map(c => c.collectionName);

        // Organizations collection
        if (!collectionNames.includes('organizations')) {
            console.log('Creating organizations collection...');
            await db.createCollection('organizations');
            console.log('Created organizations collection');
        }

        // Organization members collection
        if (!collectionNames.includes('organizationmembers')) {
            console.log('Creating organization members collection...');
            await db.createCollection('organizationmembers');
            console.log('Created organization members collection');
        }

        // Organization invites collection
        if (!collectionNames.includes('organizationinvites')) {
            console.log('Creating organization invites collection...');
            await db.createCollection('organizationinvites');
            console.log('Created organization invites collection');
        }

        // Join requests collection
        if (!collectionNames.includes('joinrequests')) {
            console.log('Creating join requests collection...');
            await db.createCollection('joinrequests');
            console.log('Created join requests collection');
        }

        // Create indexes
        console.log('Creating indexes...');
        
        // Organizations indexes
        await db.collection('organizations').createIndex({ discordGuildId: 1 }, { unique: true });
        await db.collection('organizations').createIndex({ ownerId: 1 });
        await db.collection('organizations').createIndex({ createdAt: -1 });
        await db.collection('organizations').createIndex({ updatedAt: -1 });
        await db.collection('organizations').createIndex({ 'members.discordUserId': 1 });

        // Organization members indexes
        await db.collection('organizationmembers').createIndex(
            { organizationId: 1, discordUserId: 1 },
            { unique: true }
        );
        await db.collection('organizationmembers').createIndex({ joinedAt: -1 });

        // Organization invites indexes
        await db.collection('organizationinvites').createIndex({ code: 1 }, { unique: true });
        await db.collection('organizationinvites').createIndex({ organizationId: 1 });
        await db.collection('organizationinvites').createIndex({ expiresAt: 1 });
        await db.collection('organizationinvites').createIndex({ isActive: 1 });
        await db.collection('organizationinvites').createIndex({ createdAt: -1 });

        // Join requests indexes
        await db.collection('joinrequests').createIndex(
            { organizationId: 1, discordUserId: 1, status: 1 }
        );
        await db.collection('joinrequests').createIndex({ status: 1 });
        await db.collection('joinrequests').createIndex({ createdAt: -1 });

        console.log('Successfully created all indexes');

        // Update existing documents to ensure they have all required fields
        console.log('Updating existing documents...');
        
        const organizations = await db.collection('organizations').find({}).toArray();
        for (const org of organizations) {
            const updates = {};

            // Ensure members array exists
            if (!org.members) {
                updates.members = [];
            }

            // Ensure roles map exists
            if (!org.roles) {
                updates.roles = {};
            }

            // Ensure settings exist
            if (!org.settings) {
                updates.settings = {
                    profitSharing: {
                        defaultShare: 100,
                        method: 'equal'
                    }
                };
            }

            if (Object.keys(updates).length > 0) {
                await db.collection('organizations').updateOne(
                    { _id: org._id },
                    { $set: updates }
                );
            }
        }

        console.log('Successfully updated existing documents');
        console.log('Database setup complete');

    } catch (error) {
        console.error('Error setting up database:', error);
        process.exit(1);
    } finally {
        await client.close();
    }
}

setupDatabase().catch(console.error);
