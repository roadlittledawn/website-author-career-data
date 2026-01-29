'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { gql } from 'graphql-request';
import graphqlClient from '@/lib/graphql-client';
import type { Experience } from '@/lib/types';
import styles from '@/app/experiences/[id]/detail.module.css';

const DELETE_EXPERIENCE_MUTATION = gql`
  mutation DeleteExperience($id: ID!) {
    deleteExperience(id: $id) {
      success
      id
    }
  }
`;

interface ExperienceDetailProps {
  experience: Experience;
}

export function ExperienceDetail({ experience }: ExperienceDetailProps) {
  const router = useRouter();
  const id = experience.id;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this experience?')) {
      return;
    }

    try {
      await graphqlClient.request(DELETE_EXPERIENCE_MUTATION, { id });
      router.push('/experiences');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete experience');
    }
  };

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

        {/* Summary */}
        {experience.summary && (
          <div className={styles.section}>
            <h2>Summary</h2>
            <p>{experience.summary}</p>
          </div>
        )}

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
