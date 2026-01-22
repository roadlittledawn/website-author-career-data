'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import type { Education } from '@/lib/types';
import { educationApi } from '@/lib/api';
import styles from './education.module.css';

export default function EducationDetailPage() {
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

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete this education record?`)) {
      return;
    }

    try {
      await educationApi.delete(id);
      router.push('/education');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete education');
    }
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
        <div>
          <Link href="/education" className={styles.backLink}>
            ← Back to Education
          </Link>
          <h1>{education.institution}</h1>
        </div>
        <div className={styles.actions}>
          <Link href={`/education/${id}/edit`} className={styles.editBtn}>
            Edit
          </Link>
          <button onClick={handleDelete} className={styles.deleteBtn}>
            Delete
          </button>
        </div>
      </div>

      {/* Degree Information */}
      <section className={styles.section}>
        <h2>Degree Information</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <label>Degree</label>
            <p>{education.degree}</p>
          </div>
          <div className={styles.infoItem}>
            <label>Field of Study</label>
            <p>{education.field}</p>
          </div>
          <div className={styles.infoItem}>
            <label>Graduation Year</label>
            <p>{education.graduationYear}</p>
          </div>
        </div>
      </section>

      {/* Relevant Coursework */}
      {education.relevantCoursework && education.relevantCoursework.length > 0 && (
        <section className={styles.section}>
          <h2>Relevant Coursework</h2>
          <div className={styles.courseworkList}>
            {education.relevantCoursework.map((course, idx) => (
              <span key={idx} className={styles.course}>
                {course}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Timestamps */}
      <div className={styles.timestamps}>
        <p>
          <strong>Created:</strong>{' '}
          {education.createdAt
            ? new Date(education.createdAt).toLocaleDateString()
            : 'N/A'}
        </p>
        <p>
          <strong>Last Updated:</strong>{' '}
          {education.updatedAt
            ? new Date(education.updatedAt).toLocaleDateString()
            : 'N/A'}
        </p>
      </div>
    </div>
  );
}
