'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Experience } from '@/lib/types';
import { experiencesApi } from '@/lib/api';
import styles from './experiences.module.css';

export default function ExperiencesPage() {
  const router = useRouter();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      setIsLoading(true);
      const data = await experiencesApi.list();
      setExperiences(data.experiences || []);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load experiences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) {
      return;
    }

    try {
      await experiencesApi.delete(id);
      setExperiences(experiences.filter(exp => exp._id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete experience');
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading experiences...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Work Experiences</h1>
          <p>Manage your professional work history</p>
        </div>
        <Link href="/experiences/new" className={styles.createBtn}>
          + New Experience
        </Link>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <div className={styles.experienceGrid}>
        {experiences.length === 0 ? (
          <div className={styles.empty}>
            <p>No experiences yet</p>
            <Link href="/experiences/new">Create your first experience</Link>
          </div>
        ) : (
          experiences.map((experience) => {
            const experienceId = experience._id?.toString() || '';
            console.log('Experience ID:', experienceId); // Debug log

            return (
              <div key={experienceId} className={styles.experienceCard}>
                {experience.featured && (
                  <span className={styles.featuredBadge}>Featured</span>
                )}

                <div className={styles.cardHeader}>
                  <h3>{experience.title}</h3>
                </div>

                <p className={styles.company}>{experience.company}</p>
                <p className={styles.location}>
                  {experience.location}
                </p>
                <p className={styles.dates}>
                  {new Date(experience.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {experience.endDate ? new Date(experience.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
                </p>

                <div className={styles.roleTypes}>
                  {experience.roleTypes.map((role) => (
                    <span key={role} className={styles.roleTag}>
                      {role.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>

                {experience.technologies && experience.technologies.length > 0 && (
                  <div className={styles.technologies}>
                    {experience.technologies.slice(0, 5).map((tech, idx) => (
                      <span key={idx} className={styles.techTag}>
                        {tech}
                      </span>
                    ))}
                    {experience.technologies.length > 5 && (
                      <span className={styles.techTag}>
                        +{experience.technologies.length - 5} more
                      </span>
                    )}
                  </div>
                )}

                <div className={styles.cardActions}>
                  <Link href={`/experiences/${experienceId}`} className={styles.viewBtn}>
                    View
                  </Link>
                  <Link href={`/experiences/${experienceId}/edit`} className={styles.editBtn}>
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(experienceId)}
                    className={styles.deleteBtn}
                  >
                    Delete
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
