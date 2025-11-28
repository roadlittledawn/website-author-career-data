/**
 * Experiences API Netlify Function
 * Handles CRUD operations for experiences collection
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

// List all experiences with optional filters
async function listExperiences(event, db) {
  const params = event.queryStringParameters || {};
  const query = {};

  // Filter by company
  if (params.company) {
    query.company = { $regex: params.company, $options: 'i' };
  }

  // Filter by featured
  if (params.featured !== undefined) {
    query.featured = params.featured === 'true';
  }

  // Filter by roleTypes
  if (params.roleType) {
    query.roleTypes = params.roleType;
  }

  // Text search
  if (params.search) {
    query.$or = [
      { company: { $regex: params.search, $options: 'i' } },
      { title: { $regex: params.search, $options: 'i' } },
    ];
  }

  const collection = db.collection('experiences');
  const experiences = await collection
    .find(query)
    .sort({ startDate: -1 })
    .toArray();

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ experiences }),
  };
}

// Get single experience by ID
async function getExperience(experienceId, db) {
  if (!ObjectId.isValid(experienceId)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid experience ID' }),
    };
  }

  const collection = db.collection('experiences');
  const experience = await collection.findOne({ _id: new ObjectId(experienceId) });

  console.log('Found experience:', experience ? 'YES' : 'NO');
  console.log('Experience _id:', experience?._id);

  if (!experience) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Experience not found' }),
    };
  }

  const responseBody = JSON.stringify({ experience });
  console.log('Response body length:', responseBody.length);
  console.log('Response body preview:', responseBody.substring(0, 200));

  return {
    statusCode: 200,
    headers,
    body: responseBody,
  };
}

// Create new experience
async function createExperience(event, db) {
  const data = JSON.parse(event.body);

  // Validate required fields
  if (!data.company || !data.location || !data.title || !data.startDate ||
      !data.roleTypes || !data.responsibilities || !data.technologies) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'Missing required fields: company, location, title, startDate, roleTypes, responsibilities, technologies'
      }),
    };
  }

  const collection = db.collection('experiences');
  const now = new Date();

  const experience = {
    company: data.company,
    location: data.location,
    title: data.title,
    industry: data.industry,
    startDate: new Date(data.startDate),
    endDate: data.endDate ? new Date(data.endDate) : null,
    organizations: data.organizations || [],
    roleTypes: data.roleTypes,
    responsibilities: data.responsibilities,
    achievements: data.achievements || [],
    technologies: data.technologies,
    crossFunctional: data.crossFunctional || [],
    displayOrder: data.displayOrder || 0,
    featured: data.featured || false,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(experience);

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify({
      message: 'Experience created successfully',
      experienceId: result.insertedId,
      experience: { ...experience, _id: result.insertedId },
    }),
  };
}

// Update existing experience
async function updateExperience(experienceId, event, db) {
  if (!ObjectId.isValid(experienceId)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid experience ID' }),
    };
  }

  const data = JSON.parse(event.body);
  const collection = db.collection('experiences');

  // Check if experience exists
  const existing = await collection.findOne({ _id: new ObjectId(experienceId) });
  if (!existing) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Experience not found' }),
    };
  }

  // Build update object
  const update = {
    updatedAt: new Date(),
  };

  // Update allowed fields
  const allowedFields = [
    'company', 'location', 'title', 'industry', 'startDate', 'endDate',
    'organizations', 'roleTypes', 'responsibilities', 'achievements',
    'technologies', 'crossFunctional', 'displayOrder', 'featured'
  ];

  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      if (field === 'startDate' && data[field]) {
        update[field] = new Date(data[field]);
      } else if (field === 'endDate' && data[field]) {
        update[field] = new Date(data[field]);
      } else {
        update[field] = data[field];
      }
    }
  });

  const result = await collection.updateOne(
    { _id: new ObjectId(experienceId) },
    { $set: update }
  );

  if (result.modifiedCount === 0) {
    return {
      statusCode: 304,
      headers,
      body: JSON.stringify({ message: 'No changes made' }),
    };
  }

  const updated = await collection.findOne({ _id: new ObjectId(experienceId) });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: 'Experience updated successfully',
      experience: updated,
    }),
  };
}

// Delete experience
async function deleteExperience(experienceId, db) {
  if (!ObjectId.isValid(experienceId)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid experience ID' }),
    };
  }

  const collection = db.collection('experiences');
  const result = await collection.deleteOne({ _id: new ObjectId(experienceId) });

  if (result.deletedCount === 0) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Experience not found' }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ message: 'Experience deleted successfully' }),
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

    // Parse the path to get the ID if present
    const path = event.path;
    const pathParts = path.split('/').filter(p => p);
    const experienceId = pathParts[pathParts.length - 1];

    // Route to appropriate handler based on method and path
    const method = event.httpMethod;

    // List experiences: GET /experiences
    if (method === 'GET' && (!experienceId || experienceId === 'experiences')) {
      return await listExperiences(event, db);
    }

    // Get single experience: GET /experiences/:id
    if (method === 'GET' && experienceId && experienceId !== 'experiences') {
      return await getExperience(experienceId, db);
    }

    // Create experience: POST /experiences
    if (method === 'POST') {
      return await createExperience(event, db);
    }

    // Update experience: PUT /experiences/:id
    if (method === 'PUT' && experienceId && experienceId !== 'experiences') {
      return await updateExperience(experienceId, event, db);
    }

    // Delete experience: DELETE /experiences/:id
    if (method === 'DELETE' && experienceId && experienceId !== 'experiences') {
      return await deleteExperience(experienceId, db);
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
