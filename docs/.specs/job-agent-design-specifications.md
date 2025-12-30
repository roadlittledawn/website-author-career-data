# Job Application Agent - Design Specifications

## Page Structure

### Main Job Agent Page (`/app/job-agent/page.tsx`)

```
┌─────────────────────────────────────┐
│ Job Application Agent               │
├─────────────────────────────────────┤
│ Step 1: Job Information             │
│ • Job URL input                     │
│ • Job description textarea          │
│ • Job type selector                 │
│ • [Start] button                    │
├─────────────────────────────────────┤
│ Step 2: Resume Generation           │
│ • Additional info prompt            │
│ • Resume preview panel              │
│ • Edit/feedback controls            │
│ • [Finalize Resume] button          │
├─────────────────────────────────────┤
│ Step 3: Cover Letter (Optional)     │
│ • Similar layout to resume          │
├─────────────────────────────────────┤
│ Step 4: Application Questions       │
│ • Question input                    │
│ • Response generation               │
│ • Iteration controls                │
├─────────────────────────────────────┤
│ Step 5: Summary                     │
│ • Generated content overview        │
│ • [Done] button                     │
└─────────────────────────────────────┘
```

## Component Architecture

### New Components Required

1. **`JobAgentWorkflow.tsx`** - Main workflow orchestrator
   - Manages overall state and step progression
   - Coordinates between sub-components

2. **`JobInfoForm.tsx`** - Job posting input form
   - URL input with validation
   - Job description textarea
   - Job type selector dropdown

3. **`ResumeGenerator.tsx`** - Resume generation and editing
   - AI generation interface
   - Preview panel with HTML rendering
   - Edit and feedback controls

4. **`CoverLetterGenerator.tsx`** - Cover letter generation
   - Similar structure to ResumeGenerator
   - Tone and emphasis input controls

5. **`ApplicationQuestionsHelper.tsx`** - Q&A assistant
   - Individual question handling
   - Response iteration interface

6. **`DocumentPreview.tsx`** - Markdown to HTML renderer
   - Live preview with edit capabilities
   - Export controls (download, print view)

## State Management

### Workflow State Interface

```typescript
interface JobAgentState {
  currentStep: 'job-info' | 'resume' | 'cover-letter' | 'questions' | 'summary'
  jobInfo: {
    url?: string
    description: string
    jobType: JobType
    additionalContext?: string
  }
  resume: {
    draft?: string
    finalized?: string
    iterations: string[]
  }
  coverLetter: {
    draft?: string
    finalized?: string
    iterations: string[]
  }
  questions: Array<{
    question: string
    response: string
    iterations: string[]
  }>
}

type JobType = 'technical-writer' | 'technical-writing-manager' | 'software-engineer' | 'software-engineering-manager'
```

## API Extensions

### New Netlify Functions

1. **`job-agent-resume.js`** - Resume generation endpoint
   - Integrates with existing AI assistant
   - Uses career data for context
   - Handles iterative refinement

2. **`job-agent-cover-letter.js`** - Cover letter generation
   - Similar structure to resume endpoint
   - Tone and emphasis parameters

3. **`job-agent-questions.js`** - Application questions helper
   - Individual question processing
   - Context-aware responses

4. **`job-scraper.js`** - Extract job posting content from URL
   - Web scraping for job descriptions
   - Content cleaning and formatting

### Existing Function Extensions

- **`ai-assistant.js`** - Add job agent specific prompts and context handling

## File Structure

```
/app/job-agent/
├── page.tsx                    # Main job agent page
├── resume-view/
│   └── page.tsx               # Printable resume view
├── cover-letter-view/
│   └── page.tsx               # Printable cover letter view
└── job-agent.module.css       # Styles

/components/
├── JobAgentWorkflow.tsx
├── JobInfoForm.tsx
├── ResumeGenerator.tsx
├── CoverLetterGenerator.tsx
├── ApplicationQuestionsHelper.tsx
└── DocumentPreview.tsx

/netlify/functions/
├── job-agent-resume.js
├── job-agent-cover-letter.js
├── job-agent-questions.js
└── job-scraper.js
```

## User Experience Flow

1. **Job Information Entry**
   - User provides job URL or pastes description
   - Selects job type from dropdown
   - System extracts/validates job content

2. **Resume Generation**
   - AI prompts for additional context
   - Generates initial draft
   - User reviews and provides feedback
   - Iterative refinement until finalized

3. **Cover Letter Generation** (Optional)
   - User chooses to proceed
   - Provides tone/emphasis instructions
   - Similar generation and refinement process

4. **Application Questions** (Optional)
   - User inputs questions one by one
   - AI generates responses
   - Refinement for each question

5. **Summary and Completion**
   - Overview of all generated content
   - Download options
   - Future: Archive to Google Drive

## Styling Approach

- Reuse existing CSS modules pattern
- Responsive design consistent with current app
- Step-based progress indicator
- Split-panel layout for generation/preview
- Mobile-first responsive design
