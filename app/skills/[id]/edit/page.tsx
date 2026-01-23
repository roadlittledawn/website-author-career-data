import { gql } from 'graphql-request';
import { notFound } from 'next/navigation';
import graphqlClient from '@/lib/graphql-client';
import type { Skill } from '@/lib/types';
import { SkillEditForm } from '@/components/SkillEditForm';

const SKILL_QUERY = gql`
  query GetSkill($id: ID!) {
    skill(id: $id) {
      id
      name
      level
      rating
      yearsOfExperience
      roleRelevance
      iconName
      tags
      keywords
    }
  }
`;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSkillPage({ params }: PageProps) {
  const { id } = await params;

  try {
    const { skill } = await graphqlClient.request<{ skill: Skill | null }>(SKILL_QUERY, { id });

    if (!skill) {
      notFound();
    }

    return <SkillEditForm skill={skill} />;
  } catch {
    notFound();
  }
}
