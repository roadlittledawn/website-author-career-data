'use client';

import { useRouter } from 'next/navigation';
import EducationForm from '@/components/EducationForm';
import type { Education } from '@/lib/types';
import styles from './new.module.css';
import { createEducation } from '@/app/education/actions';

export default function NewEducationPage() {
  const router = useRouter();

  const handleSubmit = async (data: Partial<Education>) => {
    const result = await createEducation(data);
    router.push(`/education/${result.id}`);
  };

  const handleCancel = () => {
    router.push('/education');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>New Education</h1>
        <p>Add a new degree or certification to your profile</p>
      </div>

      <EducationForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
