import { createClient } from "redis";

const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on("error", (err) => console.log("Redis Client Error", err));

if (!process.env.NEXT_RUNTIME) {
  // Prevent connection during build
  redis.connect();
}

export default redis;
