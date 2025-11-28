# Database Migrations

This directory contains MongoDB migration scripts for the career-data database.

## Running Migrations

### Prerequisites

- Node.js installed
- `.env` file configured with `MONGODB_URI` and `MONGODB_DB_NAME`
- MongoDB connection access

### Execute a Migration

```bash
node migrations/remove-bullet-points.js
```

## Available Migrations

### remove-bullet-points.js

**Date:** 2025-11-28

**Purpose:** Removes the `bulletPoints` field from all documents in the `experiences` collection.

**Reason:** The bulletPoints field was duplicative of Key Responsibilities and Key Achievements. AI agents now generate bullet points from these two fields instead.

**Usage:**

```bash
node migrations/remove-bullet-points.js
```

**What it does:**
- Connects to MongoDB using environment variables
- Counts documents with `bulletPoints` field
- Removes `bulletPoints` field from all matching documents
- Reports migration results

### remove-writing-sample-field.js

**Date:** 2025-11-28

**Purpose:** Removes the `writingSample` field from projects collection and consolidates into `links` array.

**Reason:** Simplifies data model by using a single flexible `links` array for all project links (GitHub, demos, writing samples, etc.) instead of separate fields.

**Usage:**

```bash
node migrations/remove-writing-sample-field.js
```

**What it does:**
- Migrates existing writingSample data to links array with type 'writing_sample'
- Updates links structure from `{type, url, description}` to `{url, linkText, type}`
- Removes writingSample field from all documents
- Reports migration results

## Migration Best Practices

1. **Backup First:** Always backup your database before running migrations
2. **Test Locally:** Run migrations on a development database first
3. **Review Output:** Check the migration output for expected results
4. **Verify:** Manually verify a few documents after migration

## Creating New Migrations

When creating a new migration:

1. Create a descriptive filename: `YYYY-MM-DD-description.js`
2. Include a header comment with date and purpose
3. Use environment variables for connection
4. Add error handling and logging
5. Document the migration in this README
