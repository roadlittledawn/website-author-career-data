'use client';

import { useRouter } from 'next/navigation';
import EducationForm from '@/components/EducationForm';
import type { Education } from '@/lib/types';
import styles from '@/app/education/[id]/edit/edit.module.css';
import { updateEducation } from '@/app/education/actions';

interface EducationEditFormProps {
  education: Education;
}

export function EducationEditForm({ education }: EducationEditFormProps) {
  const router = useRouter();
  const id = education.id;

  const handleSubmit = async (data: Partial<Education>) => {
    await updateEducation(id, data);
    router.push(`/education/${id}`);
  };

  const handleCancel = () => {
    router.push(`/education/${id}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Edit Education</h1>
        <p>{education.institution}</p>
      </div>

      <EducationForm
        initialData={education}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
