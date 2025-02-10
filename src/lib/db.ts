import mongoose from 'mongoose';

declare global {
    // eslint-disable-next-line no-var
    var mongooseDb: {
        conn: mongoose.Connection | null;
        promise: Promise<mongoose.Connection> | null;
    } | undefined;
}

if (!process.env.MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const MONGODB_URI = process.env.MONGODB_URI;

interface CachedConnection {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
}

const cached: CachedConnection = global.mongooseDb || { conn: null, promise: null };

if (!global.mongooseDb) {
    global.mongooseDb = cached;
}

async function dbConnect(): Promise<mongoose.Connection> {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            return mongoose.connection;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default dbConnect;
