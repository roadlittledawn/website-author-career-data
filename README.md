# Career Data Admin Web App

A Next.js admin interface for managing professional career data in MongoDB with AI writing assistance powered by Claude (Anthropic).

## Features

- 🎯 **Career Data Management**: CRUD operations for experiences, skills, projects, education, and keywords
- 🤖 **AI Writing Assistant**: Context-aware suggestions using Claude API for writing career content
- 📊 **Role-Based Organization**: Filter content by role type (technical writer, manager, engineer)
- 🔐 **Secure Admin Access**: JWT-based authentication
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- ☁️ **Serverless Architecture**: Deployed on Netlify with serverless functions

## Tech Stack

- **Frontend**: Next.js 14 (React) with App Router, TypeScript
- **Backend**: Netlify Functions (serverless)
- **Database**: MongoDB
- **AI**: Claude 3.5 Sonnet (Anthropic API)
- **Styling**: CSS Modules
- **Forms**: React Hook Form
- **Data Fetching**: TanStack React Query

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB database (MongoDB Atlas recommended)
- Anthropic API key ([get one here](https://console.anthropic.com/))
- Netlify account (for deployment)

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

   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/career-data
   AUTH_SECRET=your-secret-key-for-jwt
   ADMIN_USERNAME=your-admin-username
   ADMIN_PASSWORD_HASH=your-bcrypt-hashed-password
   ANTHROPIC_API_KEY=sk-ant-api03-your-anthropic-api-key
   ```

   **To generate password hash**:
   ```bash
   node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

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
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Dashboard (home page)
│   ├── globals.css              # Global styles
│   └── [collections]/           # Collection pages (to be built)
├── components/
│   └── AIAssistant/
│       ├── AIChat.tsx           # AI chat side panel component
│       ├── AIChat.module.css    # Chat panel styles
│       ├── AIButton.tsx         # "Ask AI" button component
│       └── AIButton.module.css  # Button styles
├── lib/
│   ├── types.ts                 # TypeScript type definitions
│   └── hooks/
│       └── useAIContext.ts      # AI context builder hook
├── netlify/
│   └── functions/
│       └── ai-assistant.js      # AI assistant serverless function
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

2. **Set environment variables**:
   In Netlify dashboard, go to **Site settings** → **Environment variables** and add:
   - `MONGODB_URI`
   - `AUTH_SECRET`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD_HASH`
   - `ANTHROPIC_API_KEY`

3. **Deploy**:
   ```bash
   npm run build  # Test build locally first
   netlify deploy --prod
   ```

   Or simply push to your main branch for automatic deployment.

### Netlify Configuration

The `netlify.toml` file is already configured with:
- Next.js plugin (`@netlify/plugin-nextjs`)
- Serverless functions (30s timeout for AI requests)
- Security headers
- Static asset caching

## Using the AI Writing Assistant

The AI assistant is context-aware and helps you write professional career content.

### In Code

```tsx
import AIButton from '@/components/AIAssistant/AIButton';

// In your form/page component
<AIButton
  collection="experiences"
  itemId={experienceId}
  roleType="technical_writer"
  field="bulletPoints"
/>
```

### Features

- **Smart Context**: AI has access to your full career profile
- **Role-Based**: Tailored suggestions for each role type
- **ATS Optimization**: Incorporates relevant keywords
- **Cost-Effective**: ~$0.008 per request with prompt caching

### Cost Estimates

- **Per Request**: ~$0.03 without caching, ~$0.008 with caching
- **Monthly** (100 requests): ~$0.80 with caching

## Data Model

The app manages 6 main collections:

1. **Profile**: Personal info, positioning, value propositions
2. **Experiences**: Work history with achievements
3. **Skills**: Categorized skills with proficiency levels
4. **Projects**: Portfolio projects and writing samples
5. **Education**: Academic background
6. **Keywords**: ATS optimization keywords

See [REQUIREMENTS.md](./REQUIREMENTS.md) for detailed schema documentation.

## API Endpoints

### Next.js API Routes (to be implemented)
- `GET /api/profile` - Get profile
- `GET /api/experiences` - List experiences
- `POST /api/experiences` - Create experience
- `PUT /api/experiences/[id]` - Update experience
- `DELETE /api/experiences/[id]` - Delete experience
- (Similar routes for other collections)

### Netlify Functions
- `POST /.netlify/functions/ai-assistant` - AI writing assistant

## Development

### Run Tests
```bash
npm run lint        # ESLint
npm run type-check  # TypeScript check
```

### Build for Production
```bash
npm run build       # Creates optimized production build
npm run start       # Starts production server locally
```

## Contributing

This is a personal project, but suggestions are welcome! Please open an issue to discuss proposed changes.

## License

MIT

## Author

**Clinton** - [GitHub](https://github.com/roadlittledawn)

Built with assistance from [Claude Code](https://claude.com/claude-code)

---

## Next Steps

- [ ] Implement authentication flow
- [ ] Build CRUD pages for all collections
- [ ] Add form validation
- [ ] Integrate React Query for data fetching
- [ ] Add search and filtering UI
- [ ] Implement data export functionality
- [ ] Add tests
- [ ] Performance optimization
- [ ] Production deployment

See [REQUIREMENTS.md](./REQUIREMENTS.md) for complete project specifications.
