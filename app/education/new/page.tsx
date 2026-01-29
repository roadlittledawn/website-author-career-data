'use client';

import { useRouter } from 'next/navigation';
import { gql } from 'graphql-request';
import graphqlClient from '@/lib/graphql-client';
import EducationForm from '@/components/EducationForm';
import type { Education } from '@/lib/types';
import styles from './new.module.css';

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

export default function NewEducationPage() {
  const router = useRouter();

  const handleSubmit = async (data: Partial<Education>) => {
    const result = await graphqlClient.request<{ createEducation: Education }>(
      CREATE_EDUCATION_MUTATION,
      { input: data }
    );
    router.refresh();
    router.push(`/education/${result.createEducation.id}`);
  };

  const handleCancel = () => {
    router.push('/education');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>New Education</h1>
        <p>Add a new degree or certification to your profile</p>
      </div>

      <EducationForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
