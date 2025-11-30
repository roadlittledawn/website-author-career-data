# Career Data Admin Web App

A Next.js admin interface for managing professional career data in MongoDB.

## Features

- ✅ **Career Data Management**: Full CRUD operations for profile, experiences, skills, projects, and education
- ✅ **JWT Authentication**: Secure login with bcrypt password hashing and JWT tokens (24-hour sessions)
- ✅ **Compact Grid Layouts**: Efficient data display with icon-based actions (👁️ view, ✏️ edit, 🗑️ delete)
- 📱 **Responsive Design**: Mobile-first design that works on all screen sizes
- ☁️ **Serverless Architecture**: Netlify Functions for scalable backend API

## Tech Stack

- **Frontend**: Next.js 14 (React) with App Router, TypeScript
- **Backend**: Netlify Functions (serverless)
- **Database**: MongoDB with connection caching
- **Authentication**: JWT (jsonwebtoken) + bcrypt password hashing
- **Styling**: CSS Modules with responsive grid layouts
- **Forms**: React Hook Form

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB database (MongoDB Atlas recommended)
- Netlify CLI: `npm install -g netlify-cli`

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
   # Database
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
   MONGODB_DB_NAME=career-data

   # Authentication
   AUTH_SECRET=your-secret-key-for-jwt-signing
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD_HASH=your-bcrypt-hashed-password
   ```

   **To generate password hash**:

   ```bash
   node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
   ```

   **Note**: For local development with Netlify CLI, use `.env` (not `.env.local`)

4. **Run the development server**:

   ```bash
   npm run dev
   ```

5. **Open your browser**: Navigate to [http://localhost:3000](http://localhost:3000)

### Development with Netlify CLI

To test serverless functions locally:

```bash
npm install -g netlify-cli
netlify dev
```

This starts the Next.js app and Netlify Functions together.

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
│   ├── api.ts                   # API client functions
│   └── auth.ts                  # Authentication utilities
├── netlify/
│   └── functions/
│       ├── auth-login.js        # Login endpoint
│       ├── auth-logout.js       # Logout endpoint
│       ├── auth-verify.js       # Token verification
│       ├── experiences.js       # Experiences CRUD API
│       ├── skills.js            # Skills CRUD API
│       ├── projects.js          # Projects CRUD API
│       ├── educations.js        # Education CRUD API
│       └── profile.js           # Profile API (singleton)
├── public/                       # Static assets
├── next.config.mjs              # Next.js configuration
├── netlify.toml                 # Netlify configuration
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

   - `MONGODB_URI` - Your MongoDB connection string
   - `MONGODB_DB_NAME` - Database name (e.g., `career-data`)
   - `AUTH_SECRET` - Secret key for JWT signing
   - `ADMIN_USERNAME` - Admin username (e.g., `admin`)
   - `ADMIN_PASSWORD_HASH` - Bcrypt hashed password

3. **Deploy**:

   ```bash
   npm run build  # Test build locally first
   netlify deploy --prod
   ```

   Or simply push to your main branch for automatic deployment.

### Netlify Configuration

The `netlify.toml` file is already configured with:

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

## API Endpoints

All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### Authentication

- `POST /.netlify/functions/auth-login` - Login (returns JWT token)
- `POST /.netlify/functions/auth-logout` - Logout
- `GET /.netlify/functions/auth-verify` - Verify token validity

### Profile (Singleton)

- `GET /.netlify/functions/profile` - Get profile (creates default if not exists)
- `PUT /.netlify/functions/profile` - Update profile
- `DELETE /.netlify/functions/profile` - Reset profile to default

### Experiences

- `GET /.netlify/functions/experiences` - List all experiences
- `GET /.netlify/functions/experiences/:id` - Get single experience
- `POST /.netlify/functions/experiences` - Create experience
- `PUT /.netlify/functions/experiences/:id` - Update experience
- `DELETE /.netlify/functions/experiences/:id` - Delete experience

### Skills

- `GET /.netlify/functions/skills` - List all skills
- `GET /.netlify/functions/skills/:id` - Get single skill
- `POST /.netlify/functions/skills` - Create skill
- `PUT /.netlify/functions/skills/:id` - Update skill
- `DELETE /.netlify/functions/skills/:id` - Delete skill

### Projects

- `GET /.netlify/functions/projects` - List all projects
- `GET /.netlify/functions/projects/:id` - Get single project
- `POST /.netlify/functions/projects` - Create project
- `PUT /.netlify/functions/projects/:id` - Update project
- `DELETE /.netlify/functions/projects/:id` - Delete project

### Education

- `GET /.netlify/functions/educations` - List all education records
- `GET /.netlify/functions/educations/:id` - Get single education record
- `POST /.netlify/functions/educations` - Create education record
- `PUT /.netlify/functions/educations/:id` - Update education record
- `DELETE /.netlify/functions/educations/:id` - Delete education record

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
netlify dev         # Starts Next.js + Netlify Functions together
```

**Important**: Use `netlify dev` instead of `npm run dev` to properly run Netlify Functions locally.

### Build for Production

```bash
npm run build       # Creates optimized production build
netlify deploy --prod  # Deploy to production
```

### Clear Local Cache

If you encounter authentication issues during development:

```bash
rm -rf .netlify     # Clear cached functions
netlify dev         # Restart dev server
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
