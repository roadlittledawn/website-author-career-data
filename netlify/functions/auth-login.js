const jwt = require('jsonwebtoken');

/**
 * Login Netlify Function - SIMPLIFIED (NO BCRYPT)
 */
exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { username, password } = JSON.parse(event.body);

    console.log('Login attempt - username:', username);

    // Validate input
    if (!username || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Username and password are required' }),
      };
    }

    // Check username
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'testpassword123';

    console.log('Expected username:', adminUsername);
    console.log('Expected password:', adminPassword);

    if (username !== adminUsername) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid credentials' }),
      };
    }

    // Check password - plain text comparison
    if (password !== adminPassword) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid credentials' }),
      };
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        username: adminUsername,
        iat: Math.floor(Date.now() / 1000),
      },
      process.env.AUTH_SECRET,
      {
        expiresIn: '24h',
      }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        token,
        user: {
          username: adminUsername,
        },
        expiresIn: 86400, // 24 hours in seconds
      }),
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'Invalid request',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      }),
    };
  }
};
