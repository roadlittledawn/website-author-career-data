'use server';

import { revalidatePath } from 'next/cache';
import { gql } from 'graphql-request';
import graphqlClient from '@/lib/graphql-client';
import type { Experience } from '@/lib/types';

const CREATE_EXPERIENCE_MUTATION = gql`
  mutation CreateExperience($input: ExperienceInput!) {
    createExperience(input: $input) {
      id
      company
      title
    }
  }
`;

const UPDATE_EXPERIENCE_MUTATION = gql`
  mutation UpdateExperience($id: ID!, $input: ExperienceInput!) {
    updateExperience(id: $id, input: $input) {
      id
      company
      location
      title
      industry
      summary
      startDate
      endDate
      roleTypes
      responsibilities
      achievements {
        description
        metrics
        impact
        keywords
      }
      technologies
      organizations
      crossFunctional
      displayOrder
      featured
    }
  }
`;

export async function updateExperience(id: string, input: Partial<Experience>) {
  const result = await graphqlClient.request<{ updateExperience: Experience }>(
    UPDATE_EXPERIENCE_MUTATION,
    { id, input }
  );

  revalidatePath(`/experiences/${id}`);
  revalidatePath(`/experiences/${id}/edit`);
  revalidatePath('/experiences');

  return result.updateExperience;
}

export async function createExperience(input: Partial<Experience>) {
  const result = await graphqlClient.request<{ createExperience: Experience }>(
    CREATE_EXPERIENCE_MUTATION,
    { input }
  );

  revalidatePath('/experiences');

  return result.createExperience;
}
