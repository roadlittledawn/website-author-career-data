# Job Application Agent - Functional Requirements

## Overview
AI-assisted job application agent that creates tailored resumes and cover letters based on career data and specific job postings.

## Core Features

### 1. Job Application Agent Page
- **Location**: `/app/job-agent/`
- **Authentication**: Requires existing JWT authentication
- **Inputs**:
  - Job posting URL (with content extraction)
  - Job description textarea (paste option)
  - Job type selector: Technical Writer, Technical Writing Manager, Software Engineer, Software Engineering Manager

### 2. Resume Generation Workflow
1. Fetch job posting content from URL or use pasted description
2. Prompt user for additional information/emphasis preferences
3. Generate tailored resume draft in markdown using existing AI assistant integration
4. Display rendered HTML preview with edit capabilities
5. Allow iterative feedback and regeneration
6. Finalize button creates:
   - Downloadable markdown file
   - Printable view page

### 3. Cover Letter Generation Workflow
1. Optional step after resume finalization
2. Prompt for tone and emphasis instructions
3. Generate tailored cover letter draft
4. Same review/edit/finalize flow as resume

### 4. Application Questions Assistant
1. Optional step after cover letter completion
2. Handle application questions one at a time
3. Iterative refinement for each question
4. Move to next question when user approves

### 5. Session Summary
- Final summary of all generated content
- Placeholder for future Google Drive integration

## Data Requirements

### Inputs
- Job posting URL or pasted description
- Job type selection
- User preferences and emphasis points
- Feedback and revision requests

### Outputs
- Tailored resume (markdown + HTML preview)
- Tailored cover letter (markdown + HTML preview)
- Application question responses
- Session summary

### Data Sources
- Existing career data collections (Profile, Experiences, Skills, Projects, Education)
- Job posting content
- User-provided context and preferences

## Integration Points

### Existing Systems
- AI assistant infrastructure (`ai-assistant.js`, `AIChatPanel.tsx`)
- Career data API endpoints
- JWT authentication system
- CSS modules and styling patterns

### Future Enhancements
- Google Drive OAuth2 integration for document archival
- Enhanced job posting content extraction
- Application tracking system
