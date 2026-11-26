import mongoose from "mongoose";

const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/coolshop";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  _coolshopMongoose?: MongooseCache;
};

export async function connectDb() {
  if (!globalForMongoose._coolshopMongoose) {
    globalForMongoose._coolshopMongoose = { conn: null, promise: null };
  }
  const cache = globalForMongoose._coolshopMongoose;
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, { maxPoolSize: 10 });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}

export async function disconnectDb() {
  await mongoose.disconnect();
  if (globalForMongoose._coolshopMongoose) {
    globalForMongoose._coolshopMongoose.conn = null;
    globalForMongoose._coolshopMongoose.promise = null;
  }
}
