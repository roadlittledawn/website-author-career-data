'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Education } from '@/lib/types';
import { educationApi } from '@/lib/api';
import styles from './education.module.css';

export default function EducationPage() {
  const router = useRouter();
  const [educations, setEducations] = useState<Education[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEducations();
  }, []);

  const fetchEducations = async () => {
    try {
      setIsLoading(true);
      const data = await educationApi.list();
      const sortedEducations = (data.educations || []).sort((a, b) =>
        a.institution.toLowerCase().localeCompare(b.institution.toLowerCase())
      );
      setEducations(sortedEducations);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load education');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, institution: string) => {
    if (!confirm(`Are you sure you want to delete "${institution}"?`)) {
      return;
    }

    try {
      await educationApi.delete(id);
      setEducations(educations.filter(edu => edu._id !== id));
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

  // Calculate stats
  const totalEducation = educations.length;
  const bachelorsDegrees = educations.filter(edu =>
    edu.degree.toLowerCase().includes('bachelor')
  ).length;
  const mastersDegrees = educations.filter(edu =>
    edu.degree.toLowerCase().includes('master')
  ).length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Education</h1>
          <p>Manage your educational background</p>
        </div>
        <Link href="/education/new" className={styles.createBtn}>
          + New Education
        </Link>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{totalEducation}</div>
          <div className={styles.statLabel}>Total Degrees</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{bachelorsDegrees}</div>
          <div className={styles.statLabel}>Bachelor's</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{mastersDegrees}</div>
          <div className={styles.statLabel}>Master's</div>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <div className={styles.educationGrid}>
        {educations.length === 0 ? (
          <div className={styles.empty}>
            <p>No education records yet</p>
            <Link href="/education/new">Add your first degree</Link>
          </div>
        ) : (
          educations.map((education) => {
            const educationId = education._id?.toString() || '';

            return (
              <div key={educationId} className={styles.educationCard}>
                <div className={styles.cardContent}>
                  <h3 className={styles.institution}>{education.institution}</h3>
                  <div className={styles.degree}>{education.degree}</div>
                  <div className={styles.field}>{education.field}</div>
                  <div className={styles.year}>{education.graduationYear}</div>
                </div>

                <div className={styles.cardActions}>
                  <Link href={`/education/${educationId}`} className={styles.iconBtn} title="View">
                    👁️
                  </Link>
                  <Link href={`/education/${educationId}/edit`} className={styles.iconBtn} title="Edit">
                    ✏️
                  </Link>
                  <button
                    onClick={() => handleDelete(educationId, education.institution)}
                    className={styles.iconBtn}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
