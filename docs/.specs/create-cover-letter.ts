export const script = {
  name: 'create-cover-letter',
  content: `# Create Cover Letter for Job Position

## Overview

Creates a customized cover letter for various role types (Technical Writer, Technical Writing Manager, Software Engineer, Engineering Manager) based on a job posting and the Career Master Database. This script uses your comprehensive career information to craft a compelling, role-specific cover letter that highlights relevant experience and skills.

## Parameters

- **role_type** (required): Type of role - "technical_writer", "technical_writing_manager", "software_engineer", or "engineering_manager"
- **job_url** (optional): URL of the job posting to scrape
- **job_description** (optional): Job description text (if not providing URL)
- **company_name** (required): Target company name
- **position_title** (optional): Specific position title (defaults based on role_type)
- **application_date** (optional): Date for file naming (defaults to today's date)
- **hiring_manager_name** (optional): Name of hiring manager if known

## Career Data Access

**MongoDB Career Database:**

- **Database**: \`career-data\` in MongoDB Atlas
- **Collections**: \`experiences\`, \`skills\`, \`projects\`, \`keywords\`, \`careerprofiles\`
- **Access via MCP Tools**:
  - \`mongodb_query_experiences\` - Query work experiences with role type filtering
  - \`mongodb_query_skills\` - Query skill categories with role relevance filtering
  - \`mongodb_query_projects\` - Query projects with role type filtering

**Google Drive Folder IDs (hardcoded for efficiency):**

- **Career Development Folder**: 1auWe4ISdofTXscMOFTWiwIsBYvzf3NtA
- **Job Descriptions Folder**: 1MMgrXiyQQZwI0bZQn7YdtGHa9o5yJFnu
- **Technical Writing Job Descriptions**: 1nQEV2mL-OkRDnp9fqNQ_1Jun6toGy2MI
- **Software Engineering Job Descriptions**: 1JTb75UsJozfY1J-TASz_JwOnROvS4aAY
- **Templates Folder**: 1WPqoWD87bwDinEVFfeCnLonyJRm56BcL
- **Applications Folder**: 1xv7mpyS2u5Y2dOFR80CHvBaQY82eIOjT
- **Technical Writer Applications**: 1ASFZCXyhRBWj5hghV9LLblktQv8_H27j
- **Software Engineer Applications**: 1qRhBZ0dPkXWhWDHu_AJWy-Iw9QF3sZxt

**Template Document IDs (if using templates):**

- **technical_writer**: Cover-Letter-Base-Technical-Writer (1GJ8tLYO9R5-6XB6QQoSTIbwAAnI_9wzv3NwE99SMTk0)
- **technical_writing_manager**: Cover-Letter-Base-Technical-Writing-Manager [Create if needed]
- **software_engineer**: Cover-Letter-Base-Software-Engineer [Create if needed]
- **engineering_manager**: Cover-Letter-Base-Engineering-Manager [Create if needed]

## Steps

### 1. Gather Job Information

**If job_url is provided:**

- Use \`execute_bash\` with \`curl\` to scrape the job posting
- Extract clean job description text from HTML
- Parse company name, position details, and any hiring manager information

**If job_description is provided:**

- Use the provided text directly
- Confirm company name and position title

### 2. Save Job Description (if not already saved)

- Check if job description already exists in appropriate folder based on role_type
- If not found, create job description document with \`google_docs_create\`
- Move to appropriate folder based on role_type:
  - Technical Writer/Manager: \`destinationFolderId: 1nQEV2mL-OkRDnp9fqNQ_1Jun6toGy2MI\`
  - Software Engineer/Manager: Create folder if needed and use that ID
- Use naming convention: \`Job-Description-{company_name}-{role_type}-{date}\`

### 3. Analyze Job Requirements

Parse the job description for:

- **Company mission and values** (for personalization)
- **Key responsibilities** (documentation types, processes, collaboration)
- **Required skills and technologies** (tools, programming languages, methodologies)
- **Team structure** (who you'll work with, reporting structure)
- **Company culture indicators** (remote work, collaboration style, growth opportunities)
- **Specific projects or products** mentioned

### 4. Query Career Data from MongoDB

**Query Experiences:**

- Use \`mongodb_query_experiences\` with roleTypes filter based on role_type parameter:
  - For **technical_writer**: Query with \`roleTypes: ["technical_writer"]\` and \`featured: true\`
  - For **technical_writing_manager**: Query with \`roleTypes: ["technical_writing_manager"]\` and \`featured: true\`
  - For **software_engineer**: Query with \`roleTypes: ["software_engineer"]\` and \`featured: true\`
  - For **engineering_manager**: Query with \`roleTypes: ["engineering_manager"]\` and \`featured: true\`
- Extract 2-3 most compelling experiences with quantifiable achievements

**Query Projects:**

- Use \`mongodb_query_projects\` with roleTypes and featured filters
- Select 1-2 projects that best align with job requirements
- Use \`overview\`, \`challenge\`, \`outcome\` fields for storytelling

**Query Skills:**

- Use \`mongodb_query_skills\` with roleRelevance filter to get technical skills
- Select featured skills that match job requirements
- Use for technical depth and credibility

**Query Career Profile:**

- Get positioning statements and value propositions from career profile
- Use professional mission statement for alignment with company values
- Extract unique selling points relevant to role

### 5. Structure Cover Letter Content

- Create cover letter sections based on role_type and MongoDB data:
  - Header with contact information from career profile
  - Salutation based on hiring manager info or default
  - Opening paragraph using positioning statement
  - Body paragraphs highlighting relevant experiences from queried data
  - Closing with appropriate call to action
- Map MongoDB structured data (achievements, projects, skills) to job requirements

### 6. Customize Cover Letter Content

**Header Section:**

- Pull contact information from career profile (personalInfo fields)
- Add date and company address from parameters

**Salutation:**

- Use hiring manager name if provided: "Dear [Name],"
- Otherwise use: "Dear Hiring Manager," or "Dear [Company] Team,"

**Opening Paragraph:**

- Mention specific position title and where you found the job
- Include a compelling hook based on role_type:
  - **technical_writer**: Documentation expertise and impact
  - **software_engineer**: Technical problem-solving abilities
  - **manager roles**: Leadership and strategic vision
- Reference something specific about the company or role

**Body Paragraphs (tailored by role_type):**

- **Paragraph 1**: Highlight most relevant experience from MongoDB query

  - Use \`achievements\` array from featured experiences
  - Include quantifiable impact from \`impact\` field
  - Mention relevant technologies from \`technologies\` array

- **Paragraph 2**: Demonstrate understanding with projects

  - Pull from queried projects using \`challenge\`, \`approach\`, \`outcome\`
  - Show problem-solving through structured project data
  - Connect project outcomes to job requirements

- **Paragraph 3**: Cultural fit and value alignment
  - Use value propositions from career profile
  - Reference professional mission for company alignment
  - Highlight cross-functional collaboration from experiences
  - Show enthusiasm for their mission/values

**Closing Paragraph:**

- Reiterate interest and value proposition
- Include call to action (interview request)
- Professional sign-off

### 7. Personalization and Tone

- **Company Research Integration**: Include specific details about the company
- **Voice Matching**: Adjust tone to match company culture (formal vs. casual)
- **Keyword Integration**: Naturally include key terms from job posting
- **Authenticity**: Ensure all claims are genuine and supportable

### 8. Quality Review

- Check for natural language flow and readability
- Verify all company and position details are accurate
- Ensure proper grammar, spelling, and formatting
- Confirm letter length is appropriate (typically 3-4 paragraphs)
- Validate that all job requirements are addressed

### 9. Save Customized Cover Letter

- Create the cover letter document using \`google_docs_create\`
- Move to appropriate applications folder based on role_type
- Use naming convention:
  - Technical Writer: \`Cover-Letter-{company_name}-Technical-Writer-{date}\`
  - Technical Writing Manager: \`Cover-Letter-{company_name}-Tech-Writing-Manager-{date}\`
  - Software Engineer: \`Cover-Letter-{company_name}-Software-Engineer-{date}\`
  - Engineering Manager: \`Cover-Letter-{company_name}-Engineering-Manager-{date}\`
- Provide summary of customizations made

## Output

The script should provide:

- **Job Analysis Summary**: Key company info and requirements identified
- **Cover Letter Customizations**: List of specific modifications made
- **Personalization Notes**: Company-specific details included
- **File Locations**: Links to saved job description and cover letter
- **Next Steps**: Suggestions for follow-up actions

## Examples

### Technical Writer Role

\`\`\`
Create a cover letter for this Anthropic position: [job URL]
Role type: technical_writer
\`\`\`

### Software Engineer Role

\`\`\`
Create a cover letter for Google's Software Engineer role
Role type: software_engineer
Hiring manager: Sarah Johnson
\`\`\`

### Engineering Manager Role

\`\`\`
Create a cover letter for the Engineering Manager position at Meta
Role type: engineering_manager
Job description: [paste text]
\`\`\`

### Technical Writing Manager Role

\`\`\`
Generate cover letter for Microsoft's Technical Writing Manager role
Role type: technical_writing_manager
Company: Microsoft
\`\`\`

## Troubleshooting

**Job URL Scraping Issues:**

- Try copying the job description manually if scraping fails
- Some sites require JavaScript rendering - provide fallback text input

**Base Cover Letter Missing:**

- Ensure template exists in Templates folder
- Check file naming matches exactly: \`Cover-Letter-Base-Technical-Writer\`

**Google Drive Access:**

- Ensure proper folder permissions
- Verify folder names match the expected structure

**Personalization Challenges:**

- Research company website, recent news, or LinkedIn for additional context
- Focus on publicly available information about company mission and values

## Success Metrics

- Cover letter addresses specific job requirements
- Company-specific personalization included
- Professional tone appropriate for company culture
- Clear value proposition and call to action
- Proper formatting and error-free content
- Complete documentation trail maintained

## Integration with Resume Script

This script works in conjunction with \`tailor-resume.script.md\`:

- Both scripts use the Career Master Database as the single source of truth
- Both scripts support the same role_type parameter for consistency
- Job description is saved once and reused
- Consistent naming convention for application materials
- Complete application package ready for submission`
};
