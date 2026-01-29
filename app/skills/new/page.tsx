'use client';

import { useRouter } from 'next/navigation';
import { gql } from 'graphql-request';
import graphqlClient from '@/lib/graphql-client';
import SkillsForm from '@/components/SkillsForm';
import type { Skill } from '@/lib/types';
import styles from './new.module.css';

const CREATE_SKILL_MUTATION = gql`
  mutation CreateSkill($input: SkillInput!) {
    createSkill(input: $input) {
      id
      name
      level
      rating
      yearsOfExperience
      roleRelevance
      tags
      keywords
    }
  }
`;

export default function NewSkillPage() {
  const router = useRouter();

  const handleSubmit = async (data: Partial<Skill>) => {
    const result = await graphqlClient.request<{ createSkill: Skill }>(
      CREATE_SKILL_MUTATION,
      { input: data }
    );
    router.refresh();
    router.push(`/skills/${result.createSkill.id}`);
  };

  const handleCancel = () => {
    router.push('/skills');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>New Skill</h1>
        <p>Add a new skill to your profile</p>
      </div>

      <SkillsForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
