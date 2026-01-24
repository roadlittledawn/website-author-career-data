'use client';

import { useRouter } from 'next/navigation';
import { gql } from 'graphql-request';
import graphqlClient from '@/lib/graphql-client';
import ExperienceForm from '@/components/ExperienceForm';
import type { Experience } from '@/lib/types';
import styles from '@/app/experiences/[id]/edit/edit.module.css';

const UPDATE_EXPERIENCE_MUTATION = gql`
  mutation UpdateExperience($id: ID!, $input: ExperienceInput!) {
    updateExperience(id: $id, input: $input) {
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
    }
  }
`;

interface ExperienceEditFormProps {
  experience: Experience;
}

export function ExperienceEditForm({ experience }: ExperienceEditFormProps) {
  const router = useRouter();
  const id = experience.id;

  const handleSubmit = async (data: Partial<Experience>) => {
    await graphqlClient.request(UPDATE_EXPERIENCE_MUTATION, { id, input: data });
    router.push(`/experiences/${id}`);
  };

  const handleCancel = () => {
    router.push(`/experiences/${id}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Edit Experience</h1>
        <p>{experience.title} at {experience.company}</p>
      </div>

      <ExperienceForm
        initialData={experience}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
