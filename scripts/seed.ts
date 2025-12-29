import { db } from '../src/lib/db'; // Adjust path if needed, usually we run with bun so imports work
import { tags, users, posts, postTags } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';
import { MAKES, MODELS, YEARS } from '../src/lib/constants';

async function main() {
  console.log('Seeding tags...');

  // Seed Years
  for (const year of YEARS) {
    await db.insert(tags).values({ name: year, type: 'year' }).onConflictDoNothing();
  }

  // Seed Makes
  for (const make of MAKES) {
    await db.insert(tags).values({ name: make, type: 'make' }).onConflictDoNothing();
  }

  // Seed Models (subset)
  for (const [make, models] of Object.entries(MODELS)) {
    for (const model of models) {
      await db.insert(tags).values({ name: model, type: 'model' }).onConflictDoNothing();
    }
  }

  // Seed a demo user
  const demoUserEmail = 'demo@example.com';
  // Delete existing if any to ensure we get the fixed ID
  await db.delete(users).where(eq(users.email, demoUserEmail));

  // Create with fixed ID
  await db
    .insert(users)
    .values({
      id: '00000000-0000-0000-0000-000000000000',
      name: 'Demo User',
      email: demoUserEmail,
      karma: 100,
    })
    .onConflictDoNothing();

  console.log('Seeding complete!');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
