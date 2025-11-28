'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import type { Experience } from '@/lib/types';
import { experiencesApi } from '@/lib/api';
import styles from './detail.module.css';

export default function ExperienceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [experience, setExperience] = useState<Experience | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExperience();
  }, [id]);

  const fetchExperience = async () => {
    try {
      setIsLoading(true);
      const data = await experiencesApi.get(id);
      setExperience(data.experience);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load experience');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this experience?')) {
      return;
    }

    try {
      await experiencesApi.delete(id);
      router.push('/experiences');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete experience');
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading experience...</div>
      </div>
    );
  }

  if (error || !experience) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error || 'Experience not found'}</div>
        <Link href="/experiences" className={styles.backBtn}>
          ← Back to Experiences
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/experiences" className={styles.backBtn}>
          ← Back to Experiences
        </Link>
        <div className={styles.actions}>
          <Link href={`/experiences/${id}/edit`} className={styles.editBtn}>
            Edit
          </Link>
          <button onClick={handleDelete} className={styles.deleteBtn}>
            Delete
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.titleSection}>
          <div>
            <h1>{experience.title}</h1>
            <p className={styles.company}>{experience.company}</p>
            <p className={styles.meta}>
              {experience.location} • {new Date(experience.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - {experience.endDate ? new Date(experience.endDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Present'}
            </p>
            {experience.industry && (
              <p className={styles.industry}>{experience.industry}</p>
            )}
          </div>
          {experience.featured && (
            <span className={styles.badge}>Featured</span>
          )}
        </div>

        {/* Role Types */}
        <div className={styles.section}>
          <h2>Role Types</h2>
          <div className={styles.tags}>
            {experience.roleTypes.map((role) => (
              <span key={role} className={styles.roleTag}>
                {role.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>

        {/* Organizations */}
        {experience.organizations && experience.organizations.length > 0 && (
          <div className={styles.section}>
            <h2>Organizations/Teams</h2>
            <div className={styles.tags}>
              {experience.organizations.map((org, idx) => (
                <span key={idx} className={styles.tag}>
                  {org}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Key Responsibilities */}
        <div className={styles.section}>
          <h2>Key Responsibilities</h2>
          <ul className={styles.list}>
            {experience.responsibilities.map((resp, idx) => (
              <li key={idx}>{resp}</li>
            ))}
          </ul>
        </div>

        {/* Technologies */}
        <div className={styles.section}>
          <h2>Technologies</h2>
          <div className={styles.tags}>
            {experience.technologies.map((tech, idx) => (
              <span key={idx} className={styles.techTag}>
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Achievements */}
        {experience.achievements && experience.achievements.length > 0 && (
          <div className={styles.section}>
            <h2>Key Achievements</h2>
            <ul className={styles.achievementsList}>
              {experience.achievements.map((achievement, idx) => (
                <li key={idx} className={styles.achievementItem}>
                  <div className={styles.achievementContent}>
                    <p className={styles.achievementDesc}>{achievement.description}</p>
                    {achievement.impact && (
                      <p className={styles.achievementImpact}>
                        <strong>Impact:</strong> {achievement.impact}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Cross-Functional Collaboration */}
        {experience.crossFunctional && experience.crossFunctional.length > 0 && (
          <div className={styles.section}>
            <h2>Cross-Functional Collaboration</h2>
            <div className={styles.tags}>
              {experience.crossFunctional.map((cf, idx) => (
                <span key={idx} className={styles.tag}>
                  {cf}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
