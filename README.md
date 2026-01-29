# Career Data Admin Web App

A Next.js admin interface for managing professional career data via GraphQL API.

## Features

- ✅ **Career Data Management**: Full CRUD operations for profile, experiences, skills, projects, and education
- ✅ **JWT Authentication**: Secure login with bcrypt password hashing and JWT tokens (24-hour sessions)
- ✅ **GraphQL API**: Type-safe queries and mutations via centralized GraphQL API
- ✅ **Compact Grid Layouts**: Efficient data display with icon-based actions (👁️ view, ✏️ edit, 🗑️ delete)
- 📱 **Responsive Design**: Mobile-first design that works on all screen sizes
- ☁️ **Serverless Backend**: AWS Lambda-hosted GraphQL API

## Tech Stack

- **Frontend**: Next.js 14 (React) with App Router, TypeScript
- **Backend**: GraphQL API (AWS Lambda)
- **Database**: MongoDB Atlas
- **Authentication**: JWT (jsonwebtoken) + bcrypt password hashing
- **API Client**: graphql-request
- **Styling**: CSS Modules with responsive grid layouts
- **Forms**: React Hook Form

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Access to GraphQL API (api-career-data)
- API key for GraphQL API authentication

### Local Development with API

**Option 1: Use Production API**
```env
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://ID.lambda-url.REGION.on.aws/graphql
NEXT_PUBLIC_API_KEY=your-api-key
```

**Option 2: Use Local API Server**
```env
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
NEXT_PUBLIC_API_KEY=your-api-key
```

Start the local API server first (in api-career-data repo):
```bash
cd ../api-career-data
npm run dev  # Starts on http://localhost:4000
```

Then start this app:
```bash
npm run dev  # Starts on http://localhost:8888
```

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/roadlittledawn/website-author-career-data.git
   cd website-author-career-data
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   Create a `.env` file in the root directory:

   ```env
   # Authentication
   AUTH_SECRET=your-secret-key-for-jwt-signing
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD_HASH=your-bcrypt-hashed-password

   # GraphQL API
   NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://ID.lambda-url.REGION.on.aws/graphql
   NEXT_PUBLIC_API_KEY=your-api-key-here
   ```

   **To generate password hash**:

   ```bash
   node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
   ```

4. **Run the development server**:

   ```bash
   npm run dev
   ```

5. **Open your browser**: Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with auth
│   ├── page.tsx                 # Dashboard (home page)
│   ├── globals.css              # Global styles
│   ├── login/                   # Login page
│   ├── profile/                 # Profile CRUD (singleton)
│   ├── experiences/             # Experiences CRUD
│   ├── skills/                  # Skills CRUD
│   ├── projects/                # Projects CRUD
│   └── education/               # Education CRUD
├── components/
│   ├── ExperienceForm.tsx       # Experience form component
│   ├── SkillsForm.tsx           # Skills form component
│   ├── ProjectForm.tsx          # Project form component
│   ├── EducationForm.tsx        # Education form component
│   └── ProfileForm.tsx          # Profile form component
├── lib/
│   ├── types.ts                 # TypeScript type definitions
│   ├── api.ts                   # GraphQL API client functions
│   ├── graphql-client.ts        # GraphQL client configuration
│   └── auth.ts                  # Authentication utilities
├── netlify/
│   └── functions/
│       ├── auth-login.js        # Login endpoint (JWT)
│       ├── auth-logout.js       # Logout endpoint
│       └── auth-verify.js       # Token verification
├── public/                       # Static assets
├── next.config.mjs              # Next.js configuration
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies
└── REQUIREMENTS.md              # Detailed requirements document
```

## Deployment

### Deploy to Netlify

1. **Connect to Netlify**:

   - Push your code to GitHub
   - Go to [Netlify](https://netlify.com) and create a new site
   - Connect to your GitHub repository
   - Netlify will auto-detect Next.js configuration

2. **Set environment variables**: In Netlify dashboard, go to **Site settings** → **Environment variables** and add:

   - `AUTH_SECRET` - Secret key for JWT signing
   - `ADMIN_USERNAME` - Admin username (e.g., `admin`)
   - `ADMIN_PASSWORD_HASH` - Bcrypt hashed password
   - `NEXT_PUBLIC_GRAPHQL_ENDPOINT` - GraphQL API endpoint URL
   - `NEXT_PUBLIC_API_KEY` - API key for GraphQL API

3. **Deploy**:

   ```bash
   npm run build  # Test build locally first
   ```

   Or simply push to your main branch for automatic deployment.

### Netlify Configuration

The `netlify.toml` file is configured with:

- Next.js plugin (`@netlify/plugin-nextjs`)
- Serverless functions directory
- Security headers
- Static asset caching

## Data Model

The app manages 5 main collections:

1. **Profile** (Singleton): Personal info, positioning, value propositions
2. **Experiences**: Work history with achievements and bullet points
3. **Skills**: Individual skills with proficiency levels and role relevance
4. **Projects**: Portfolio projects and writing samples
5. **Education**: Academic background with degrees and coursework

See [REQUIREMENTS.md](./REQUIREMENTS.md) for detailed schema documentation.

## GraphQL API

The app connects to a centralized GraphQL API hosted on AWS Lambda. All queries and mutations require API key authentication via `X-API-Key` header.

**API Endpoint**: `https://ID.lambda-url.REGION.on.aws/graphql`

### Example Queries

**Get all experiences:**
```graphql
query {
  experiences {
    id company title startDate endDate technologies
  }
}
```

**Get profile:**
```graphql
query {
  profile {
    id
    personalInfo { name email location }
    positioning { headline summary }
  }
}
```

### Example Mutations

**Create experience:**
```graphql
mutation {
  createExperience(input: {
    company: "Company Name"
    title: "Job Title"
    location: "City, State"
    startDate: "2020-01-01"
    roleTypes: ["software_engineer"]
    responsibilities: ["Responsibility 1"]
    achievements: []
    technologies: ["JavaScript", "React"]
    featured: false
  }) {
    id company title
  }
}
```

For complete schema documentation, see the [api-career-data repository](https://github.com/roadlittledawn/api-career-data).

## Development

### Branch Strategy

- **`develop`**: Default branch for active development. All feature branches are created from and merged into `develop`.
- **`main`**: Release/production branch that deploys to Netlify.

### Pull Request Workflow

**PRs to `develop`:**
1. Create feature branch from `develop`
2. Make changes and push to origin
3. Open PR targeting `develop`
4. GitHub Actions runs build validation (required check)
5. Merge after build passes

**PRs to `main` (releases):**
1. Open PR from `develop` to `main`
2. Netlify triggers a deploy preview build (required check)
3. Review the deploy preview at the provided URL
4. Merge after preview build succeeds
5. Netlify automatically deploys to production

### CI/CD Checks

| Target Branch | Check Type | Required | Description |
|---------------|------------|----------|-------------|
| `develop` | GitHub Actions | Yes | Runs build to validate PR won't break the build |
| `main` | Netlify Deploy Preview | Yes | Creates preview deployment, validates build succeeds |

### Local Development

```bash
npm run dev         # Starts Next.js + Netlify Functions together (netlify dev)
```

### Build for Production

```bash
npm run build       # Creates optimized production build
```

### Clear Local Cache

If you encounter authentication issues during development:

```bash
rm -rf .netlify .next  # Clear Netlify and Next.js cache
npm run dev            # Restart dev server
```

## Contributing

This is a personal project, but suggestions are welcome! Please open an issue to discuss proposed changes.

## License

MIT

## Author

**Clinton** - [GitHub](https://github.com/roadlittledawn)

Built with assistance from [Claude Code](https://claude.com/claude-code)

---

## Implementation Status

### ✅ Completed

- JWT authentication with bcrypt password hashing
- CRUD pages for Profile (singleton)
- CRUD pages for Experiences
- CRUD pages for Skills with statistics
- CRUD pages for Projects
- CRUD pages for Education with statistics
- Form validation with React Hook Form
- Responsive layouts with CSS Modules
- Alphabetical sorting across all collections

### 🔜 Future Enhancements

- [ ] Add search and filtering UI
- [ ] Implement data export functionality
- [ ] Add unit and integration tests
- [ ] Performance optimization
- [ ] Keywords collection CRUD
- [ ] AI writing assistant integration

See [REQUIREMENTS.md](./REQUIREMENTS.md) for complete project specifications.
