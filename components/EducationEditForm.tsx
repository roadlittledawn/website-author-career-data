'use client';

import { useRouter } from 'next/navigation';
import { gql } from 'graphql-request';
import graphqlClient from '@/lib/graphql-client';
import EducationForm from '@/components/EducationForm';
import type { Education } from '@/lib/types';
import styles from '@/app/education/[id]/edit/edit.module.css';

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

interface EducationEditFormProps {
  education: Education;
}

export function EducationEditForm({ education }: EducationEditFormProps) {
  const router = useRouter();
  const id = education.id;

  const handleSubmit = async (data: Partial<Education>) => {
    await graphqlClient.request(UPDATE_EDUCATION_MUTATION, { id, input: data });
    router.push(`/education/${id}`);
  };

  const handleCancel = () => {
    router.push(`/education/${id}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Edit Education</h1>
        <p>{education.institution}</p>
      </div>

      <EducationForm
        initialData={education}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
