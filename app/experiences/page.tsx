import { gql } from 'graphql-request';
import graphqlClient from '@/lib/graphql-client';
import type { Experience } from '@/lib/types';
import { ExperiencesList } from '@/components/ExperiencesList';

const EXPERIENCES_QUERY = gql`
  query GetExperiences {
    experiences {
      id
      company
      location
      title
      startDate
      endDate
      roleTypes
      technologies
      featured
    }
  }
`;

export default async function ExperiencesPage() {
  const { experiences } = await graphqlClient.request<{ experiences: Experience[] }>(EXPERIENCES_QUERY);

  return <ExperiencesList initialExperiences={experiences || []} />;
}
