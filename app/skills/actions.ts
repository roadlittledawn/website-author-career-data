'use server';

import { revalidatePath } from 'next/cache';
import { gql } from 'graphql-request';
import graphqlClient from '@/lib/graphql-client';
import type { Skill } from '@/lib/types';

const CREATE_SKILL_MUTATION = gql`
  mutation CreateSkill($input: SkillInput!) {
    createSkill(input: $input) {
      id
      name
      level
      rating
      yearsOfExperience
      roleRelevance
      tags
      keywords
    }
  }
`;

const UPDATE_SKILL_MUTATION = gql`
  mutation UpdateSkill($id: ID!, $input: SkillInput!) {
    updateSkill(id: $id, input: $input) {
      id
      name
      level
      rating
      yearsOfExperience
      roleRelevance
      iconName
      tags
      keywords
      featured
    }
  }
`;

export async function updateSkill(id: string, input: Partial<Skill>) {
  const result = await graphqlClient.request<{ updateSkill: Skill }>(
    UPDATE_SKILL_MUTATION,
    { id, input }
  );

  revalidatePath(`/skills/${id}`);
  revalidatePath(`/skills/${id}/edit`);
  revalidatePath('/skills');

  return result.updateSkill;
}

export async function createSkill(input: Partial<Skill>) {
  const result = await graphqlClient.request<{ createSkill: Skill }>(
    CREATE_SKILL_MUTATION,
    { input }
  );

  revalidatePath('/skills');

  return result.createSkill;
}
