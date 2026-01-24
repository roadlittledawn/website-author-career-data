import { gql } from 'graphql-request';
import { notFound } from 'next/navigation';
import graphqlClient from '@/lib/graphql-client';
import type { Project } from '@/lib/types';
import { ProjectEditForm } from '@/components/ProjectEditForm';

const PROJECT_QUERY = gql`
  query GetProject($id: ID!) {
    project(id: $id) {
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
        type
        url
        linkText
      }
    }
  }
`;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params;

  try {
    const { project } = await graphqlClient.request<{ project: Project | null }>(PROJECT_QUERY, { id });

    if (!project) {
      notFound();
    }

    return <ProjectEditForm project={project} />;
  } catch {
    notFound();
  }
}
