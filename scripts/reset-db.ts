import { db } from "../src/lib/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Dropping schema public...");
  await db.execute(sql`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`);
  console.log("Database reset complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
