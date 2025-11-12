const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

/**
 * Login Netlify Function
 */
exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { username, password } = JSON.parse(event.body);

    // Validate input
    if (!username || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Username and password are required" }),
      };
    }

    // Check username
    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminPasswordHash) {
      console.error("ADMIN_PASSWORD_HASH not configured");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Server configuration error" }),
      };
    }

    if (username !== adminUsername) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: "Invalid credentials" }),
      };
    }

    // Check password using bcrypt
    const isValidPassword = await bcrypt.compare(password, adminPasswordHash);
    // const isValidPassword = password == adminPasswordHash;
    if (!isValidPassword) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: "Invalid credentials" }),
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
        expiresIn: "24h",
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
    console.error("Login error:", error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: "Invalid request",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      }),
    };
  }
};
