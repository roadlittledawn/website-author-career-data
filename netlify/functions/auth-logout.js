/**
 * Logout Netlify Function
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
};
