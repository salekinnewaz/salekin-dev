import { PrismaClient } from '@prisma/client';

let testDb: PrismaClient | undefined;

/** Each test file gets a fresh client bound to test.db. */
export function getTestDb(): PrismaClient {
  if (!testDb) {
    testDb = new PrismaClient({
      log: ['error'],
    });
  }
  return testDb;
}

export async function closeTestDb(): Promise<void> {
  if (testDb) {
    await testDb.$disconnect();
    testDb = undefined;
  }
}