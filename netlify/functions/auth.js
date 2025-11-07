const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * Authentication Netlify Function
 * Handles login, logout, and token verification
 */
exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Parse the path to determine the action
  const path = event.path.replace('/.netlify/functions/auth', '');

  try {
    // Route to appropriate handler
    switch (path) {
      case '/login':
        return await handleLogin(event, headers);
      case '/verify':
        return await handleVerify(event, headers);
      case '/logout':
        return await handleLogout(event, headers);
      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Not found' }),
        };
    }
  } catch (error) {
    console.error('Auth error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      }),
    };
  }
};

/**
 * Handle login request
 */
async function handleLogin(event, headers) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { username, password } = JSON.parse(event.body);

    // Validate input
    if (!username || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Username and password are required' }),
      };
    }

    // Check username
    const adminUsername = process.env.ADMIN_USERNAME;
    if (username !== adminUsername) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid credentials' }),
      };
    }

    // Check password
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    const isValidPassword = await bcrypt.compare(password, adminPasswordHash);

    if (!isValidPassword) {
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
      body: JSON.stringify({ error: 'Invalid request' }),
    };
  }
}

/**
 * Handle token verification
 */
async function handleVerify(event, headers) {
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
}

/**
 * Handle logout request
 */
async function handleLogout(event, headers) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // For JWT, logout is client-side (remove token)
  // This endpoint is mainly for consistency and potential future use
  // (e.g., token blacklist)

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: 'Logged out successfully',
    }),
  };
}
