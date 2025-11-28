/**
 * Migration: Remove writingSample field and update links structure in projects collection
 * Date: 2025-11-28
 * 
 * This migration:
 * 1. Removes the writingSample field from all documents
 * 2. Updates links structure from {type, url, description} to {url, linkText, type}
 * 3. Migrates any writingSample data to links array as writing_sample type
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
    const collection = db.collection('projects');

    // Get all projects
    const projects = await collection.find({}).toArray();
    console.log(`Found ${projects.length} projects to process`);

    let migratedCount = 0;
    let writingSamplesMigrated = 0;

    for (const project of projects) {
      const updates = {};
      let needsUpdate = false;

      // Migrate writingSample to links if it exists
      if (project.writingSample && project.writingSample.googleDocId) {
        const writingSampleLink = {
          url: `https://docs.google.com/document/d/${project.writingSample.googleDocId}`,
          linkText: project.writingSample.format || 'View Writing Sample',
          type: 'writing_sample'
        };

        const existingLinks = project.links || [];
        updates.links = [...existingLinks, writingSampleLink];
        needsUpdate = true;
        writingSamplesMigrated++;
        console.log(`  Migrating writingSample for project: ${project.name}`);
      }

      // Update links structure if they exist
      if (project.links && project.links.length > 0) {
        const updatedLinks = project.links.map(link => {
          // If already in new format, keep it
          if (link.linkText !== undefined) {
            return link;
          }
          // Convert old format to new format
          return {
            url: link.url,
            linkText: link.description || link.url,
            type: link.type === 'docs' ? 'other' : link.type
          };
        });
        updates.links = updatedLinks;
        needsUpdate = true;
      }

      // Remove writingSample field
      if (project.writingSample !== undefined) {
        updates.$unset = { writingSample: "" };
        needsUpdate = true;
      }

      // Apply updates
      if (needsUpdate) {
        const updateDoc = {};
        if (updates.links) {
          updateDoc.$set = { links: updates.links };
        }
        if (updates.$unset) {
          updateDoc.$unset = updates.$unset;
        }

        await collection.updateOne(
          { _id: project._id },
          updateDoc
        );
        migratedCount++;
      }
    }

    console.log(`\nMigration completed:`);
    console.log(`- Total projects processed: ${projects.length}`);
    console.log(`- Projects updated: ${migratedCount}`);
    console.log(`- Writing samples migrated to links: ${writingSamplesMigrated}`);

    // Verify removal
    const remainingWithWritingSample = await collection.countDocuments({ 
      writingSample: { $exists: true } 
    });
    console.log(`- Projects with writingSample after migration: ${remainingWithWritingSample}`);

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
