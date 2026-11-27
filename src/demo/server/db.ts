// MongoDB connection for the demo (server only). If MONGODB_URI isn't set,
// the store falls back to memory, so the app still runs with no setup.
import { MongoClient, type Collection, type Db } from 'mongodb';

import type { ChatMessage } from '../types';

export interface StoredMessage extends ChatMessage {
  _id: string;
  roomId: string;
}

export interface StoredState<T> {
  _id: string;
  version: number;
  internal: T;
}

interface Usage {
  _id: string; // YYYY-MM-DD
  count: number;
}

const g = globalThis as unknown as {
  __lingualinkMongo?: Promise<Db>;
  __lingualinkMemUsage?: Record<string, number>;
};

export const ROOM_ID = 'line-2';
export const STATE_ID = 'demo';

export function mongoEnabled() {
  return !!process.env.MONGODB_URI;
}

export function getDb(): Promise<Db> {
  if (!g.__lingualinkMongo) {
    const client = new MongoClient(process.env.MONGODB_URI!, { serverSelectionTimeoutMS: 5000, ignoreUndefined: true });
    g.__lingualinkMongo = client
      .connect()
      .then(async (c) => {
        const db = c.db(process.env.MONGODB_DB || 'lingualink');
        await db.collection('messages').createIndex({ roomId: 1, createdAt: -1 });
        return db;
      })
      .catch((e) => {
        g.__lingualinkMongo = undefined; // try again on the next request
        throw e;
      });
  }
  return g.__lingualinkMongo;
}

export async function messagesCol(): Promise<Collection<StoredMessage>> {
  return (await getDb()).collection<StoredMessage>('messages');
}

export async function stateCol<T>(): Promise<Collection<StoredState<T>>> {
  return (await getDb()).collection<StoredState<T>>('state');
}

/** Counts AI calls per day; returns false once the daily cap is reached (protects the API bill). */
export async function takeAiCall(): Promise<boolean> {
  const cap = Number(process.env.AI_DAILY_CAP || 1500);
  const day = new Date().toISOString().slice(0, 10);
  if (!mongoEnabled()) {
    const mem = (g.__lingualinkMemUsage ??= {});
    mem[day] = (mem[day] ?? 0) + 1;
    return mem[day] <= cap;
  }
  try {
    const col = (await getDb()).collection<Usage>('usage');
    const doc = await col.findOneAndUpdate({ _id: day }, { $inc: { count: 1 } }, { upsert: true, returnDocument: 'after' });
    return (doc?.count ?? 0) <= cap;
  } catch {
    return true;
  }
}
