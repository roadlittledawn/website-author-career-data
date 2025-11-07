'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ExperienceForm from '@/components/ExperienceForm';
import { experiencesApi } from '@/lib/api';
import type { Experience } from '@/lib/types';
import styles from './edit.module.css';

export default function EditExperiencePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [experience, setExperience] = useState<Experience | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExperience();
  }, [id]);

  const fetchExperience = async () => {
    try {
      setIsLoading(true);
      const data = await experiencesApi.get(id);
      setExperience(data.experience);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load experience');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: Partial<Experience>) => {
    await experiencesApi.update(id, data);
    router.push(`/experiences/${id}`);
  };

  const handleCancel = () => {
    router.push(`/experiences/${id}`);
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading experience...</div>
      </div>
    );
  }

  if (error || !experience) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error || 'Experience not found'}</div>
      </div>
    );
  }

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
