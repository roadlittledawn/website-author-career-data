const Anthropic = require("@anthropic-ai/sdk");
const jwt = require("jsonwebtoken");
const { MongoClient } = require("mongodb");

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  cachedDb = client.db('career-data');
  return cachedDb;
}

exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // Verify JWT token
    const authHeader = event.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: "No token provided" }),
      };
    }

    const token = authHeader.substring(7);
    jwt.verify(token, process.env.AUTH_SECRET);

    const {
      jobInfo,
      question,
      currentAnswer,
      feedback,
      action = "generate",
    } = JSON.parse(event.body);

    if (!jobInfo || !jobInfo.description || !jobInfo.jobType || !question) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Job info and question required",
        }),
      };
    }

    // Connect to database and fetch career data
    console.log('Connecting to database...');
    const dbStart = Date.now();
    const db = await connectToDatabase();
    const careerData = await fetchCareerData(db, jobInfo.jobType);
    console.log(`Database fetch completed in ${Date.now() - dbStart}ms`);

    // Build system prompt for answer generation
    const systemPrompt = buildAnswerSystemPrompt(
      jobInfo,
      question,
      careerData,
      currentAnswer,
      feedback
    );
    console.log(`System prompt length: ${systemPrompt.length} characters`);

    // Generate answer using Claude with prompt caching
    console.log('Calling Anthropic API...');
    const apiStart = Date.now();
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2000,
      temperature: 0.3,
      system: [
        {
          type: "text",
          text: systemPrompt,
          cache_control: { type: "ephemeral" }
        }
      ],
      messages: [
        {
          role: "user",
          content:
            action === "generate"
              ? "Generate a tailored answer to this application question based on the job requirements and career data provided."
              : `Please revise the answer based on this feedback: ${feedback}`,
        },
      ],
    });
    console.log(`Anthropic API completed in ${Date.now() - apiStart}ms`);
    console.log(`Token usage:`, response.usage);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        answer: response.content[0].text,
        usage: response.usage,
      }),
    };
  } catch (error) {
    console.error("Answer generation error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to generate answer",
        details:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      }),
    };
  }
};

async function fetchCareerData(db, jobType) {
  try {
    console.log('Fetching career data for job type:', jobType);

    const [profile, experiences, skills, projects] = await Promise.all([
      db.collection('careerprofiles').findOne({}),
      db.collection('experiences').find({}).toArray(),
      db.collection('skills').find({}).toArray(),
      db.collection('projects').find({}).toArray()
    ]);

    console.log('Fetched data counts:', {
      profile: profile ? 'found' : 'not found',
      experiences: experiences.length,
      skills: skills.length,
      projects: projects.length
    });

    return {
      profile,
      experiences: experiences,
      skills: skills,
      projects: projects
    };
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

function buildAnswerSystemPrompt(jobInfo, question, careerData, currentAnswer, feedback) {
  const { profile, experiences, skills, projects } = careerData;

  let prompt = `# Application Question Answering Assistant

You are an expert at answering job application questions. Provide a tailored, compelling answer for a ${jobInfo.jobType.replace(
    /-/g,
    " "
  )} position.

## Job Context
${jobInfo.description}

## Application Question
${question}

${currentAnswer ? `## Current Answer\n${currentAnswer}\n` : ''}
${feedback ? `## Revision Feedback\n${feedback}\n` : ''}

## Career Data Available

### Profile Information
${
  profile
    ? `
Name: ${profile.personalInfo?.name || "N/A"}
Positioning: ${profile.positioning?.current || "N/A"}
Professional Mission: ${profile.professionalMission || "N/A"}
Value Propositions: ${profile.valuePropositions?.join("; ") || "N/A"}
`
    : "No profile data available"
}

### Work Experiences (top 8)
${experiences
  .slice(0, 8)
  .map(
    (exp) => `
**${exp.company}** | ${exp.title} | ${exp.startDate} - ${exp.endDate || "Present"}
Tech: ${exp.technologies?.slice(0, 10).join(", ") || "N/A"}
${(exp.bulletPoints || []).slice(0, 3).map((bp) => `• ${bp}`).join("\n")}${
  exp.achievements?.slice(0, 2).length ? "\n" + exp.achievements.slice(0, 2).map((ach) => `• ${ach.description}`).join("\n") : ""
}`
  )
  .join("\n\n")}

### Skills (top 40)
${skills.slice(0, 40).map((skill) => skill.name).join(" • ")}

### Projects (top 6)
${projects
  .slice(0, 6)
  .map(
    (proj) => `**${proj.name}** | ${proj.type}
${proj.overview}
Tech: ${proj.technologies?.slice(0, 8).join(", ") || "N/A"}`
  )
  .join("\n\n")}

## Answer Requirements

1. **Be Specific and Concrete**:
   - Use real examples from career data
   - Include quantifiable achievements when relevant
   - Reference specific technologies, projects, or experiences

2. **Match the Question Type**:
   - Behavioral questions: Use STAR method (Situation, Task, Action, Result)
   - Technical questions: Demonstrate expertise with examples
   - Motivation questions: Show genuine alignment with role/company
   - Hypothetical questions: Use past experiences as framework

3. **Keep it Concise**:
   - Typically 150-300 words unless question requires more detail
   - Get to the point quickly
   - Use clear, professional language

4. **Show Value**:
   - Connect answer to job requirements
   - Highlight relevant skills and achievements
   - Demonstrate understanding of the role

5. **Be Authentic**:
   - Only use information from the career data
   - Don't fabricate or exaggerate
   - Maintain professional but genuine tone

Generate the answer now. Provide ONLY the answer text, no meta-commentary.`;

  return prompt;
}
