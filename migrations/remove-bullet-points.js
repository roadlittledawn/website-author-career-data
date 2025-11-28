/**
 * Migration: Remove bulletPoints field from experiences collection
 * Date: 2025-11-28
 * 
 * This migration removes the bulletPoints field from all documents
 * in the experiences collection as it's duplicative of Key Responsibilities
 * and Key Achievements.
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

async function migrate() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'career-data';

  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);
    const collection = db.collection('experiences');

    // Count documents with bulletPoints field
    const countBefore = await collection.countDocuments({ bulletPoints: { $exists: true } });
    console.log(`Found ${countBefore} documents with bulletPoints field`);

    if (countBefore === 0) {
      console.log('No documents to migrate');
      return;
    }

    // Remove bulletPoints field from all documents
    const result = await collection.updateMany(
      { bulletPoints: { $exists: true } },
      { $unset: { bulletPoints: "" } }
    );

    console.log(`Migration completed:`);
    console.log(`- Matched: ${result.matchedCount} documents`);
    console.log(`- Modified: ${result.modifiedCount} documents`);

    // Verify removal
    const countAfter = await collection.countDocuments({ bulletPoints: { $exists: true } });
    console.log(`Documents with bulletPoints after migration: ${countAfter}`);

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration
migrate()
  .then(() => {
    console.log('Migration successful');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration error:', error);
    process.exit(1);
  });
