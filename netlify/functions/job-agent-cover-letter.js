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

    // Build system prompt for cover letter generation
    const systemPrompt = buildCoverLetterSystemPrompt(
      jobInfo,
      careerData,
      additionalContext
    );
    console.log(`System prompt length: ${systemPrompt.length} characters`);

    // Generate cover letter using Claude with prompt caching
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
              ? "Generate a tailored cover letter in markdown format based on the job requirements and career data provided."
              : `Please revise the cover letter based on this feedback: ${additionalContext}`,
        },
      ],
    });
    console.log(`Anthropic API completed in ${Date.now() - apiStart}ms`);
    console.log(`Token usage:`, response.usage);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        coverLetter: response.content[0].text,
        usage: response.usage,
      }),
    };
  } catch (error) {
    console.error("Cover letter generation error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to generate cover letter",
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

function buildCoverLetterSystemPrompt(jobInfo, careerData, additionalContext) {
  const { profile, experiences, skills, projects } = careerData;

  let prompt = `# Cover Letter Writing Assistant

You are an expert cover letter writer. Create a tailored, compelling cover letter for a ${jobInfo.jobType.replace(
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
Professional Mission: ${profile.professionalMission || "N/A"}
Value Propositions: ${profile.valuePropositions?.join("; ") || "N/A"}
`
    : "No profile data available"
}

### Work Experiences (${experiences.length} total - showing top 10)
${experiences
  .slice(0, 10)
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

## Cover Letter Requirements

Create a professional cover letter that:

1. **Opening Paragraph**:
   - Express genuine interest in the specific role
   - Include a compelling hook that showcases your unique value
   - Reference something specific about the company or role

2. **Body Paragraphs** (2-3 paragraphs):
   - Highlight most relevant experiences with quantifiable achievements
   - Demonstrate understanding of the role through relevant projects
   - Show cultural fit and alignment with company values
   - Connect your skills and experiences to specific job requirements

3. **Closing Paragraph**:
   - Reiterate interest and value proposition
   - Include a professional call to action
   - Express enthusiasm for next steps

4. **Formatting**:
   - Use proper business letter format
   - Keep it concise (3-4 paragraphs, ~300-400 words)
   - Professional yet engaging tone
   - Natural keyword integration from job posting

5. **Personalization**:
   - Address specific company details when available
   - Match tone to company culture
   - Ensure all claims are genuine and supportable from career data
   - Avoid generic statements

Generate the cover letter in markdown format now.`;

  return prompt;
}
