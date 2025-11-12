const { MongoClient, ObjectId } = require('mongodb');

const mongoClient = new MongoClient(process.env.MONGODB_URI);

async function connectToDatabase() {
  await mongoClient.connect();
  return mongoClient.db(process.env.MONGODB_DB_NAME);
}

// Verify JWT token
function verifyAuth(event) {
  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authorized: false, error: 'Missing or invalid authorization header' };
  }

  const token = authHeader.substring(7);
  if (token !== process.env.AUTH_TOKEN) {
    return { authorized: false, error: 'Invalid token' };
  }

  return { authorized: true };
}

// List all educations
async function listEducations(event, db) {
  const collection = db.collection('educations');

  // Parse query parameters
  const params = event.queryStringParameters || {};
  const query = {};

  // Optional filters
  if (params.institution) {
    query.institution = new RegExp(params.institution, 'i');
  }
  if (params.degree) {
    query.degree = new RegExp(params.degree, 'i');
  }
  if (params.field) {
    query.field = new RegExp(params.field, 'i');
  }
  if (params.graduationYear) {
    query.graduationYear = parseInt(params.graduationYear);
  }

  const educations = await collection.find(query).sort({ graduationYear: -1 }).toArray();

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ educations }),
  };
}

// Get a single education by ID
async function getEducation(event, db) {
  const id = event.path.split('/').pop();

  if (!ObjectId.isValid(id)) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Invalid education ID' }),
    };
  }

  const collection = db.collection('educations');
  const education = await collection.findOne({ _id: new ObjectId(id) });

  if (!education) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Education not found' }),
    };
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ education }),
  };
}

// Create a new education
async function createEducation(event, db) {
  const data = JSON.parse(event.body);

  // Validate required fields
  if (!data.institution || !data.degree || !data.field || !data.graduationYear) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        error: 'Missing required fields: institution, degree, field, graduationYear'
      }),
    };
  }

  const collection = db.collection('educations');
  const now = new Date();

  const education = {
    institution: data.institution,
    degree: data.degree,
    field: data.field,
    graduationYear: data.graduationYear,
    relevantCoursework: data.relevantCoursework || [],
    displayOrder: data.displayOrder || 0,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(education);

  return {
    statusCode: 201,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      education: { ...education, _id: result.insertedId },
      educationId: result.insertedId,
    }),
  };
}

// Update an education
async function updateEducation(event, db) {
  const id = event.path.split('/').pop();

  if (!ObjectId.isValid(id)) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Invalid education ID' }),
    };
  }

  const data = JSON.parse(event.body);
  const collection = db.collection('educations');

  const updateData = {
    ...data,
    updatedAt: new Date(),
  };

  // Remove fields that shouldn't be updated
  delete updateData._id;
  delete updateData.createdAt;

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateData },
    { returnDocument: 'after' }
  );

  if (!result) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Education not found' }),
    };
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ education: result }),
  };
}

// Delete an education
async function deleteEducation(event, db) {
  const id = event.path.split('/').pop();

  if (!ObjectId.isValid(id)) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Invalid education ID' }),
    };
  }

  const collection = db.collection('educations');
  const result = await collection.deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 0) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Education not found' }),
    };
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ message: 'Education deleted successfully' }),
  };
}

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
      body: '',
    };
  }

  // Verify authentication
  const authResult = verifyAuth(event);
  if (!authResult.authorized) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: authResult.error }),
    };
  }

  try {
    const db = await connectToDatabase();

    // Route based on HTTP method and path
    const method = event.httpMethod;
    const isIdPath = event.path.match(/\/educations\/[a-f0-9]{24}$/);

    if (method === 'GET' && !isIdPath) {
      return await listEducations(event, db);
    } else if (method === 'GET' && isIdPath) {
      return await getEducation(event, db);
    } else if (method === 'POST') {
      return await createEducation(event, db);
    } else if (method === 'PUT' && isIdPath) {
      return await updateEducation(event, db);
    } else if (method === 'DELETE' && isIdPath) {
      return await deleteEducation(event, db);
    }

    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Not found' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
