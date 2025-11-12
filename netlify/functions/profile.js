/**
 * Profile API Netlify Function
 * Handles CRUD operations for profile collection
 * Note: Profile is a singleton - only one profile per user
 */

const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

// MongoDB connection
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  const client = await MongoClient.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = client.db('career-data');
  cachedDb = db;
  return db;
}

// Verify JWT token
function verifyAuth(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No authorization token provided');
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.AUTH_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

// Get profile (or create if doesn't exist)
async function getProfile(db) {
  const collection = db.collection('profile');
  let profile = await collection.findOne({});

  // If no profile exists, create a default one
  if (!profile) {
    const now = new Date();
    const defaultProfile = {
      personalInfo: {
        name: '',
        email: '',
        phone: '',
        location: '',
        links: {
          portfolio: '',
          github: '',
          linkedin: '',
          writingSamples: '',
        },
      },
      positioning: {
        current: '',
        byRole: {
          technical_writer: '',
          technical_writing_manager: '',
          software_engineer: '',
          engineering_manager: '',
        },
      },
      valuePropositions: [],
      professionalMission: '',
      uniqueSellingPoints: [],
      lastUpdated: now,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(defaultProfile);
    profile = { ...defaultProfile, _id: result.insertedId };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ profile }),
  };
}

// Update profile
async function updateProfile(event, db) {
  const data = JSON.parse(event.body);
  const collection = db.collection('profile');

  // Get existing profile or create ID for new one
  const existing = await collection.findOne({});
  const profileId = existing?._id;

  // Build update object
  const update = {
    lastUpdated: new Date(),
    updatedAt: new Date(),
  };

  // Update allowed fields
  const allowedFields = [
    'personalInfo',
    'positioning',
    'valuePropositions',
    'professionalMission',
    'uniqueSellingPoints',
  ];

  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      update[field] = data[field];
    }
  });

  let result;
  if (profileId) {
    // Update existing profile
    result = await collection.updateOne(
      { _id: profileId },
      { $set: update }
    );
  } else {
    // Create new profile
    update.createdAt = new Date();
    result = await collection.insertOne(update);
  }

  const profile = await collection.findOne({});

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: 'Profile updated successfully',
      profile,
    }),
  };
}

// Delete profile (reset to default)
async function deleteProfile(db) {
  const collection = db.collection('profile');
  await collection.deleteMany({});

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ message: 'Profile deleted successfully' }),
  };
}

// Main handler
exports.handler = async (event) => {
  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Verify authentication
    verifyAuth(event.headers.authorization || event.headers.Authorization);

    // Connect to database
    const db = await connectToDatabase();

    // Route to appropriate handler based on method
    const method = event.httpMethod;

    // Get profile: GET /profile
    if (method === 'GET') {
      return await getProfile(db);
    }

    // Update profile: PUT /profile
    if (method === 'PUT') {
      return await updateProfile(event, db);
    }

    // Delete profile: DELETE /profile
    if (method === 'DELETE') {
      return await deleteProfile(db);
    }

    // If no route matched
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Route not found' }),
    };

  } catch (error) {
    console.error('Error:', error);

    // Handle authentication errors
    if (error.message.includes('token') || error.message.includes('authorization')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: error.message }),
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message }),
    };
  }
};
