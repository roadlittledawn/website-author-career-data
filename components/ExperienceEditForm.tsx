'use client';

import { useRouter } from 'next/navigation';
import ExperienceForm from '@/components/ExperienceForm';
import type { Experience } from '@/lib/types';
import styles from '@/app/experiences/[id]/edit/edit.module.css';
import { updateExperience } from '@/app/experiences/actions';

interface ExperienceEditFormProps {
  experience: Experience;
}

export function ExperienceEditForm({ experience }: ExperienceEditFormProps) {
  const router = useRouter();
  const id = experience.id;

  const handleSubmit = async (data: Partial<Experience>) => {
    await updateExperience(id, data);
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
