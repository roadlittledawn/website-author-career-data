/**
 * Skills API Netlify Function
 * Handles CRUD operations for skills collection
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

// List all skill categories with optional filters
async function listSkills(event, db) {
  const params = event.queryStringParameters || {};
  const query = {};

  // Filter by category
  if (params.category) {
    query.category = { $regex: params.category, $options: 'i' };
  }

  // Filter by roleRelevance
  if (params.roleType) {
    query.roleRelevance = params.roleType;
  }

  // Text search
  if (params.search) {
    query.$or = [
      { category: { $regex: params.search, $options: 'i' } },
      { 'skills.name': { $regex: params.search, $options: 'i' } },
    ];
  }

  const collection = db.collection('skills');
  const skills = await collection
    .find(query)
    .sort({ displayOrder: 1, category: 1 })
    .toArray();

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ skills }),
  };
}

// Get single skill category by ID
async function getSkill(skillId, db) {
  if (!ObjectId.isValid(skillId)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid skill ID' }),
    };
  }

  const collection = db.collection('skills');
  const skill = await collection.findOne({ _id: new ObjectId(skillId) });

  if (!skill) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Skill category not found' }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ skill }),
  };
}

// Create new skill category
async function createSkill(event, db) {
  const data = JSON.parse(event.body);

  // Validate required fields
  if (!data.category || !data.roleRelevance || !data.skills) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'Missing required fields: category, roleRelevance, skills'
      }),
    };
  }

  const collection = db.collection('skills');
  const now = new Date();

  const skillCategory = {
    category: data.category,
    roleRelevance: data.roleRelevance,
    skills: data.skills.map(skill => ({
      name: skill.name,
      proficiency: skill.proficiency || undefined,
      yearsUsed: skill.yearsUsed || undefined,
      lastUsed: skill.lastUsed ? new Date(skill.lastUsed) : undefined,
      keywords: skill.keywords || [],
      featured: skill.featured || false,
    })),
    displayOrder: data.displayOrder || 0,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(skillCategory);

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify({
      message: 'Skill category created successfully',
      skillId: result.insertedId,
      skill: { ...skillCategory, _id: result.insertedId },
    }),
  };
}

// Update existing skill category
async function updateSkill(skillId, event, db) {
  if (!ObjectId.isValid(skillId)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid skill ID' }),
    };
  }

  const data = JSON.parse(event.body);
  const collection = db.collection('skills');

  // Check if skill category exists
  const existing = await collection.findOne({ _id: new ObjectId(skillId) });
  if (!existing) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Skill category not found' }),
    };
  }

  // Build update object
  const update = {
    updatedAt: new Date(),
  };

  // Update allowed fields
  const allowedFields = ['category', 'roleRelevance', 'skills', 'displayOrder'];

  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      if (field === 'skills') {
        // Process skills array
        update[field] = data[field].map(skill => ({
          name: skill.name,
          proficiency: skill.proficiency || undefined,
          yearsUsed: skill.yearsUsed || undefined,
          lastUsed: skill.lastUsed ? new Date(skill.lastUsed) : undefined,
          keywords: skill.keywords || [],
          featured: skill.featured || false,
        }));
      } else {
        update[field] = data[field];
      }
    }
  });

  const result = await collection.updateOne(
    { _id: new ObjectId(skillId) },
    { $set: update }
  );

  if (result.modifiedCount === 0) {
    return {
      statusCode: 304,
      headers,
      body: JSON.stringify({ message: 'No changes made' }),
    };
  }

  const updated = await collection.findOne({ _id: new ObjectId(skillId) });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: 'Skill category updated successfully',
      skill: updated,
    }),
  };
}

// Delete skill category
async function deleteSkill(skillId, db) {
  if (!ObjectId.isValid(skillId)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid skill ID' }),
    };
  }

  const collection = db.collection('skills');
  const result = await collection.deleteOne({ _id: new ObjectId(skillId) });

  if (result.deletedCount === 0) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Skill category not found' }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ message: 'Skill category deleted successfully' }),
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
    const skillId = pathParts[pathParts.length - 1];

    // Route to appropriate handler based on method and path
    const method = event.httpMethod;

    // List skills: GET /skills
    if (method === 'GET' && (!skillId || skillId === 'skills')) {
      return await listSkills(event, db);
    }

    // Get single skill: GET /skills/:id
    if (method === 'GET' && skillId && skillId !== 'skills') {
      return await getSkill(skillId, db);
    }

    // Create skill: POST /skills
    if (method === 'POST') {
      return await createSkill(event, db);
    }

    // Update skill: PUT /skills/:id
    if (method === 'PUT' && skillId && skillId !== 'skills') {
      return await updateSkill(skillId, event, db);
    }

    // Delete skill: DELETE /skills/:id
    if (method === 'DELETE' && skillId && skillId !== 'skills') {
      return await deleteSkill(skillId, db);
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
