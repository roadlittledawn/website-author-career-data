# GraphQL Data Fetching Refactor

## Overview

Refactor all pages to follow React/Next.js best practices for data fetching:

1. **Colocate GraphQL queries** in the pages that use them (not centralized in `lib/api.ts`)
2. **Use Server Components** for initial data fetching where possible
3. **Extract client interactivity** into separate client components
4. **Use SWR** for any client-side data fetching that requires deduplication/caching
5. **Remove `lib/api.ts`** after migration (keep only `lib/graphql-client.ts` for the client config)

## Current Issues

- All queries hidden in `lib/api.ts` - no visibility into what fields are fetched
- Pages marked `'use client'` unnecessarily - prevents server-side rendering
- Manual `useState`/`useEffect` pattern for data fetching (no caching, no deduplication)
- Some queries only fetch `id name` and hardcode fake defaults for other fields (skills)
- Inconsistent patterns: `new` pages use old Netlify functions, others use GraphQL

## Target Pattern

### List Pages (e.g., `/skills`)

```tsx
// app/skills/page.tsx (Server Component)
import { gql } from 'graphql-request';
import graphqlClient from '@/lib/graphql-client';
import { SkillsList } from './skills-list';

const SKILLS_QUERY = gql`
  query GetSkills {
    skills {
      id
      name
      level
      rating
      roleRelevance
    }
  }
`;

export default async function SkillsPage() {
  const { skills } = await graphqlClient.request(SKILLS_QUERY);
  return <SkillsList initialSkills={skills} />;
}
```

```tsx
// app/skills/skills-list.tsx (Client Component - handles delete)
'use client';

export function SkillsList({ initialSkills }) {
  const [skills, setSkills] = useState(initialSkills);
  const handleDelete = async (id) => { /* mutation */ };
  // render UI
}
```

### Detail Pages (e.g., `/skills/[id]`)

```tsx
// app/skills/[id]/page.tsx (Server Component)
const SKILL_QUERY = gql`...`;

export default async function SkillPage({ params }) {
  const { skill } = await graphqlClient.request(SKILL_QUERY, { id: params.id });
  return <SkillDetail skill={skill} />;
}
```

### Edit Pages (e.g., `/skills/[id]/edit`)

```tsx
// app/skills/[id]/edit/page.tsx (Server Component for initial load)
const SKILL_QUERY = gql`...`;

export default async function EditSkillPage({ params }) {
  const { skill } = await graphqlClient.request(SKILL_QUERY, { id: params.id });
  return <SkillEditForm initialData={skill} skillId={params.id} />;
}
```

### New Pages (e.g., `/skills/new`)

These remain client components (no data to fetch initially):

```tsx
// app/skills/new/page.tsx
'use client';

import { gql } from 'graphql-request';
import graphqlClient from '@/lib/graphql-client';

const CREATE_SKILL_MUTATION = gql`...`;

export default function NewSkillPage() {
  const handleSubmit = async (data) => {
    await graphqlClient.request(CREATE_SKILL_MUTATION, { input: data });
  };
  // ...
}
```

## Pages to Refactor

### Skills (4 pages)
- [x] `app/skills/page.tsx` - List page → Server Component + client list
- [x] `app/skills/[id]/page.tsx` - Detail page → Server Component + client actions
- [x] `app/skills/[id]/edit/page.tsx` - Edit page → Server Component + client form
- [x] `app/skills/new/page.tsx` - New page → Fix to use GraphQL mutation

### Experiences (4 pages)
- [x] `app/experiences/page.tsx` - List page
- [x] `app/experiences/[id]/page.tsx` - Detail page
- [x] `app/experiences/[id]/edit/page.tsx` - Edit page
- [x] `app/experiences/new/page.tsx` - New page

### Projects (4 pages)
- [x] `app/projects/page.tsx` - List page
- [x] `app/projects/[id]/page.tsx` - Detail page
- [x] `app/projects/[id]/edit/page.tsx` - Edit page
- [x] `app/projects/new/page.tsx` - New page

### Education (4 pages)
- [x] `app/education/page.tsx` - List page
- [x] `app/education/[id]/page.tsx` - Detail page
- [x] `app/education/[id]/edit/page.tsx` - Edit page
- [x] `app/education/new/page.tsx` - New page

### Profile (2 pages)
- [x] `app/profile/page.tsx` - View page
- [x] `app/profile/edit/page.tsx` - Edit page

## Cleanup After Migration

- [x] Delete `lib/api.ts`
- [x] Keep `lib/graphql-client.ts` (just the client configuration)
- [x] Update any remaining imports

## Mutations Reference

Keep mutations colocated in the client components or pages that use them:

```tsx
const CREATE_SKILL_MUTATION = gql`
  mutation CreateSkill($input: SkillInput!) {
    createSkill(input: $input) {
      id name level rating roleRelevance yearsOfExperience tags keywords
    }
  }
`;

const UPDATE_SKILL_MUTATION = gql`
  mutation UpdateSkill($id: ID!, $input: SkillInput!) {
    updateSkill(id: $id, input: $input) {
      id name level rating roleRelevance yearsOfExperience tags keywords
    }
  }
`;

const DELETE_SKILL_MUTATION = gql`
  mutation DeleteSkill($id: ID!) {
    deleteSkill(id: $id) {
      success id
    }
  }
`;
```

## Benefits

1. **Visibility** - See exactly what data each page needs
2. **Performance** - Server Components stream HTML, no client-side fetch waterfalls
3. **Maintainability** - Change query when UI changes, in the same file
4. **Type Safety** - Can add codegen later to generate types from queries
5. **No Over-fetching** - Each page fetches only the fields it displays
