'use client';

import { useRouter } from 'next/navigation';
import { gql } from 'graphql-request';
import graphqlClient from '@/lib/graphql-client';
import SkillsForm from '@/components/SkillsForm';
import type { Skill } from '@/lib/types';
import styles from '@/app/skills/[id]/edit/edit.module.css';

const UPDATE_SKILL_MUTATION = gql`
  mutation UpdateSkill($id: ID!, $input: SkillInput!) {
    updateSkill(id: $id, input: $input) {
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

interface SkillEditFormProps {
  skill: Skill;
}

export function SkillEditForm({ skill }: SkillEditFormProps) {
  const router = useRouter();
  const id = skill.id;

  const handleSubmit = async (data: Partial<Skill>) => {
    await graphqlClient.request(UPDATE_SKILL_MUTATION, { id, input: data });
    router.push(`/skills/${id}`);
  };

  const handleCancel = () => {
    router.push(`/skills/${id}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Edit Skill</h1>
        <p>{skill.name}</p>
      </div>

      <SkillsForm
        initialData={skill}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
