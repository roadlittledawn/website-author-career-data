'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import EducationForm from '@/components/EducationForm';
import { educationApi } from '@/lib/api';
import type { Education } from '@/lib/types';
import styles from './edit.module.css';

export default function EditEducationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [education, setEducation] = useState<Education | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEducation();
  }, [id]);

  const fetchEducation = async () => {
    try {
      setIsLoading(true);
      const data = await educationApi.get(id);
      setEducation(data.education);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load education');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: Partial<Education>) => {
    await educationApi.update(id, data);
    router.push(`/education/${id}`);
  };

  const handleCancel = () => {
    router.push(`/education/${id}`);
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading education...</div>
      </div>
    );
  }

  if (error || !education) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error || 'Education not found'}</div>
      </div>
    );
  }

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
