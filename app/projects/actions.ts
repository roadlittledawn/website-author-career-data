'use server';

import { revalidatePath } from 'next/cache';
import { gql } from 'graphql-request';
import graphqlClient from '@/lib/graphql-client';
import type { Project } from '@/lib/types';

const CREATE_PROJECT_MUTATION = gql`
  mutation CreateProject($input: ProjectInput!) {
    createProject(input: $input) {
      id
      name
    }
  }
`;

const UPDATE_PROJECT_MUTATION = gql`
  mutation UpdateProject($id: ID!, $input: ProjectInput!) {
    updateProject(id: $id, input: $input) {
      id
      name
      type
      date
      featured
      overview
      challenge
      approach
      outcome
      impact
      technologies
      keywords
      roleTypes
      links {
        url
        linkText
        type
      }
    }
  }
`;

export async function updateProject(id: string, input: Partial<Project>) {
  const result = await graphqlClient.request<{ updateProject: Project }>(
    UPDATE_PROJECT_MUTATION,
    { id, input }
  );

  revalidatePath(`/projects/${id}`);
  revalidatePath(`/projects/${id}/edit`);
  revalidatePath('/projects');

  return result.updateProject;
}

export async function createProject(input: Partial<Project>) {
  const result = await graphqlClient.request<{ createProject: Project }>(
    CREATE_PROJECT_MUTATION,
    { input }
  );

  revalidatePath('/projects');

  return result.createProject;
}
