const jwt = require('jsonwebtoken');
const https = require('https');
const http = require('http');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Verify JWT token
    const authHeader = event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'No token provided' })
      };
    }

    const token = authHeader.substring(7);
    
    // Check if token exists and is not empty
    if (!token || token === 'null' || token === 'undefined') {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid token' })
      };
    }

    try {
      jwt.verify(token, process.env.AUTH_SECRET);
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError.message);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid or expired token' })
      };
    }

    const { url } = JSON.parse(event.body);
    
    if (!url) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'URL is required' })
      };
    }

    // Fetch the job posting page
    const html = await fetchUrl(url);
    
    // Basic content extraction - look for common job description patterns
    const description = extractJobDescription(html);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        description,
        url 
      })
    };

  } catch (error) {
    console.error('Job scraper error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to extract job description',
        details: error.message 
      })
    };
  }
};

function extractJobDescription(html) {
  // Remove HTML tags and extract text
  const textContent = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Look for job description sections (basic heuristics)
  const jobKeywords = [
    'job description',
    'position summary',
    'role description',
    'responsibilities',
    'requirements',
    'qualifications',
    'about the role',
    'what you\'ll do'
  ];

  let bestMatch = '';
  let maxScore = 0;

  // Split into paragraphs and score them
  const paragraphs = textContent.split(/\n\s*\n|\.\s+(?=[A-Z])/);
  
  for (const paragraph of paragraphs) {
    if (paragraph.length < 100) continue; // Skip short paragraphs
    
    let score = 0;
    const lowerParagraph = paragraph.toLowerCase();
    
    // Score based on job-related keywords
    for (const keyword of jobKeywords) {
      if (lowerParagraph.includes(keyword)) {
        score += 2;
      }
    }
    
    // Bonus for common job terms
    const jobTerms = ['experience', 'skills', 'team', 'work', 'develop', 'manage', 'lead'];
    for (const term of jobTerms) {
      if (lowerParagraph.includes(term)) {
        score += 0.5;
      }
    }
    
    if (score > maxScore && paragraph.length > 200) {
      maxScore = score;
      bestMatch = paragraph;
    }
  }

  // If no good match found, return first substantial chunk
  if (!bestMatch) {
    bestMatch = paragraphs.find(p => p.length > 300) || textContent.substring(0, 1000);
  }

  return bestMatch.substring(0, 2000); // Limit length
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; JobAgent/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    };

    client.get(url, options, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}
