'use client';

import { useState } from 'react';
import Link from 'next/link';
import { gql } from 'graphql-request';
import graphqlClient from '@/lib/graphql-client';
import type { Experience } from '@/lib/types';
import styles from '@/app/experiences/experiences.module.css';

const DELETE_EXPERIENCE_MUTATION = gql`
  mutation DeleteExperience($id: ID!) {
    deleteExperience(id: $id) {
      success
      id
    }
  }
`;

interface ExperiencesListProps {
  initialExperiences: Experience[];
}

export function ExperiencesList({ initialExperiences }: ExperiencesListProps) {
  const [experiences, setExperiences] = useState(initialExperiences);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) {
      return;
    }

    try {
      await graphqlClient.request(DELETE_EXPERIENCE_MUTATION, { id });
      setExperiences(experiences.filter(exp => exp.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete experience');
    }
  };

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

      <div className={styles.experienceGrid}>
        {experiences.length === 0 ? (
          <div className={styles.empty}>
            <p>No experiences yet</p>
            <Link href="/experiences/new">Create your first experience</Link>
          </div>
        ) : (
          experiences.map((experience) => {
            const experienceId = experience.id?.toString() || '';

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
