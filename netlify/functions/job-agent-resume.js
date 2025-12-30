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
      additionalContext,
      action = "generate",
    } = JSON.parse(event.body);

    if (!jobInfo || !jobInfo.description || !jobInfo.jobType) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Job info with description and jobType required",
        }),
      };
    }

    // Connect to database and fetch career data
    console.log('Connecting to database...');
    const dbStart = Date.now();
    const db = await connectToDatabase();
    const careerData = await fetchCareerData(db, jobInfo.jobType);
    console.log(`Database fetch completed in ${Date.now() - dbStart}ms`);

    // Build system prompt for resume generation
    const systemPrompt = buildResumeSystemPrompt(
      jobInfo,
      careerData,
      additionalContext
    );
    console.log(`System prompt length: ${systemPrompt.length} characters`);

    // Generate resume using Claude with prompt caching
    console.log('Calling Anthropic API...');
    const apiStart = Date.now();
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4000,
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
              ? "Generate a tailored resume in markdown format based on the job requirements and career data provided."
              : `Please revise the resume based on this feedback: ${additionalContext}`,
        },
      ],
    });
    console.log(`Anthropic API completed in ${Date.now() - apiStart}ms`);
    console.log(`Token usage:`, response.usage);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        resume: response.content[0].text,
        usage: response.usage,
      }),
    };
  } catch (error) {
    console.error("Resume generation error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to generate resume",
        details:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      }),
    };
  }
};

async function fetchCareerData(db, jobType) {
  const jobTypeConfig = getJobTypeConfig(jobType);

  try {
    console.log('Fetching career data for job type:', jobType);
    console.log('Job type config:', jobTypeConfig);

    const [profile, experiences, skills, projects] = await Promise.all([
      db.collection('careerprofiles').findOne({}),
      db.collection('experiences').find({}).toArray(), // Get all experiences first
      db.collection('skills').find({}).toArray(), // Get all skills first  
      db.collection('projects').find({}).toArray() // Get all projects first
    ]);

    console.log('Fetched data counts:', {
      profile: profile ? 'found' : 'not found',
      experiences: experiences.length,
      skills: skills.length,
      projects: projects.length
    });

    // Return all data for LLM to have maximum context for tailoring
    console.log('Returning all career data (no filtering):', {
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

function getJobTypeConfig(jobType) {
  const configs = {
    "technical-writer": {
      roleTypes: ["technical_writer"],
      skillRelevance: ["technical_writer", "technical_writing_manager"],
    },
    "technical-writing-manager": {
      roleTypes: ["technical_writing_manager", "technical_writer"],
      skillRelevance: ["technical_writing_manager", "technical_writer"],
    },
    "software-engineer": {
      roleTypes: ["software_engineer"],
      skillRelevance: ["software_engineer"],
    },
    "software-engineering-manager": {
      roleTypes: ["engineering_manager", "software_engineer"],
      skillRelevance: ["engineering_manager", "software_engineer"],
    },
  };

  return configs[jobType] || configs["technical-writer"];
}

function buildResumeSystemPrompt(jobInfo, careerData, additionalContext) {
  const { profile, experiences, skills, projects } = careerData;

  let prompt = `# Resume Tailoring Assistant

You are an expert resume tailoring assistant. Create a tailored resume for a ${jobInfo.jobType.replace(
    /-/g,
    " "
  )} position.

## Job Requirements
${jobInfo.description}

## Career Data Available

### Profile Information
${
  profile
    ? `
Name: ${profile.personalInfo?.name || "N/A"}
Location: ${profile.personalInfo?.location || "N/A"}
Email: ${profile.personalInfo?.email || "N/A"}
Phone: ${profile.personalInfo?.phone || "N/A"}
Portfolio: ${profile.personalInfo?.portfolio || "https://clintonlangosch.com"}
GitHub: ${profile.personalInfo?.github || "N/A"}
LinkedIn: ${profile.personalInfo?.linkedin || "N/A"}

Positioning: ${profile.positioning?.current || "N/A"}
`
    : "No profile data available"
}

### Work Experiences (${experiences.length} total)
${experiences
  .slice(0, 10) // Limit to 10 most recent
  .map(
    (exp) => `
**${exp.company}** | ${exp.title} | ${exp.startDate} - ${exp.endDate || "Present"}
Tech: ${exp.technologies?.slice(0, 10).join(", ") || "N/A"}
${(exp.bulletPoints || []).slice(0, 4).map((bp) => `• ${bp}`).join("\n")}${
  exp.achievements?.slice(0, 2).length ? "\n" + exp.achievements.slice(0, 2).map((ach) => `• ${ach.description}`).join("\n") : ""
}`
  )
  .join("\n\n")}

### Skills (${skills.length} total - showing top 50)
${skills.slice(0, 50).map((skill) => skill.name).join(" • ")}

### Projects (${projects.length} total - showing top 8)
${projects
  .slice(0, 8)
  .map(
    (proj) => `**${proj.name}** | ${proj.type}
${proj.overview}
Tech: ${proj.technologies?.slice(0, 8).join(", ") || "N/A"}`
  )
  .join("\n\n")}

${
  additionalContext
    ? `\n## Additional Context from User\n${additionalContext}`
    : ""
}

## Instructions

1. Analyze the job requirements and identify key skills, technologies, and qualifications needed
2. Create a tailored resume that highlights the most relevant experiences and skills
3. Use the exact career data provided - do not fabricate any information
4. Reorder and emphasize content to match job requirements
5. Include relevant keywords naturally throughout the resume
6. Format as clean markdown with proper structure

## Resume Structure Required

# [Full Name]
[Location] • [Phone] • [Email]
[Portfolio] • [GitHub] • [LinkedIn]

## Profile
[Tailored positioning statement emphasizing relevant experience]

## Experience
[List experiences in reverse chronological order, emphasizing relevant bullet points and achievements]

## Skills
[Organize skills by category, prioritizing job-relevant skills]

## Projects
[Include 2-3 most relevant projects if they add value]

## Education
[Include if available in career data]

Generate the tailored resume now.`;

  return prompt;
}
