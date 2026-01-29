'use client';

import { useRouter } from 'next/navigation';
import ExperienceForm from '@/components/ExperienceForm';
import type { Experience } from '@/lib/types';
import styles from './new.module.css';
import { createExperience } from '@/app/experiences/actions';

export default function NewExperiencePage() {
  const router = useRouter();

  const handleSubmit = async (data: Partial<Experience>) => {
    const result = await createExperience(data);
    router.push(`/experiences/${result.id}`);
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
