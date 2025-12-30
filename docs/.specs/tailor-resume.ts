export const script = {
  name: 'tailor-resume',
  content: `# Tailor Resume for Job Position

## Overview

Customizes your resume for a specific job posting across multiple role types (Technical Writer, Technical Writing Manager, Software Engineer, Engineering Manager), optimizing for ATS keyword matching and highlighting relevant experience. This script uses the MongoDB Career Database to understand your complete background and handles the complete workflow from job description analysis to saving the tailored resume.

## Parameters

- **role_type** (required): Type of role - "technical_writer", "technical_writing_manager", "software_engineer", or "engineering_manager"
- **job_url** (optional): URL of the job posting to scrape
- **job_description** (optional): Job description text (if not providing URL)
- **company_name** (required): Target company name
- **position_title** (optional): Specific position title (defaults based on role_type)
- **application_date** (optional): Date for file naming (defaults to today's date)

## Career Data Access

**MongoDB Career Database:**

- **Database**: \`career-data\` in MongoDB Atlas
- **Collections**: \`experiences\`, \`skills\`, \`projects\`, \`careerprofiles\`
- **Access via MCP Tools**:
  - \`mongodb_query_experiences\` - Query work experiences with role type filtering
  - \`mongodb_query_skills\` - Query skill categories with role relevance filtering
  - \`mongodb_query_projects\` - Query projects with role type filtering

**Google Drive Folder IDs (hardcoded for efficiency):**

- **Career Development Folder**: 1auWe4ISdofTXscMOFTWiwIsBYvzf3NtA
- **Job Descriptions Folder**: 1MMgrXiyQQZwI0bZQn7YdtGHa9o5yJFnu
- **Technical Writing Job Descriptions**: 1nQEV2mL-OkRDnp9fqNQ_1Jun6toGy2MI
- **Software Engineering Job Descriptions**: 1JTb75UsJozfY1J-TASz_JwOnROvS4aAY
- **Technical Writing Manager Job Descriptions**: 1jvoknTI_k6aFoNAEOZvY0U79Gtg4oY8Y
- **Templates Folder**: 1WPqoWD87bwDinEVFfeCnLonyJRm56BcL
- **Applications Folder**: 1xv7mpyS2u5Y2dOFR80CHvBaQY82eIOjT
- **Technical Writer Applications**: 1ASFZCXyhRBWj5hghV9LLblktQv8_H27j
- **Software Engineer Applications**: 1qRhBZ0dPkXWhWDHu_AJWy-Iw9QF3sZxt
- **Technical Writing Manager Applications**: 1gX0DGyIBCqZ_1OOeEa9w6df_bWNvfzBO

**Template Document IDs (by role_type):**

- **technical_writer**: Resume-Base-Technical-Writer (1YOD9NfpT1sDIDfKiZwpdXCMOTAEOhB3vEM_s0zedguM)
- **technical_writing_manager**: Resume-Base-Technical-Writing-Manager (10zLOmPR_FG6mxlB_stPJyDkJqVIaAmwfgV16p3NT0c4)
- **software_engineer**: Resume-Base-Software-Engineer [Create if needed]
- **engineering_manager**: Resume-Base-Engineering-Manager [Create if needed]

## Steps

### 1. Gather Job Information

**If job_url is provided:**

- Use \`execute_bash\` with \`curl\` to scrape the job posting
- Extract clean job description text from HTML
- Parse company name and position details

**If job_description is provided:**

- Use the provided text directly
- Confirm company name and position title

### 2. Save Job Description

- Use \`google_docs_create\` to create job description document
- Move to appropriate folder based on role_type:
  - Technical Writer/Manager: \`destinationFolderId: 1nQEV2mL-OkRDnp9fqNQ_1Jun6toGy2MI\`
  - Software Engineer/Manager: Create folder if needed and use that ID
- Use naming convention: \`Job-Description-{company_name}-{role_type}-{date}\`
- Save the full job posting content for future reference

### 3. Analyze Job Requirements

Parse the job description for:

- **Required skills and technologies** (e.g., API documentation, Markdown, Git, etc.)
- **Experience requirements** (years, specific domains)
- **Key responsibilities** (documentation types, audience, processes)
- **Preferred qualifications** (certifications, tools, methodologies)
- **Company-specific keywords** (values, culture, specific products)

### 4. Query Career Data from MongoDB

**Query Experiences:**

- Use \`mongodb_query_experiences\` with roleTypes filter based on role_type parameter:
  - For **technical_writer**: Query with \`roleTypes: ["technical_writer"]\` and \`featured: true\`
  - For **technical_writing_manager**: Query with \`roleTypes: ["technical_writing_manager", "technical_writer"]\` and \`featured: true\`
  - For **software_engineer**: Query with \`roleTypes: ["software_engineer"]\` and \`featured: true\`
  - For **engineering_manager**: Query with \`roleTypes: ["engineering_manager", "software_engineer"]\` and \`featured: true\`

**Query Skills:**

- Use \`mongodb_query_skills\` with roleRelevance filter:
  - For **technical_writer/technical_writing_manager**: \`roleRelevance: ["technical_writer", "technical_writing_manager"]\`
  - For **software_engineer**: \`roleRelevance: ["software_engineer"]\`
  - For **engineering_manager**: \`roleRelevance: ["engineering_manager", "software_engineer"]\`

**Query Projects:**

- Use \`mongodb_query_projects\` with roleTypes and featured filters:
  - Filter by matching roleTypes and set \`featured: true\`
  - Select 2-3 most relevant projects based on job requirements

### 5. Build Resume Structure from MongoDB Career Data

**Building Resume from MongoDB Data:**

The agent must organize the queried MongoDB data based on role_type:

**Header Information:**

- Name, location, phone, email from personal info
- Relevant portfolio/GitHub/LinkedIn links based on role

**Profile Section:**

- Use positioning statement from career profile collection based on role_type
- For technical_writer: Use \`positioning.byRole.technical_writer\` or \`positioning.current\`
- For software_engineer: Use \`positioning.byRole.software_engineer\`
- For manager roles: Use appropriate manager positioning statement

**Experience Section:**

- Use experiences from \`mongodb_query_experiences\` result
- Access structured fields:
  - \`company\`, \`title\`, \`location\`
  - \`startDate\`, \`endDate\` (format as "Jan 2023 - Present")
  - \`bulletPoints\` array for resume-ready bullet points
  - \`achievements\` array with description and impact
  - \`technologies\` array for tech stack
- Include 3-5 most recent and relevant experiences
- For each experience, use 4-6 bullet points from the \`bulletPoints\` field

**Skills Section:**

- Use skill categories from \`mongodb_query_skills\` result
- Access \`category\` name and \`skills\` array
- For each skill in \`skills\` array, access \`name\` field
- Group by category and present as comma-separated lists

**Projects Section (Optional):**

- Use projects from \`mongodb_query_projects\` if relevant
- Access \`name\`, \`type\`, \`overview\`, \`challenge\`, \`outcome\`
- Include technologies from \`technologies\` array
- Select 2-3 projects that best match job requirements

**Education Section:**

- Query education collection if available
- Include degree, institution, field, graduationYear

### 6. Convert to Structured Markdown

Convert the parsed Google Doc content to clean markdown format:

\`\`\`markdown
# [Full Name]

[Location] • [Phone] • [Email]

[Portfolio Link] • [GitHub](https://github.com/roadlittledawn) • [LinkedIn](https://www.linkedin.com/in/clinton-langosch)

## Profile

[Complete profile text from Google Doc]

## Experience

### [Company Name] ([Location]) - [Date Range]

**[Job Title]**

[Job description paragraph]

- [Bullet point 1]
- [Bullet point 2]
- [etc.]

[Repeat for all jobs]

## Skills

### [Skill Category 1]

[Comma-separated skills]

### [Skill Category 2]

[Comma-separated skills]

[Repeat for all skill categories]

## Education

**[University Name], [Year]**
[Degree Information]
\`\`\`

### 7. Analyze Current Resume Against Job Requirements

- Map current experience to job requirements
- Identify relevant skills and technologies
- Note gaps and strengths
- Prepare tailoring strategy

### 8. Interactive Enhancement Check

Before modifying the resume, ask the user:

> "I've read your current base resume from Google Docs. Based on this job description, are there any specific skills, experiences, projects, or achievements you'd like me to highlight or add that might not be prominently featured in your base resume? For example:
>
> - Technical skills or tools you've used that match the job requirements
> - Relevant projects or accomplishments from recent work
> - Certifications or training you've completed
> - Specific types of documentation you've created
> - Cross-functional collaboration experiences
> - Any quantifiable achievements that align with this role
>
> Please provide any additional context or bullet points you'd like incorporated."

### 9. Tailor Resume Content

**Strict Preservation Rules:**

**NEVER MODIFY:**

- Your name, phone, email, location
- GitHub, LinkedIn links
- Company names, job titles, employment dates
- Core section structure (Profile, Experience, Skills, Education)
- University name, graduation year, degree type

**ALLOWED MODIFICATIONS:**

- Update portfolio link to https://clintonlangosch.com
- Reorder bullet points within jobs to emphasize relevant experience
- Add job-specific keywords naturally within existing bullet points
- Adjust profile text to emphasize relevant experience
- Reorder skills within categories to prioritize job-relevant ones
- Add new bullet points if user provides additional context

**Tailoring Guidelines:**

**Profile Section:**

- Emphasize years of experience that match job requirements
- Include key technologies mentioned in job posting
- Highlight relevant domain experience
- Incorporate user-provided additional context

**Experience Section:**

- Reorder bullet points to lead with most relevant achievements
- Add keywords from job description naturally within existing content
- Quantify achievements where possible
- Emphasize documentation types mentioned in job posting
- Add new bullet points only if user provides specific additional accomplishments

**Skills Section:**

- Reorder skills within categories to prioritize job-relevant ones
- Ensure job-required skills are prominently placed
- Add any missing relevant skills you possess (with user confirmation)
- Maintain existing categorization structure

**Education Section:**

- Keep exactly as is unless user requests specific changes

### 7. ATS Optimization

- **Keyword Density**: Ensure important keywords appear 2-3 times naturally
- **Skills Matching**: Include exact skill names from job posting
- **Format Optimization**: Use standard section headers, bullet points
- **Acronym Handling**: Include both full terms and acronyms (e.g., "Application Programming Interface (API)")

### 8. Quality Review

- Check for natural language flow
- Ensure no keyword stuffing
- Verify all claims are accurate
- Confirm formatting consistency
- Estimate ATS match score based on keyword alignment

### 9. Save Tailored Resume

- Update the copied resume with all modifications
- Confirm proper file naming and location
- Provide summary of changes made

### 10. Create Formatted Resume

**Important:** The final deliverable should be a markdown file uploaded to Google Drive for manual conversion to preserve native bullet formatting.

- Convert the tailored resume content to properly structured markdown format
- Use markdown formatting for:
  - **Bold headers** for all major sections (Profile, Experience, Skills, Education)
  - **Bold job titles and companies** in experience section
  - **Bold skill categories** in technical skills section
  - **Proper heading hierarchy** (# for name, ## for sections, ### for job titles)
  - **Normal text** for paragraph content and bullet points (no bold formatting)
- Save the markdown content to a temporary file (e.g., \`/tmp/resume-{company}-formatted.md\`)
- Use \`google_drive_upload_markdown\` to upload the markdown file to Google Drive
- Use naming convention based on role_type:
  - Technical Writer: \`Resume-Technical-Writer-{company_name}-{date}\`
  - Technical Writing Manager: \`Resume-Tech-Writing-Manager-{company_name}-{date}\`
  - Software Engineer: \`Resume-Software-Engineer-{company_name}-{date}\`
  - Engineering Manager: \`Resume-Engineering-Manager-{company_name}-{date}\`
- **Critical:** Provide the user with the Google Drive URL and clear instructions for manual conversion:
  1. Click the provided URL to open the file in Google Drive
  2. Right-click the file and select "Open with" → "Google Docs"
  3. Google Docs will automatically convert the markdown with proper native bullet list formatting
  4. The converted document will have proper indentation and native Google Docs bullets
- This approach ensures native bullet formatting that programmatic conversion cannot achieve

## Output

The script should provide:

- **Job Analysis Summary**: Key requirements and keywords identified
- **Resume Changes Made**: List of specific modifications
- **ATS Optimization Notes**: Keywords added, sections reordered
- **Match Score Estimate**: Rough percentage of requirement alignment
- **File Locations**: Links to saved job description and **uploaded markdown resume**
- **Conversion Instructions**: Clear step-by-step instructions for manual conversion to Google Docs with native bullet formatting
- **Final Deliverable**: Google Drive URL for the markdown file that can be manually converted to a properly formatted Google Doc with native bullets

## Examples

### Technical Writer Role

\`\`\`
Please tailor my resume for this Anthropic technical writer position: [job URL]
Role type: technical_writer
\`\`\`

### Software Engineer Role

\`\`\`
Tailor my resume for Google's Software Engineer role.
Role type: software_engineer
Here's the job description: [paste text]
\`\`\`

### Engineering Manager Role

\`\`\`
Tailor my resume for the "Senior Engineering Manager" role at Meta
Role type: engineering_manager
Job URL: [URL]
\`\`\`

### Technical Writing Manager Role

\`\`\`
Create a resume for Microsoft's Technical Writing Manager position
Role type: technical_writing_manager
Company: Microsoft
\`\`\`

## Troubleshooting

**Job URL Scraping Issues:**

- Try copying the job description manually if scraping fails
- Some sites require JavaScript rendering - provide fallback text input

**Google Drive Access:**

- Ensure proper folder permissions
- Verify folder names match exactly

**Resume Formatting:**

- Maintain original Google Docs formatting
- Use batch updates for efficiency

**ATS Optimization:**

- Focus on natural keyword integration
- Avoid over-optimization that hurts readability
- Test with different ATS tools if available

## Success Metrics

- Resume includes 80%+ of key job requirements
- Natural keyword integration without stuffing
- Relevant experience prominently featured
- **Final deliverable is a markdown file uploaded to Google Drive with clear conversion instructions**
- Complete documentation trail (job description saved)
- **Manual conversion process preserves native bullet formatting for optimal presentation**
- Single markdown file optimized for conversion to professional Google Doc`
};
