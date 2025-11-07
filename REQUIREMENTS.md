# Career Data Admin Web App - Requirements Document

## 1. Project Overview

### 1.1 Purpose
A private web-based admin interface for managing professional career data stored in MongoDB. This application enables efficient CRUD operations for maintaining a comprehensive career profile including work experience, skills, projects, education, and keywords for resume optimization.

### 1.2 Target User
- **Primary User**: Single admin user (Clinton)
- **Access Level**: Private, authenticated access only
- **Use Case**: Personal career data management and maintenance

### 1.3 Technology Stack
- **Frontend**: Vanilla HTML, CSS, JavaScript (no frameworks)
- **Backend**: Netlify Functions (serverless)
- **Database**: MongoDB (existing `career-data` database)
- **AI Assistant**: Claude API (Anthropic)
- **Hosting**: Netlify
- **Authentication**: Simple session-based authentication

### 1.4 Deployment Target
- **Platform**: Netlify
- **Architecture**: JAMstack (static frontend + serverless functions)
- **Configuration Management**: Environment variables via Netlify dashboard
- **Build Output**: Static files in root or designated public directory

---

## 2. Data Model & Collections

The application manages **6 primary collections** in the MongoDB `career-data` database:

### 2.1 Profile Collection
Stores personal information and professional positioning.

```javascript
{
  personalInfo: {
    name: String,
    email: String,
    phone: String,
    location: String,
    links: {
      portfolio: String,
      github: String,
      linkedin: String,
      writingSamples: String
    }
  },
  positioning: {
    current: String,  // Current elevator pitch
    byRole: {
      technical_writer: String,
      technical_writing_manager: String,
      software_engineer: String,
      engineering_manager: String
    }
  },
  valuePropositions: [String],  // Key value statements
  professionalMission: String,
  uniqueSellingPoints: [String],
  lastUpdated: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Notes**:
- Typically only one profile document exists
- Support for multiple role-specific positioning statements

### 2.2 Experiences Collection
Work history and professional experience entries.

```javascript
{
  company: String,              // Required
  location: String,             // Required
  title: String,                // Required
  industry: String,
  startDate: Date,              // Required (ISO format)
  endDate: Date,                // null for current position
  organizations: [String],      // Teams/departments worked with
  roleTypes: [Enum],            // Required: ["technical_writer", "technical_writing_manager", "software_engineer", "engineering_manager"]
  responsibilities: [String],   // Required: Key responsibilities
  achievements: [{
    description: String,        // Required
    impact: String,            // Quantifiable impact
    keywords: [String]         // Related keywords
  }],
  technologies: [String],       // Required: Technologies used
  crossFunctional: [String],   // Cross-functional collaboration details
  bulletPoints: [String],       // Required: Resume bullet points
  displayOrder: Number,         // For custom sorting
  featured: Boolean,            // Highlight on portfolio
  createdAt: Date,
  updatedAt: Date
}
```

**Validation Rules**:
- `startDate` must be a valid date
- `endDate` must be after `startDate` (if provided)
- At least one `roleType` required
- At least one item in `responsibilities`, `technologies`, and `bulletPoints`

### 2.3 Skills Collection
Categorized skills with proficiency levels.

```javascript
{
  category: String,             // Required: e.g., "Technical Writing Skills - Tools & Platforms"
  roleRelevance: [Enum],        // Required: Role types this category applies to
  skills: [{                    // Required: At least one skill
    name: String,               // Required: Skill name
    proficiency: Enum,          // "expert", "advanced", "intermediate", "beginner"
    yearsUsed: Number,
    lastUsed: Date,             // ISO format
    keywords: [String],         // Related keywords/synonyms
    featured: Boolean           // Highlight this skill
  }],
  displayOrder: Number,         // For custom sorting
  createdAt: Date,
  updatedAt: Date
}
```

**Current Skill Categories** (12 total):
1. Technical Writing Skills - Documentation Types
2. Technical Writing Skills - Tools & Platforms
3. Technical Writing Skills - Content Strategy & Information Architecture
4. Software Engineering Skills - Front end
5. Software Engineering Skills - Back end
6. Software Engineering Skills - Tools
7. Software Engineering Skills - Architecture & System Design
8. Software Engineering Skills - DevOps & Deployment
9. Management & Leadership
10. Cross-Functional Skills - AI Tools & Prompt Engineering
11. Cross-Functional Skills - Project Management Methodologies
12. Cross-Functional Skills - Industry Expertise

### 2.4 Projects Collection
Portfolio projects and significant work samples.

```javascript
{
  name: String,                 // Required: Project name
  type: Enum,                   // Required: "technical_writing", "software_engineering", "leadership", "hybrid"
  date: Date,                   // Project completion/publication date
  featured: Boolean,            // Highlight on portfolio
  overview: String,             // Required: Project description
  challenge: String,            // Problem/challenge addressed
  approach: String,             // Solution approach taken
  outcome: String,              // Results achieved
  impact: String,               // Business/user impact
  technologies: [String],       // Required: Technologies used
  keywords: [String],           // SEO/ATS keywords
  links: [{
    type: String,              // "github", "demo", "documentation", etc.
    url: String,               // Required
    description: String
  }],
  roleTypes: [Enum],            // Required: Relevant role types
  writingSample: {              // For technical writing projects
    googleDocId: String,        // Google Doc ID for viewing
    subjects: [String],         // Topics covered
    authoringTools: [String],   // Tools used to create
    format: String              // "tutorial", "API docs", "guide", etc.
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 2.5 Education Collection
Academic background and certifications.

```javascript
{
  institution: String,          // Required: School/organization name
  degree: String,               // Required: Degree or certification name
  field: String,                // Required: Field of study
  graduationYear: Number,       // Required: Year completed
  relevantCoursework: [String], // Notable courses or specializations
  displayOrder: Number,         // For custom sorting
  createdAt: Date,
  updatedAt: Date
}
```

### 2.6 Keywords Collection
ATS (Applicant Tracking System) optimization keywords by role type.

```javascript
{
  category: String,             // Required: Keyword category name
  roleType: Enum,               // "technical_writer", "technical_writing_manager", "software_engineer", "engineering_manager"
  terms: [{                     // Required: At least one term
    primary: String,            // Required: Primary keyword
    alternatives: [String],     // Synonyms/variations
    frequency: Number,          // Suggested usage count (default: 1)
    context: String             // Usage context/notes
  }],
  createdAt: Date,
  updatedAt: Date
}
```

**Enum Values (used across collections)**:
```javascript
roleTypes = [
  "technical_writer",
  "technical_writing_manager",
  "software_engineer",
  "engineering_manager"
]

proficiencyLevels = ["expert", "advanced", "intermediate", "beginner"]
projectTypes = ["technical_writing", "software_engineering", "leadership", "hybrid"]
```

---

## 3. Functional Requirements

### 3.1 Core CRUD Operations

For each of the 6 collections, the application must support:

#### 3.1.1 Create
- Display form with all required and optional fields
- Client-side validation before submission
- Success/error feedback to user
- Auto-populate `createdAt` and `updatedAt` timestamps

#### 3.1.2 Read
- **List View**: Display all records in a table/card layout
  - Sortable columns (date, name, featured status)
  - Pagination (20 items per page recommended)
  - Quick view of key fields
- **Detail View**: Display complete record with all fields
  - Format dates in readable format
  - Display arrays as lists
  - Show nested objects clearly

#### 3.1.3 Update
- Pre-populate form with existing values
- Support partial updates (only changed fields)
- Update `updatedAt` timestamp automatically
- Confirmation before saving changes

#### 3.1.4 Delete
- Confirmation dialog before deletion
- Soft delete option (mark as archived) vs. hard delete
- Cascade considerations (none currently needed)

### 3.2 Search & Filtering

#### 3.2.1 Global Search
- Search across multiple collections simultaneously
- Fields to search:
  - **Experiences**: company, title, responsibilities, achievements, technologies
  - **Skills**: category, skill names, keywords
  - **Projects**: name, overview, technologies, keywords
  - **Education**: institution, degree, field
  - **Keywords**: category, primary terms, alternatives
  - **Profile**: positioning statements, value propositions

#### 3.2.2 Collection-Specific Filters
- **By Role Type**: Filter content relevant to specific roles
- **By Featured Status**: Show only featured items
- **By Date Range**: Filter experiences and projects by date
- **By Technology**: Filter by specific technologies used
- **By Status**: Current vs. past experiences

### 3.3 Data Management

#### 3.3.1 Import/Export
- **Export Functionality**:
  - Export single collection to JSON
  - Export all career data to JSON (full profile)
  - Download as `.json` file
  - Option to export for specific role type (filtered data)

- **Import Functionality**:
  - Upload JSON file
  - Validate structure before import
  - Option to merge or replace existing data
  - Display preview before confirming import

#### 3.3.2 Bulk Operations
- Select multiple items for bulk actions:
  - Bulk delete
  - Bulk update featured status
  - Bulk update role types
  - Bulk export

#### 3.3.3 Data Validation
- Required field validation
- Date format validation
- Email format validation
- URL format validation
- Enum value validation
- Array minimum length validation

### 3.4 Dashboard

The main dashboard should display:
- **Collection Statistics**:
  - Total count for each collection
  - Featured items count
  - Recently updated items
  - Items by role type breakdown

- **Quick Actions**:
  - Add new item to any collection
  - View recent items
  - Quick search
  - Export all data

- **Alerts & Notifications**:
  - Incomplete profiles (missing required fields)
  - Old content (not updated in 6+ months)
  - Missing positioning for specific roles

---

## 4. Technical Architecture

### 4.1 Frontend Structure

```
/
├── index.html              # Dashboard/landing page
├── profile.html           # Profile management
├── experiences.html       # Experience list/CRUD
├── skills.html            # Skills management
├── projects.html          # Projects management
├── education.html         # Education management
├── keywords.html          # Keywords management
├── login.html             # Authentication page
├── css/
│   ├── main.css          # Global styles
│   ├── dashboard.css     # Dashboard-specific styles
│   ├── forms.css         # Form styles
│   ├── components.css    # Reusable components
│   └── ai-panel.css      # AI assistant side panel styles
├── js/
│   ├── app.js            # Main application logic
│   ├── api.js            # API client wrapper
│   ├── auth.js           # Authentication logic
│   ├── components.js     # Reusable UI components
│   ├── validation.js     # Form validation
│   ├── utils.js          # Utility functions
│   ├── ai-chat.js        # AI assistant chat UI component
│   └── ai-context.js     # AI context builder
└── netlify/
    └── functions/         # Serverless functions
        ├── profile.js
        ├── experiences.js
        ├── skills.js
        ├── projects.js
        ├── education.js
        ├── keywords.js
        ├── auth.js
        └── ai-assistant.js  # AI assistant API proxy
```

### 4.2 Netlify Functions (Serverless Backend)

Each function handles CRUD operations for its collection:

#### 4.2.1 Function Pattern
```javascript
// netlify/functions/experiences.js
const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };

  // Handle OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Authentication check
  const authToken = event.headers.authorization;
  if (!isAuthenticated(authToken)) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  // Connect to MongoDB
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('career-data');
  const collection = db.collection('experiences');

  // Route based on HTTP method
  try {
    let result;
    switch (event.httpMethod) {
      case 'GET':
        result = await handleGet(collection, event);
        break;
      case 'POST':
        result = await handlePost(collection, event);
        break;
      case 'PUT':
        result = await handlePut(collection, event);
        break;
      case 'DELETE':
        result = await handleDelete(collection, event);
        break;
      default:
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }
    return { statusCode: 200, headers, body: JSON.stringify(result) };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  } finally {
    await client.close();
  }
};
```

#### 4.2.2 Required Functions
- `profile.js` - Profile CRUD
- `experiences.js` - Experiences CRUD with filtering
- `skills.js` - Skills CRUD
- `projects.js` - Projects CRUD
- `education.js` - Education CRUD
- `keywords.js` - Keywords CRUD
- `auth.js` - Authentication endpoints
- `search.js` - Global search across collections
- `ai-assistant.js` - AI writing assistant (Claude API proxy)

#### 4.2.3 API Endpoints

Each function responds to RESTful patterns:
```
GET    /.netlify/functions/{collection}           # List all
GET    /.netlify/functions/{collection}?id={id}   # Get by ID
POST   /.netlify/functions/{collection}           # Create new
PUT    /.netlify/functions/{collection}?id={id}   # Update by ID
DELETE /.netlify/functions/{collection}?id={id}   # Delete by ID

# Special endpoints
GET    /.netlify/functions/search?q={query}       # Global search
POST   /.netlify/functions/auth/login             # Login
POST   /.netlify/functions/auth/logout            # Logout
GET    /.netlify/functions/auth/verify            # Verify session
POST   /.netlify/functions/ai-assistant           # AI writing assistant
```

### 4.3 Frontend Architecture

#### 4.3.1 API Client (`js/api.js`)
Centralized API communication layer:
```javascript
class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.authToken = localStorage.getItem('authToken');
  }

  async request(endpoint, method = 'GET', data = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Collection-specific methods
  async getExperiences(filters = {}) { /* ... */ }
  async createExperience(data) { /* ... */ }
  async updateExperience(id, data) { /* ... */ }
  async deleteExperience(id) { /* ... */ }
  // ... similar methods for other collections
}
```

#### 4.3.2 Component Pattern
Reusable UI components:
```javascript
// js/components.js
function createCard(title, content, actions) { /* ... */ }
function createForm(fields, onSubmit) { /* ... */ }
function createTable(headers, rows, options) { /* ... */ }
function createModal(title, content, buttons) { /* ... */ }
function showNotification(message, type) { /* ... */ }
```

#### 4.3.3 Routing
Simple hash-based routing:
```javascript
// js/app.js
const routes = {
  '#/dashboard': loadDashboard,
  '#/experiences': loadExperiences,
  '#/skills': loadSkills,
  // ...
};

window.addEventListener('hashchange', () => {
  const route = window.location.hash || '#/dashboard';
  routes[route]();
});
```

### 4.4 Database Connection

#### 4.4.1 MongoDB Configuration
- **Connection String**: Stored in environment variable `MONGODB_URI`
- **Database Name**: `career-data`
- **Collections**: 6 collections as defined in Data Model
- **Connection Pooling**: Reuse connections in serverless functions

#### 4.4.2 Environment Variables
Required in Netlify:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/career-data
AUTH_SECRET=random-secret-key-for-jwt
ADMIN_USERNAME=admin-username
ADMIN_PASSWORD_HASH=bcrypt-hashed-password
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

---

## 5. Security & Authentication

### 5.1 Authentication Requirements

#### 5.1.1 Simple Session-Based Auth
- **Login Page**: Username + Password form
- **Session Management**:
  - JWT token stored in localStorage
  - Token expiration: 24 hours
  - Refresh mechanism optional
- **Logout**: Clear token and redirect to login

#### 5.1.2 Authorization
- All API endpoints require valid auth token
- Single admin user (no role-based access control needed)
- Protected routes redirect to login if not authenticated

### 5.2 Security Best Practices

#### 5.2.1 Frontend Security
- Validate all input before sending to API
- Sanitize displayed data to prevent XSS
- Use HTTPS only (enforced by Netlify)
- Content Security Policy headers

#### 5.2.2 Backend Security
- Environment variables for sensitive data
- Password hashing (bcrypt)
- Rate limiting on auth endpoints
- Input validation and sanitization
- MongoDB injection prevention (use parameterized queries)

#### 5.2.3 API Security
- CORS configuration (restrict to your domain)
- Request size limits
- Timeout limits for database operations
- Error messages don't expose system details

---

## 6. User Interface Requirements

### 6.1 Design Principles
- **Clean & Minimal**: Focus on content, minimal distractions
- **Responsive**: Work well on desktop and tablet (mobile optional)
- **Fast**: Quick page loads, instant feedback
- **Accessible**: Semantic HTML, keyboard navigation, ARIA labels

### 6.2 Layout Structure

#### 6.2.1 Navigation
- **Top Navigation Bar**:
  - Logo/App name
  - Collection links (Profile, Experiences, Skills, Projects, Education, Keywords)
  - Search icon/field
  - User menu (Logout)

- **Side Navigation** (alternative):
  - Dashboard
  - Collections (with icons)
  - Settings
  - Export Data

#### 6.2.2 Page Layout
```
+--------------------------------------------------+
| Header (Logo, Nav, Search, User)                 |
+--------------------------------------------------+
| Breadcrumb / Page Title                          |
+--------------------------------------------------+
| Action Bar (Add New, Filter, Export)             |
+--------------------------------------------------+
|                                                  |
|  Main Content Area                               |
|  (Table, Form, or Dashboard)                     |
|                                                  |
+--------------------------------------------------+
| Footer (Copyright, Version)                      |
+--------------------------------------------------+
```

### 6.3 UI Components

#### 6.3.1 Forms
- Clear field labels
- Placeholder text for guidance
- Validation feedback (inline errors)
- Required field indicators (*)
- Help text for complex fields
- Save & Cancel buttons
- Success message after save

#### 6.3.2 Tables/Lists
- Sortable columns
- Row actions (Edit, Delete, View)
- Checkbox for bulk selection
- Pagination controls
- Empty state message
- Loading indicator

#### 6.3.3 Modals/Dialogs
- Confirmation dialogs for destructive actions
- Detail view modals
- Loading overlays
- Success/error notifications

#### 6.3.4 Dashboard Widgets
- Stat cards (collection counts)
- Recent activity feed
- Quick links
- Charts (optional, for data visualization)

### 6.4 Responsive Design
- **Desktop** (1024px+): Full layout with sidebar/top nav
- **Tablet** (768px-1023px): Collapsed nav, responsive tables
- **Mobile** (optional, <768px): Minimal support for viewing only

---

## 7. Deployment Configuration

### 7.1 Netlify Configuration

#### 7.1.1 `netlify.toml`
```toml
[build]
  command = "echo 'No build step needed for static files'"
  functions = "netlify/functions"
  publish = "."

[functions]
  node_bundler = "esbuild"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 7.1.2 Environment Variables
Set in Netlify Dashboard:
- `MONGODB_URI`: MongoDB connection string
- `AUTH_SECRET`: Secret key for JWT signing
- `ADMIN_USERNAME`: Admin username
- `ADMIN_PASSWORD_HASH`: Bcrypt hash of admin password
- `ANTHROPIC_API_KEY`: Claude API key from Anthropic

### 7.2 Build & Deploy Process

#### 7.2.1 Local Development
```bash
# Install dependencies
npm install

# Install Netlify CLI
npm install -g netlify-cli

# Run local development server
netlify dev

# Test functions locally
netlify functions:serve
```

#### 7.2.2 Deployment
```bash
# Manual deploy
netlify deploy --prod

# Or connect GitHub repo for automatic deploys
# Push to main branch → auto-deploy
```

### 7.3 Dependencies

#### 7.3.1 Backend Dependencies
```json
{
  "dependencies": {
    "mongodb": "^6.0.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "@anthropic-ai/sdk": "^0.32.0"
  }
}
```

#### 7.3.2 Frontend Dependencies
None (vanilla JavaScript)

Optional:
- CSS framework (e.g., Tailwind via CDN)
- Icon library (e.g., Font Awesome via CDN)

---

## 8. Data Validation Rules

### 8.1 Common Validation

- **Required Fields**: Must not be empty or null
- **String Fields**: Trim whitespace, max length 500 chars (unless specified)
- **Email**: Valid email format (RFC 5322)
- **URL**: Valid URL format (http/https)
- **Date**: Valid ISO 8601 format (YYYY-MM-DD)
- **Enum**: Must match one of allowed values
- **Array**: Minimum 1 item for required arrays

### 8.2 Collection-Specific Validation

#### 8.2.1 Experiences
- `startDate` ≤ `endDate` (if endDate exists)
- `endDate` ≤ today (no future dates)
- `roleTypes` array not empty
- `responsibilities`, `technologies`, `bulletPoints` arrays not empty

#### 8.2.2 Skills
- `category` required and unique
- `skills` array not empty
- Each skill must have `name`
- `proficiency` must be valid enum value

#### 8.2.3 Projects
- `name` required and should be unique
- `type` must be valid enum
- `overview` required
- `technologies` array not empty
- `roleTypes` array not empty

#### 8.2.4 Education
- `graduationYear` ≤ current year + 10 (allow future graduations)
- `graduationYear` ≥ 1950 (reasonable minimum)

#### 8.2.5 Keywords
- `category` required
- `terms` array not empty
- Each term must have `primary` field

---

## 9. Error Handling

### 9.1 Frontend Error Handling

#### 9.1.1 Form Validation Errors
- Display inline below field
- Red border on invalid field
- Clear error on field change
- Prevent submission if validation fails

#### 9.1.2 API Errors
- Display user-friendly message
- Log full error to console
- Show retry option for network errors
- Redirect to login on 401 errors

#### 9.1.3 User Notifications
```javascript
showNotification('Success message', 'success'); // Green
showNotification('Error message', 'error');     // Red
showNotification('Warning message', 'warning'); // Yellow
showNotification('Info message', 'info');       // Blue
```

### 9.2 Backend Error Handling

#### 9.2.1 HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error

#### 9.2.2 Error Response Format
```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "fieldName",
    "message": "Specific field error"
  }
}
```

---

## 10. AI Writing Assistant

### 10.1 Feature Overview

The AI Writing Assistant is an integrated feature that helps craft professional career content using Claude AI (Anthropic). It provides real-time assistance for writing positioning statements, job responsibilities, bullet points, achievements, and other career-related text.

**Key Benefits:**
- Context-aware suggestions based on your entire career profile
- Maintains consistency across all career documents
- ATS optimization recommendations
- Professional tone and formatting
- Reduces time spent writing and editing

### 10.2 User Interface

#### 10.2.1 Side Panel Design
- **Position**: Slides in from the right side of the screen
- **Width**: 400px on desktop, 100% on mobile
- **Visibility**: Hidden by default, opens on "Ask AI" button click
- **Persistence**: Remains open during editing session, can be collapsed

#### 10.2.2 UI Components
```
+----------------------------------+
| AI Writing Assistant        [X]  |
+----------------------------------+
| Context: Editing "Experience"    |
| Company: Google                  |
| Role: Technical Writer           |
+----------------------------------+
|                                  |
| Chat History:                    |
|                                  |
| [User] Help me write...          |
| [AI] Based on your profile...    |
|                                  |
| [User] Make it more concise      |
| [AI] Here's a shorter version... |
|                                  |
+----------------------------------+
| Type your message...        [>]  |
+----------------------------------+
```

#### 10.2.3 Integration Points
- **"Ask AI" Button**: Appears on all edit forms (experiences, skills, projects, profile, etc.)
- **Field-Level Actions**: Right-click or button next to text areas for quick AI help
- **Bulk Actions**: "Improve all bullet points" or "Optimize for ATS"

### 10.3 Context Management Strategy

#### 10.3.1 Smart Context Approach
The AI receives **role-specific context** tailored to the current editing task:

**1. Profile Summary** (~2-3k tokens):
```javascript
{
  name: "Clinton",
  currentPositioning: "Technical Writer and Engineering Leader...",
  roleType: "technical_writer",  // Current role being edited
  valuePropositions: [
    "Expert in developer documentation...",
    "Proven track record of..."
  ],
  careerHighlights: [
    "10+ years experience",
    "Led teams of 5+ writers",
    "Published 100+ technical articles"
  ]
}
```

**2. Current Item Detail** (~1-2k tokens):
- Full detail of the experience, project, or section being edited
- All fields including responsibilities, achievements, technologies
- Dates and context about the role

**3. Related Context** (~2-3k tokens):
- **Skills**: Relevant skills for the current role type
- **Keywords**: ATS keywords for the role type
- **Other Experiences**: Related experiences for consistency checking
- **Projects**: Related projects for cross-referencing

**Total Context**: ~5-8k tokens per request

#### 10.3.2 Context Builder Function
```javascript
// js/ai-context.js
async function buildSmartContext(options) {
  const {
    collection,      // 'experiences', 'projects', 'profile', etc.
    itemId,          // ID of current item being edited
    roleType,        // 'technical_writer', 'software_engineer', etc.
    field           // Specific field being edited (optional)
  } = options;

  // 1. Always include profile summary
  const profile = await api.getProfile();
  const profileSummary = {
    name: profile.personalInfo.name,
    positioning: profile.positioning.byRole[roleType] || profile.positioning.current,
    valueProps: profile.valuePropositions.slice(0, 3),
    mission: profile.professionalMission
  };

  // 2. Get current item detail
  let currentItem = null;
  if (itemId && collection !== 'profile') {
    const getter = `get${capitalize(collection)}`;
    currentItem = await api[getter](itemId);
  } else if (collection === 'profile') {
    currentItem = profile;
  }

  // 3. Get related context based on collection type
  const relatedContext = {};

  if (collection === 'experiences' || collection === 'projects') {
    // Get relevant skills
    relatedContext.skills = await api.getSkills({
      roleRelevance: roleType
    });

    // Get ATS keywords
    relatedContext.keywords = await api.getKeywords({
      roleType: roleType
    });

    // Get other experiences for consistency
    if (collection === 'experiences') {
      const allExperiences = await api.getExperiences({
        roleTypes: roleType,
        limit: 3
      });
      relatedContext.recentExperiences = allExperiences
        .filter(exp => exp._id !== itemId)
        .slice(0, 2);
    }
  }

  return {
    profileSummary,
    currentItem,
    relatedContext,
    editingContext: {
      collection,
      roleType,
      field
    }
  };
}
```

### 10.4 AI System Prompt

The AI assistant uses a specialized system prompt optimized for career writing:

```
You are an expert career development writing assistant helping Clinton craft
professional career documents. You have access to his complete career profile
and should provide context-aware suggestions.

Your responsibilities:
1. Write in a professional but authentic voice that matches Clinton's existing content
2. Include quantifiable metrics and measurable impact whenever possible
3. Optimize content for Applicant Tracking Systems (ATS) using relevant keywords
4. Ensure consistency with the existing career narrative and positioning
5. Tailor content for the specific role type: {roleType}
6. Use strong action verbs and clear, concise language
7. Focus on achievements and outcomes, not just responsibilities

Context provided:
- Profile summary with positioning and value propositions
- Current item being edited with full details
- Related skills, keywords, and experiences for reference
- Target role type: {roleType}

Guidelines:
- Bullet points should be 1-2 lines, starting with strong action verbs
- Achievements should include metrics (%, $, #, time saved, etc.)
- Avoid clichés like "team player", "hard worker", "self-motivated"
- Use industry-standard terminology and keywords
- Maintain consistency in tense (past for previous roles, present for current)

When asked to improve or generate content:
1. First, understand the context and goals
2. Reference specific experiences, skills, or projects from the career data
3. Provide 2-3 variations when appropriate
4. Explain your reasoning for suggestions
5. Offer to iterate and refine based on feedback
```

### 10.5 API Design

#### 10.5.1 Request Format
```javascript
// POST /.netlify/functions/ai-assistant
{
  "messages": [
    {
      "role": "user",
      "content": "Help me write bullet points for my Technical Writer role at Google"
    }
  ],
  "context": {
    "profileSummary": { /* profile summary object */ },
    "currentItem": { /* current experience being edited */ },
    "relatedContext": { /* skills, keywords, etc. */ },
    "editingContext": {
      "collection": "experiences",
      "roleType": "technical_writer",
      "field": "bulletPoints"
    }
  },
  "options": {
    "stream": true,  // Enable streaming responses
    "maxTokens": 1000,
    "temperature": 0.7
  }
}
```

#### 10.5.2 Response Format
**Streaming Response** (Server-Sent Events):
```
data: {"type": "content_block_start", "index": 0}
data: {"type": "content_block_delta", "delta": {"text": "Based on "}}
data: {"type": "content_block_delta", "delta": {"text": "your role at Google..."}}
data: {"type": "content_block_stop"}
data: {"type": "message_stop"}
```

**Non-Streaming Response**:
```json
{
  "message": {
    "role": "assistant",
    "content": "Based on your role at Google as a Technical Writer..."
  },
  "usage": {
    "input_tokens": 7234,
    "output_tokens": 456,
    "cached_tokens": 5000
  }
}
```

### 10.6 Backend Implementation

#### 10.6.1 Netlify Function (`netlify/functions/ai-assistant.js`)
```javascript
const Anthropic = require('@anthropic-ai/sdk');
const { MongoClient } = require('mongodb');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Authentication check
  const authToken = event.headers.authorization;
  if (!isAuthenticated(authToken)) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  try {
    const { messages, context, options = {} } = JSON.parse(event.body);

    // Build system prompt with context
    const systemPrompt = buildSystemPrompt(context);

    // Call Claude API with streaming
    const stream = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: options.maxTokens || 1000,
      temperature: options.temperature || 0.7,
      system: systemPrompt,
      messages: messages,
      stream: options.stream || false,
    });

    // Handle streaming response
    if (options.stream) {
      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
        body: stream, // Netlify handles SSE streaming
      };
    }

    // Handle non-streaming response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: stream.content[0],
        usage: stream.usage,
      }),
    };
  } catch (error) {
    console.error('AI Assistant Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to get AI response',
        details: error.message
      }),
    };
  }
};

function buildSystemPrompt(context) {
  const { profileSummary, editingContext } = context;

  return `You are an expert career development writing assistant helping ${profileSummary.name} craft professional career documents.

Target Role: ${editingContext.roleType.replace('_', ' ').toUpperCase()}
Current Editing: ${editingContext.collection}${editingContext.field ? ` (${editingContext.field})` : ''}

Profile Context:
- Positioning: ${profileSummary.positioning}
- Key Value Props: ${profileSummary.valueProps.join('; ')}

[Full system prompt as detailed in section 10.4...]`;
}

function isAuthenticated(token) {
  // JWT verification logic
  return true; // Simplified for example
}
```

### 10.7 Frontend Implementation

#### 10.7.1 AI Chat UI Component (`js/ai-chat.js`)
```javascript
class AIChat {
  constructor(api) {
    this.api = api;
    this.isOpen = false;
    this.chatHistory = [];
    this.currentContext = null;
    this.element = null;
  }

  async open(options) {
    // Build context for current editing session
    this.currentContext = await buildSmartContext(options);

    // Create UI if not exists
    if (!this.element) {
      this.element = this.createChatUI();
      document.body.appendChild(this.element);
    }

    // Show context indicator
    this.updateContextIndicator(options);

    // Slide in panel
    this.element.classList.add('open');
    this.isOpen = true;
  }

  close() {
    this.element.classList.remove('open');
    this.isOpen = false;
  }

  async sendMessage(userMessage) {
    // Add user message to chat
    this.addMessage('user', userMessage);

    // Show typing indicator
    this.showTypingIndicator();

    try {
      // Call AI assistant API with streaming
      const response = await this.api.callAI({
        messages: [
          ...this.chatHistory,
          { role: 'user', content: userMessage }
        ],
        context: this.currentContext,
        options: { stream: true }
      });

      // Handle streaming response
      const assistantMessage = await this.handleStreamingResponse(response);

      // Add to chat history
      this.chatHistory.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: assistantMessage }
      );

      this.hideTypingIndicator();
    } catch (error) {
      this.showError('Failed to get AI response. Please try again.');
      this.hideTypingIndicator();
    }
  }

  async handleStreamingResponse(stream) {
    const messageElement = this.addMessage('assistant', '');
    let fullMessage = '';

    // Process SSE stream
    const reader = stream.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));

          if (data.type === 'content_block_delta') {
            fullMessage += data.delta.text;
            messageElement.textContent = fullMessage;

            // Auto-scroll to bottom
            this.scrollToBottom();
          }
        }
      }
    }

    return fullMessage;
  }

  createChatUI() {
    const panel = document.createElement('div');
    panel.className = 'ai-chat-panel';
    panel.innerHTML = `
      <div class="ai-chat-header">
        <h3>AI Writing Assistant</h3>
        <button class="close-btn" onclick="aiChat.close()">&times;</button>
      </div>
      <div class="ai-chat-context">
        <span class="context-indicator"></span>
      </div>
      <div class="ai-chat-messages"></div>
      <div class="ai-chat-input">
        <textarea
          placeholder="Ask AI to help you write..."
          rows="3"
        ></textarea>
        <button class="send-btn">Send</button>
      </div>
    `;

    // Attach event listeners
    panel.querySelector('.send-btn').addEventListener('click', () => {
      const input = panel.querySelector('textarea');
      if (input.value.trim()) {
        this.sendMessage(input.value);
        input.value = '';
      }
    });

    // Enter to send (Shift+Enter for new line)
    panel.querySelector('textarea').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        panel.querySelector('.send-btn').click();
      }
    });

    return panel;
  }

  addMessage(role, content) {
    const messagesContainer = this.element.querySelector('.ai-chat-messages');
    const messageEl = document.createElement('div');
    messageEl.className = `ai-message ai-message-${role}`;

    if (role === 'assistant') {
      // Render markdown and add copy button
      messageEl.innerHTML = `
        <div class="message-content">${this.renderMarkdown(content)}</div>
        <button class="copy-btn" onclick="aiChat.copyToClipboard(this)">
          Copy
        </button>
      `;
    } else {
      messageEl.textContent = content;
    }

    messagesContainer.appendChild(messageEl);
    this.scrollToBottom();

    return messageEl.querySelector('.message-content') || messageEl;
  }

  updateContextIndicator(options) {
    const indicator = this.element.querySelector('.context-indicator');
    indicator.textContent = `Editing: ${options.collection} | Role: ${options.roleType}`;
  }

  renderMarkdown(text) {
    // Simple markdown rendering (bold, italic, lists, code blocks)
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\n- /g, '\n• ')
      .replace(/\n/g, '<br>');
  }

  copyToClipboard(button) {
    const content = button.previousElementSibling.textContent;
    navigator.clipboard.writeText(content);

    // Visual feedback
    button.textContent = 'Copied!';
    setTimeout(() => {
      button.textContent = 'Copy';
    }, 2000);
  }

  showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    this.element.querySelector('.ai-chat-messages').appendChild(indicator);
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    const indicator = this.element.querySelector('.typing-indicator');
    if (indicator) indicator.remove();
  }

  scrollToBottom() {
    const messages = this.element.querySelector('.ai-chat-messages');
    messages.scrollTop = messages.scrollHeight;
  }

  showError(message) {
    this.addMessage('system', `Error: ${message}`);
  }
}

// Initialize global AI chat instance
const aiChat = new AIChat(api);
```

#### 10.7.2 Integration with Edit Forms
```javascript
// Add "Ask AI" button to forms
function addAIButton(formElement, options) {
  const button = document.createElement('button');
  button.className = 'ask-ai-btn';
  button.textContent = '✨ Ask AI';
  button.type = 'button';

  button.addEventListener('click', () => {
    aiChat.open({
      collection: options.collection,
      itemId: options.itemId,
      roleType: options.roleType,
      field: options.field
    });
  });

  formElement.querySelector('.form-actions').prepend(button);
}

// Example usage in experiences edit form
addAIButton(experienceForm, {
  collection: 'experiences',
  itemId: currentExperience._id,
  roleType: currentExperience.roleTypes[0],
  field: 'bulletPoints'
});
```

### 10.8 Cost Management & Optimization

#### 10.8.1 Estimated Costs
- **Claude 3.5 Sonnet Pricing**:
  - Input: $3 per million tokens
  - Output: $15 per million tokens
  - Cached input: $0.30 per million tokens (10x cheaper)

- **Typical Usage**:
  - Context per request: ~7,000 tokens input
  - Response per request: ~500 tokens output
  - Cost per request: ~$0.03 (with caching: ~$0.008)

- **Monthly Estimate** (100 requests):
  - Without caching: ~$3.00
  - With caching: ~$0.80

#### 10.8.2 Optimization Strategies
1. **Prompt Caching**: Cache profile and context data for 5-minute windows
2. **Rate Limiting**: Max 20 requests per hour per user
3. **Token Limits**: Cap responses at 1,000 tokens
4. **Context Compression**: Summarize large experiences/projects
5. **Local Caching**: Cache common requests in browser

#### 10.8.3 Prompt Caching Implementation
```javascript
// Use system cache_control to cache context
const systemPrompt = [
  {
    type: "text",
    text: "You are an expert career development writing assistant...",
    cache_control: { type: "ephemeral" }
  },
  {
    type: "text",
    text: JSON.stringify(profileSummary),
    cache_control: { type: "ephemeral" }
  },
  {
    type: "text",
    text: JSON.stringify(relatedContext),
    cache_control: { type: "ephemeral" }
  }
];
```

### 10.9 Privacy & Security

#### 10.9.1 Data Handling
- ✅ All career data stays within your control (MongoDB → Netlify → Claude)
- ✅ No data stored by Anthropic (standard API, no training on user data)
- ✅ API key securely stored in environment variables
- ✅ All requests authenticated via JWT
- ✅ HTTPS encryption for all API calls

#### 10.9.2 Best Practices
- Never log conversation history to external services
- Clear chat history when closing AI panel (option)
- Rate limit to prevent abuse/excess costs
- Monitor API usage via Anthropic dashboard

### 10.10 User Experience Guidelines

#### 10.10.1 When to Use AI Assistant
**Good use cases:**
- Writing positioning statements for different role types
- Generating bullet points for job responsibilities
- Improving existing content for clarity and impact
- Adding quantifiable metrics to achievements
- Optimizing content for ATS keywords
- Brainstorming alternative phrasing

**Less effective for:**
- Making up facts or experiences
- Writing about technologies you haven't used
- Creating completely fictional job descriptions

#### 10.10.2 User Guidance
Display tips in the AI panel:
- "The AI knows your entire career history and can reference past experiences"
- "Be specific about what you want (e.g., 'Make this more concise' vs 'Improve this')"
- "You can ask for multiple variations"
- "Review AI suggestions carefully - it may occasionally need correction"

### 10.11 Testing Checklist

- [ ] AI panel opens and closes smoothly
- [ ] Context correctly built for each collection type
- [ ] Streaming responses display in real-time
- [ ] Copy to clipboard works
- [ ] Error handling for API failures
- [ ] Rate limiting works correctly
- [ ] Authentication required for AI endpoint
- [ ] Markdown rendering works
- [ ] Chat history persists during session
- [ ] Context indicator shows correct info
- [ ] Mobile responsive design works
- [ ] Costs stay within expected range

---

## 11. Future Enhancements

### 11.1 Phase 2 Features (Future)
- **Resume Generator**:
  - Generate tailored resumes for each role type
  - Export to PDF, DOCX, HTML
  - ATS optimization scoring

- **Portfolio Website Mode**:
  - Public-facing portfolio view
  - Showcase featured projects
  - Link to writing samples

- **Version Control**:
  - Track changes over time
  - Revert to previous versions
  - Compare versions

### 11.2 Phase 3 Features (Future)
- **Advanced Analytics**:
  - Skills gap analysis
  - Career progression visualization
  - Technology trend analysis

- **Resume Generator** (moved from Phase 2):
  - Auto-suggest bullet points
  - Resume optimization recommendations
  - Keyword extraction from job descriptions

- **Multi-User Support**:
  - Support multiple career profiles
  - Team collaboration features
  - Role-based access control

---

## 12. Testing Requirements

### 12.1 Manual Testing Checklist

#### 12.1.1 CRUD Operations
- [ ] Create new item in each collection
- [ ] Read/view item details
- [ ] Update existing item
- [ ] Delete item with confirmation
- [ ] Bulk operations work correctly

#### 12.1.2 Search & Filter
- [ ] Global search returns relevant results
- [ ] Filter by role type works
- [ ] Filter by featured status works
- [ ] Date range filtering works

#### 12.1.3 Authentication
- [ ] Login with correct credentials succeeds
- [ ] Login with wrong credentials fails
- [ ] Protected pages redirect to login
- [ ] Logout clears session

#### 12.1.4 Data Validation
- [ ] Required fields prevent submission
- [ ] Invalid email format rejected
- [ ] Invalid date format rejected
- [ ] Enum validation works

#### 12.1.5 Error Handling
- [ ] Network errors display appropriate message
- [ ] Form validation errors display inline
- [ ] API errors don't crash app

#### 12.1.6 AI Writing Assistant
- [ ] AI panel opens and closes correctly
- [ ] Context builds successfully for all collection types
- [ ] Streaming responses work
- [ ] Copy to clipboard works
- [ ] AI suggestions are relevant and helpful

### 12.2 Browser Compatibility
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## 13. Success Criteria

The project is considered successful when:

1. **Functional Completeness**
   - All 6 collections support full CRUD operations
   - Search and filtering work across all collections
   - Data import/export functionality works
   - Authentication protects all routes

2. **Usability**
   - Admin can efficiently add/edit/delete career data
   - Forms are intuitive and provide clear validation feedback
   - Search returns relevant results quickly
   - Dashboard provides useful overview

3. **Technical Quality**
   - Application deploys successfully to Netlify
   - Netlify Functions connect to MongoDB successfully
   - Environment variables are secure
   - No major bugs or errors in console

4. **Performance**
   - Page loads in < 2 seconds
   - API responses in < 1 second
   - Smooth interactions (no lag)

5. **Security**
   - Authentication required for all operations
   - Environment variables not exposed
   - Input validation prevents injection attacks

---

## 14. Project Timeline (Estimated)

### Phase 1: Foundation (Week 1-2)
- [ ] Project setup and configuration
- [ ] Netlify Functions boilerplate
- [ ] Authentication implementation
- [ ] Database connection setup

### Phase 2: Core CRUD (Week 3-4)
- [ ] Profile management page
- [ ] Experiences CRUD
- [ ] Skills CRUD
- [ ] Projects CRUD

### Phase 3: Additional Collections (Week 5)
- [ ] Education CRUD
- [ ] Keywords CRUD
- [ ] Global search implementation

### Phase 4: Polish & Deploy (Week 6)
- [ ] Dashboard implementation
- [ ] UI/UX refinements
- [ ] Testing and bug fixes
- [ ] Production deployment

---

## 15. References & Resources

### 15.1 Documentation
- [Netlify Functions Docs](https://docs.netlify.com/functions/overview/)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/)
- [JWT Authentication](https://jwt.io/introduction)
- [Anthropic Claude API Docs](https://docs.anthropic.com/)

### 15.2 Code Examples
- Netlify Functions examples: https://functions.netlify.com/examples/
- MongoDB CRUD operations: https://www.mongodb.com/docs/manual/crud/
- Claude API Streaming: https://docs.anthropic.com/en/api/streaming

### 15.3 Design Resources
- Color palette: To be defined
- Icon library: Font Awesome or Heroicons
- CSS reset: Normalize.css

---

## Appendix A: MCP MongoDB Tools Reference

The following MCP tools are available for interacting with the MongoDB database:

### Career Management Tools
- `career_get_full_profile()` - Get complete career profile
- `career_get_by_role(roleType)` - Filter by role type
- `career_update_profile(updates)` - Update profile info
- `career_upsert_experience(data)` - Add/update experience
- `career_update_skills(data)` - Update skills by category
- `career_search(query, searchIn[])` - Search across collections
- `career_get_for_resume(roleType, options)` - Get resume-optimized data
- `career_export_portfolio(format, sections[])` - Export for portfolio

### CRUD Operations
- `mongodb_query_experiences(filters)` - Query experiences
- `mongodb_create_experience(data)` - Create new experience
- `mongodb_update_experience(id, updates)` - Update experience
- `mongodb_get_experience(id)` - Get specific experience

- `mongodb_query_skills(filters)` - Query skills
- `mongodb_create_skill(data)` - Create new skill category
- `mongodb_update_skill(id, updates)` - Update skill category
- `mongodb_get_skill(id)` - Get specific skill category

- `mongodb_query_projects(filters)` - Query projects
- `mongodb_create_project(data)` - Create new project
- `mongodb_update_project(id, updates)` - Update project
- `mongodb_get_project(id)` - Get specific project

- `mongodb_query_keywords(filters)` - Query keywords
- `mongodb_create_keyword(data)` - Create keyword category
- `mongodb_update_keyword(id, updates)` - Update keyword category
- `mongodb_get_keyword(id)` - Get specific keyword category

---

**Document Version**: 1.1
**Last Updated**: 2025-11-07
**Author**: Claude (with Clinton)
**Status**: Draft for Review - AI Writing Assistant Feature Added
