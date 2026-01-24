import { gql } from 'graphql-request';
import { notFound } from 'next/navigation';
import graphqlClient from '@/lib/graphql-client';
import type { Education } from '@/lib/types';
import { EducationEditForm } from '@/components/EducationEditForm';

const EDUCATION_QUERY = gql`
  query GetEducation($id: ID!) {
    education(id: $id) {
      id
      institution
      degree
      field
      graduationYear
      relevantCoursework
    }
  }
`;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEducationPage({ params }: PageProps) {
  const { id } = await params;

  try {
    const { education } = await graphqlClient.request<{ education: Education | null }>(EDUCATION_QUERY, { id });

    if (!education) {
      notFound();
    }

    return <EducationEditForm education={education} />;
  } catch {
    notFound();
  }
}
