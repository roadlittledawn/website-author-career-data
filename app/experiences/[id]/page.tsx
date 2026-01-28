import { gql } from 'graphql-request';
import { notFound } from 'next/navigation';
import graphqlClient from '@/lib/graphql-client';
import type { Experience } from '@/lib/types';
import { ExperienceDetail } from '@/components/ExperienceDetail';

const EXPERIENCE_QUERY = gql`
  query GetExperience($id: ID!) {
    experience(id: $id) {
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

export default async function ExperienceDetailPage({ params }: PageProps) {
  const { id } = await params;

  try {
    const { experience } = await graphqlClient.request<{ experience: Experience | null }>(EXPERIENCE_QUERY, { id });

    if (!experience) {
      notFound();
    }

    return <ExperienceDetail experience={experience} />;
  } catch (error) {
    console.error('Error fetching experience:', error);
    notFound();
  }
}
