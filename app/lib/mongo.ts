import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB ?? "a7satta";

// Cache the client across hot reloads in dev so we don't exhaust connections.
const globalForMongo = globalThis as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
};

function clientPromise(): Promise<MongoClient> {
  if (!globalForMongo._mongoClientPromise) {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 10000,
      retryWrites: true,
    });
    // Crucial: if the connection fails (e.g. a transient DNS blip resolving the
    // Atlas shard hosts), do NOT keep the rejected promise cached — otherwise
    // every later request reuses that same rejection and the whole site stays
    // down until the process restarts. Clearing it lets the next call retry.
    globalForMongo._mongoClientPromise = client.connect().catch((err) => {
      globalForMongo._mongoClientPromise = undefined;
      throw err;
    });
  }
  return globalForMongo._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  try {
    return (await clientPromise()).db(dbName);
  } catch {
    // One retry: the cache was just cleared above, so this opens a fresh
    // connection and rides out a momentary DNS/network hiccup instead of
    // surfacing it to the visitor. A real outage still throws on this attempt.
    return (await clientPromise()).db(dbName);
  }
}
