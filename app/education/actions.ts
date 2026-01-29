'use server';

import { revalidatePath } from 'next/cache';
import { gql } from 'graphql-request';
import graphqlClient from '@/lib/graphql-client';
import type { Education } from '@/lib/types';

const CREATE_EDUCATION_MUTATION = gql`
  mutation CreateEducation($input: EducationInput!) {
    createEducation(input: $input) {
      id
      institution
      degree
      field
      graduationYear
    }
  }
`;

const UPDATE_EDUCATION_MUTATION = gql`
  mutation UpdateEducation($id: ID!, $input: EducationInput!) {
    updateEducation(id: $id, input: $input) {
      id
      institution
      degree
      field
      graduationYear
      relevantCoursework
    }
  }
`;

export async function updateEducation(id: string, input: Partial<Education>) {
  const result = await graphqlClient.request<{ updateEducation: Education }>(
    UPDATE_EDUCATION_MUTATION,
    { id, input }
  );

  revalidatePath(`/education/${id}`);
  revalidatePath(`/education/${id}/edit`);
  revalidatePath('/education');

  return result.updateEducation;
}

export async function createEducation(input: Partial<Education>) {
  const result = await graphqlClient.request<{ createEducation: Education }>(
    CREATE_EDUCATION_MUTATION,
    { input }
  );

  revalidatePath('/education');

  return result.createEducation;
}
