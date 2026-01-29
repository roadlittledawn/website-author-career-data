'use client';

import { useRouter } from 'next/navigation';
import SkillsForm from '@/components/SkillsForm';
import type { Skill } from '@/lib/types';
import styles from './new.module.css';
import { createSkill } from '@/app/skills/actions';

export default function NewSkillPage() {
  const router = useRouter();

  const handleSubmit = async (data: Partial<Skill>) => {
    const result = await createSkill(data);
    router.push(`/skills/${result.id}`);
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
