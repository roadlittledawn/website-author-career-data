const Anthropic = require('@anthropic-ai/sdk');
const jwt = require('jsonwebtoken');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * AI Writing Assistant Netlify Function
 * Proxies requests to Claude API with career data context
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
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Authentication check
  const authToken = event.headers.authorization?.replace('Bearer ', '');
  if (!isAuthenticated(authToken)) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  try {
    const { messages, context, options = {} } = JSON.parse(event.body);

    // Validate required fields
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Messages array is required' })
      };
    }

    if (!context || !context.editingContext) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Context is required' })
      };
    }

    // Build system prompt with context
    const systemPrompt = buildSystemPrompt(context);

    // Call Claude API
    const claudeOptions = {
      model: options.model || 'claude-sonnet-4-5-20250929',
      max_tokens: Math.min(options.maxTokens || 1000, 4096), // Cap at 4096
      temperature: options.temperature || 0.7,
      system: systemPrompt,
      messages: messages,
    };

    // Handle streaming vs non-streaming
    if (options.stream) {
      // For streaming, we need to use Server-Sent Events
      const stream = await anthropic.messages.stream(claudeOptions);

      // Convert Anthropic stream to SSE format
      let fullText = '';
      const chunks = [];

      stream.on('text', (text) => {
        fullText += text;
        chunks.push({
          type: 'content_block_delta',
          delta: { text }
        });
      });

      await stream.finalMessage();

      // Return formatted SSE data
      const sseData = chunks
        .map(chunk => `data: ${JSON.stringify(chunk)}\n`)
        .join('');

      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
        body: sseData + 'data: {"type":"message_stop"}\n\n'
      };
    } else {
      // Non-streaming response
      const response = await anthropic.messages.create(claudeOptions);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: {
            role: response.role,
            content: response.content[0].text
          },
          usage: response.usage
        })
      };
    }
  } catch (error) {
    console.error('AI Assistant Error:', error);

    // Handle specific Anthropic API errors
    if (error.status === 429) {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({
          error: 'Rate limit exceeded. Please try again in a moment.',
          code: 'RATE_LIMIT'
        })
      };
    }

    if (error.status === 401) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'API configuration error. Please contact administrator.',
          code: 'API_AUTH_ERROR'
        })
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to get AI response',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        code: 'AI_ERROR'
      })
    };
  }
};

/**
 * Build system prompt with career context
 */
function buildSystemPrompt(context) {
  const { profileSummary, editingContext, currentItem, relatedContext } = context;

  const roleType = editingContext.roleType || 'technical_writer';
  const roleDisplayName = roleType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  let prompt = `You are an expert career development writing assistant helping ${profileSummary?.name || 'the user'} craft professional career documents.

TARGET ROLE: ${roleDisplayName}
CURRENT EDITING: ${editingContext.collection}${editingContext.field ? ` (${editingContext.field})` : ''}

PROFILE CONTEXT:
${profileSummary?.positioning ? `- Positioning: ${profileSummary.positioning}` : ''}
${profileSummary?.valueProps?.length ? `- Key Value Props: ${profileSummary.valueProps.join('; ')}` : ''}
${profileSummary?.mission ? `- Mission: ${profileSummary.mission}` : ''}

YOUR RESPONSIBILITIES:
1. Write in a professional but authentic voice that matches the user's existing content
2. Include quantifiable metrics and measurable impact whenever possible (%, $, #, time saved)
3. Optimize content for Applicant Tracking Systems (ATS) using relevant keywords
4. Ensure consistency with the existing career narrative and positioning
5. Tailor content specifically for ${roleDisplayName} roles
6. Use strong action verbs and clear, concise language
7. Focus on achievements and outcomes, not just responsibilities

GUIDELINES:
- Bullet points should be 1-2 lines max, starting with strong action verbs
- Achievements should include metrics (%, $, #, time saved, users impacted, etc.)
- Avoid clichés like "team player", "hard worker", "self-motivated", "go-getter"
- Use industry-standard terminology and keywords for ${roleDisplayName}
- Maintain consistency in tense (past tense for previous roles, present for current)
- Be specific about technologies, tools, and methodologies used
- Highlight cross-functional collaboration and leadership when relevant

`;

  // Add current item context if available
  if (currentItem) {
    prompt += `\nCURRENT ITEM BEING EDITED:\n`;
    if (editingContext.collection === 'experiences') {
      prompt += `- Company: ${currentItem.company}\n`;
      prompt += `- Title: ${currentItem.title}\n`;
      prompt += `- Technologies: ${currentItem.technologies?.join(', ') || 'N/A'}\n`;
      if (currentItem.responsibilities?.length) {
        prompt += `- Key Responsibilities: ${currentItem.responsibilities.slice(0, 3).join('; ')}\n`;
      }
    } else if (editingContext.collection === 'projects') {
      prompt += `- Project: ${currentItem.name}\n`;
      prompt += `- Type: ${currentItem.type}\n`;
      prompt += `- Technologies: ${currentItem.technologies?.join(', ') || 'N/A'}\n`;
    }
  }

  // Add related context (skills, keywords)
  if (relatedContext) {
    if (relatedContext.skills?.length) {
      const topSkills = relatedContext.skills
        .flatMap(cat => cat.skills)
        .filter(s => s.featured)
        .map(s => s.name)
        .slice(0, 10);
      if (topSkills.length) {
        prompt += `\nRELEVANT SKILLS: ${topSkills.join(', ')}\n`;
      }
    }

    if (relatedContext.keywords?.length) {
      const keyTerms = relatedContext.keywords
        .flatMap(cat => cat.terms)
        .map(t => t.primary)
        .slice(0, 15);
      if (keyTerms.length) {
        prompt += `\nATS KEYWORDS TO CONSIDER: ${keyTerms.join(', ')}\n`;
      }
    }
  }

  prompt += `\nWhen asked to improve or generate content:
1. First, understand the context and goals
2. Reference specific experiences, skills, or projects from the career data
3. Provide 2-3 variations when appropriate
4. Explain your reasoning for suggestions briefly
5. Be ready to iterate and refine based on feedback

Remember: Be helpful, specific, and actionable. Focus on making the user's career achievements shine.`;

  return prompt;
}

/**
 * Verify JWT authentication token
 */
function isAuthenticated(token) {
  if (!token) {
    return false;
  }

  try {
    const decoded = jwt.verify(token, process.env.AUTH_SECRET);
    return decoded && decoded.username === process.env.ADMIN_USERNAME;
  } catch (error) {
    console.error('Auth error:', error.message);
    return false;
  }
}
