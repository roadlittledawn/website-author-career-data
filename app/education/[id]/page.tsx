import { gql } from 'graphql-request';
import { notFound } from 'next/navigation';
import graphqlClient from '@/lib/graphql-client';
import type { Education } from '@/lib/types';
import { EducationDetail } from '@/components/EducationDetail';

const EDUCATION_QUERY = gql`
  query GetEducation($id: ID!) {
    education(id: $id) {
      id
      institution
      degree
      field
      graduationYear
      relevantCoursework
      displayOrder
      createdAt
      updatedAt
    }
  }
`;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EducationDetailPage({ params }: PageProps) {
  const { id } = await params;

  try {
    const { education } = await graphqlClient.request<{ education: Education | null }>(EDUCATION_QUERY, { id });

    if (!education) {
      notFound();
    }

    return <EducationDetail education={education} />;
  } catch {
    notFound();
  }
}
