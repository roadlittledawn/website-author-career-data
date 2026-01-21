'use client';

import { useRouter } from 'next/navigation';
import ExperienceForm from '@/components/ExperienceForm';
import { authenticatedFetch } from '@/lib/auth';
import type { Experience } from '@/lib/types';
import styles from './new.module.css';

export default function NewExperiencePage() {
  const router = useRouter();

  const handleSubmit = async (data: Partial<Experience>) => {
    const response = await authenticatedFetch('/.netlify/functions/experiences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create experience');
    }

    const result = await response.json();
    router.push(`/experiences/${result.experience.id}`);
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
