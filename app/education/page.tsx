import { gql } from 'graphql-request';
import graphqlClient from '@/lib/graphql-client';
import type { Education } from '@/lib/types';
import { EducationList } from '@/components/EducationList';

const EDUCATIONS_QUERY = gql`
  query GetEducations {
    educations {
      id
      institution
      degree
      field
      graduationYear
    }
  }
`;

export default async function EducationPage() {
  const { educations } = await graphqlClient.request<{ educations: Education[] }>(EDUCATIONS_QUERY);

  const sortedEducations = [...(educations || [])].sort((a, b) =>
    a.institution.toLowerCase().localeCompare(b.institution.toLowerCase())
  );

  return <EducationList initialEducations={sortedEducations} />;
}
