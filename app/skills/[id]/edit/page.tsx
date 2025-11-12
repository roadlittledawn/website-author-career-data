'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import SkillsForm from '@/components/SkillsForm';
import { skillsApi } from '@/lib/api';
import type { SkillCategory } from '@/lib/types';
import styles from './edit.module.css';

export default function EditSkillPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [skill, setSkill] = useState<SkillCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSkill();
  }, [id]);

  const fetchSkill = async () => {
    try {
      setIsLoading(true);
      const data = await skillsApi.get(id);
      setSkill(data.skill);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load skill category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: Partial<SkillCategory>) => {
    await skillsApi.update(id, data);
    router.push(`/skills/${id}`);
  };

  const handleCancel = () => {
    router.push(`/skills/${id}`);
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading skill category...</div>
      </div>
    );
  }

  if (error || !skill) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error || 'Skill category not found'}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Edit Skill Category</h1>
        <p>{skill.category}</p>
      </div>

      <SkillsForm
        initialData={skill}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
