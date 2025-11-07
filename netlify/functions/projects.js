/**
 * Projects API Netlify Function
 * Handles CRUD operations for projects collection
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

// List all projects with optional filters
async function listProjects(event, db) {
  const params = event.queryStringParameters || {};
  const query = {};

  // Filter by type
  if (params.type) {
    query.type = params.type;
  }

  // Filter by featured
  if (params.featured !== undefined) {
    query.featured = params.featured === 'true';
  }

  // Filter by roleTypes
  if (params.roleType) {
    query.roleTypes = params.roleType;
  }

  // Text search by name
  if (params.search) {
    query.name = { $regex: params.search, $options: 'i' };
  }

  const collection = db.collection('projects');
  const projects = await collection
    .find(query)
    .sort({ date: -1, createdAt: -1 })
    .toArray();

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ projects }),
  };
}

// Get single project by ID
async function getProject(projectId, db) {
  if (!ObjectId.isValid(projectId)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid project ID' }),
    };
  }

  const collection = db.collection('projects');
  const project = await collection.findOne({ _id: new ObjectId(projectId) });

  if (!project) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Project not found' }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ project }),
  };
}

// Create new project
async function createProject(event, db) {
  const data = JSON.parse(event.body);

  // Validate required fields
  if (!data.name || !data.type || !data.overview || !data.technologies || !data.roleTypes) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing required fields: name, type, overview, technologies, roleTypes' }),
    };
  }

  // Validate type
  const validTypes = ['technical_writing', 'software_engineering', 'leadership', 'hybrid'];
  if (!validTypes.includes(data.type)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid project type' }),
    };
  }

  const collection = db.collection('projects');
  const now = new Date();

  const project = {
    name: data.name,
    type: data.type,
    date: data.date ? new Date(data.date) : undefined,
    featured: data.featured || false,
    overview: data.overview,
    challenge: data.challenge,
    approach: data.approach,
    outcome: data.outcome,
    impact: data.impact,
    technologies: data.technologies,
    keywords: data.keywords || [],
    links: data.links || [],
    roleTypes: data.roleTypes,
    writingSample: data.writingSample,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(project);

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify({
      message: 'Project created successfully',
      projectId: result.insertedId,
      project: { ...project, _id: result.insertedId },
    }),
  };
}

// Update existing project
async function updateProject(projectId, event, db) {
  if (!ObjectId.isValid(projectId)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid project ID' }),
    };
  }

  const data = JSON.parse(event.body);
  const collection = db.collection('projects');

  // Check if project exists
  const existing = await collection.findOne({ _id: new ObjectId(projectId) });
  if (!existing) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Project not found' }),
    };
  }

  // Build update object
  const update = {
    updatedAt: new Date(),
  };

  // Update allowed fields
  const allowedFields = [
    'name', 'type', 'date', 'featured', 'overview', 'challenge',
    'approach', 'outcome', 'impact', 'technologies', 'keywords',
    'links', 'roleTypes', 'writingSample'
  ];

  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      if (field === 'date' && data[field]) {
        update[field] = new Date(data[field]);
      } else {
        update[field] = data[field];
      }
    }
  });

  const result = await collection.updateOne(
    { _id: new ObjectId(projectId) },
    { $set: update }
  );

  if (result.modifiedCount === 0) {
    return {
      statusCode: 304,
      headers,
      body: JSON.stringify({ message: 'No changes made' }),
    };
  }

  const updated = await collection.findOne({ _id: new ObjectId(projectId) });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: 'Project updated successfully',
      project: updated,
    }),
  };
}

// Delete project
async function deleteProject(projectId, db) {
  if (!ObjectId.isValid(projectId)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid project ID' }),
    };
  }

  const collection = db.collection('projects');
  const result = await collection.deleteOne({ _id: new ObjectId(projectId) });

  if (result.deletedCount === 0) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Project not found' }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ message: 'Project deleted successfully' }),
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
    const projectId = pathParts[pathParts.length - 1];

    // Route to appropriate handler based on method and path
    const method = event.httpMethod;

    // List projects: GET /projects
    if (method === 'GET' && (!projectId || projectId === 'projects')) {
      return await listProjects(event, db);
    }

    // Get single project: GET /projects/:id
    if (method === 'GET' && projectId && projectId !== 'projects') {
      return await getProject(projectId, db);
    }

    // Create project: POST /projects
    if (method === 'POST') {
      return await createProject(event, db);
    }

    // Update project: PUT /projects/:id
    if (method === 'PUT' && projectId && projectId !== 'projects') {
      return await updateProject(projectId, event, db);
    }

    // Delete project: DELETE /projects/:id
    if (method === 'DELETE' && projectId && projectId !== 'projects') {
      return await deleteProject(projectId, db);
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
