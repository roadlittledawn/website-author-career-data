'use client';

import { useRouter } from 'next/navigation';
import SkillsForm from '@/components/SkillsForm';
import { authenticatedFetch } from '@/lib/auth';
import type { SkillCategory } from '@/lib/types';
import styles from './new.module.css';

export default function NewSkillPage() {
  const router = useRouter();

  const handleSubmit = async (data: Partial<SkillCategory>) => {
    const response = await authenticatedFetch('/.netlify/functions/skills', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create skill category');
    }

    const result = await response.json();
    router.push(`/skills/${result.skill._id}`);
  };

  const handleCancel = () => {
    router.push('/skills');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>New Skill Category</h1>
        <p>Add a new category of skills to your profile</p>
      </div>

      <SkillsForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
