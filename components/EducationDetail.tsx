'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { gql } from 'graphql-request';
import graphqlClient from '@/lib/graphql-client';
import type { Education } from '@/lib/types';
import styles from '@/app/education/[id]/education.module.css';

const DELETE_EDUCATION_MUTATION = gql`
  mutation DeleteEducation($id: ID!) {
    deleteEducation(id: $id) {
      success
      id
    }
  }
`;

interface EducationDetailProps {
  education: Education;
}

export function EducationDetail({ education }: EducationDetailProps) {
  const router = useRouter();
  const id = education.id;

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete this education record?`)) {
      return;
    }

    try {
      await graphqlClient.request(DELETE_EDUCATION_MUTATION, { id });
      router.push('/education');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete education');
    }
  };

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
