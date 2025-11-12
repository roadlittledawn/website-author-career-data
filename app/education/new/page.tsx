'use client';

import { useRouter } from 'next/navigation';
import EducationForm from '@/components/EducationForm';
import { authenticatedFetch } from '@/lib/auth';
import type { Education } from '@/lib/types';
import styles from './new.module.css';

export default function NewEducationPage() {
  const router = useRouter();

  const handleSubmit = async (data: Partial<Education>) => {
    const response = await authenticatedFetch('/.netlify/functions/educations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create education');
    }

    const result = await response.json();
    router.push(`/education/${result.education._id}`);
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
