import { gql } from 'graphql-request';
import graphqlClient from '@/lib/graphql-client';
import type { Skill } from '@/lib/types';
import { SkillsList } from '@/components/SkillsList';

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
  const { skills } = await graphqlClient.request<{ skills: Skill[] }>(SKILLS_QUERY);

  const sortedSkills = [...skills].sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  );

  return <SkillsList initialSkills={sortedSkills} />;
}
