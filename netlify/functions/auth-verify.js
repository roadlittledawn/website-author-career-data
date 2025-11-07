const jwt = require('jsonwebtoken');

/**
 * Token Verification Netlify Function
 */
exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Get token from Authorization header
  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'No token provided' }),
    };
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.AUTH_SECRET);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        valid: true,
        user: {
          username: decoded.username,
        },
      }),
    };
  } catch (error) {
    // Token is invalid or expired
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({
        valid: false,
        error: 'Invalid or expired token',
      }),
    };
  }
};
