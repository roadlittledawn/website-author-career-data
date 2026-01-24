import { gql } from 'graphql-request';
import { notFound } from 'next/navigation';
import graphqlClient from '@/lib/graphql-client';
import type { Experience } from '@/lib/types';
import { ExperienceEditForm } from '@/components/ExperienceEditForm';

const EXPERIENCE_QUERY = gql`
  query GetExperience($id: ID!) {
    experience(id: $id) {
      id
      company
      location
      title
      industry
      startDate
      endDate
      roleTypes
      responsibilities
      achievements {
        description
        metrics
        impact
      }
      technologies
      featured
      organizations
      crossFunctional
    }
  }
`;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditExperiencePage({ params }: PageProps) {
  const { id } = await params;

  try {
    const { experience } = await graphqlClient.request<{ experience: Experience | null }>(EXPERIENCE_QUERY, { id });

    if (!experience) {
      notFound();
    }

    return <ExperienceEditForm experience={experience} />;
  } catch {
    notFound();
  }
}
