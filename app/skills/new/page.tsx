'use client';

import { useRouter } from 'next/navigation';
import SkillsForm from '@/components/SkillsForm';
import { authenticatedFetch } from '@/lib/auth';
import type { Skill } from '@/lib/types';
import styles from './new.module.css';

export default function NewSkillPage() {
  const router = useRouter();

  const handleSubmit = async (data: Partial<Skill>) => {
    const response = await authenticatedFetch('/.netlify/functions/skills', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create skill');
    }

    const result = await response.json();
    router.push(`/skills/${result.skill.id}`);
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
