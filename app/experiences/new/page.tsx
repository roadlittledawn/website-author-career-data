'use client';

import { useRouter } from 'next/navigation';
import { gql } from 'graphql-request';
import graphqlClient from '@/lib/graphql-client';
import ExperienceForm from '@/components/ExperienceForm';
import type { Experience } from '@/lib/types';
import styles from './new.module.css';

const CREATE_EXPERIENCE_MUTATION = gql`
  mutation CreateExperience($input: ExperienceInput!) {
    createExperience(input: $input) {
      id
      company
      title
    }
  }
`;

export default function NewExperiencePage() {
  const router = useRouter();

  const handleSubmit = async (data: Partial<Experience>) => {
    const result = await graphqlClient.request<{ createExperience: Experience }>(
      CREATE_EXPERIENCE_MUTATION,
      { input: data }
    );
    router.push(`/experiences/${result.createExperience.id}`);
  };

  const handleCancel = () => {
    router.push('/experiences');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>New Work Experience</h1>
        <p>Add a new position to your professional history</p>
      </div>

      <ExperienceForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
