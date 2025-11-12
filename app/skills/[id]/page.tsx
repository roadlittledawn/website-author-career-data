'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { skillsApi } from '@/lib/api';
import type { Skill } from '@/lib/types';
import styles from './skill.module.css';

export default function SkillPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [skill, setSkill] = useState<Skill | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSkill();
  }, [id]);

  const fetchSkill = async () => {
    try {
      setIsLoading(true);
      const data = await skillsApi.get(id);
      setSkill(data.skill);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load skill');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this skill?')) {
      return;
    }

    try {
      await skillsApi.delete(id);
      router.push('/skills');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete skill');
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading skill...</div>
      </div>
    );
  }

  if (error || !skill) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error || 'Skill not found'}</div>
        <Link href="/skills" className={styles.backLink}>Back to Skills</Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <Link href="/skills" className={styles.backLink}>← Back to Skills</Link>
          <h1>{skill.name}</h1>
          <div className={styles.rating}>
            {'★'.repeat(skill.rating)}{'☆'.repeat(5 - skill.rating)}
          </div>
        </div>
        <div className={styles.actions}>
          <Link href={`/skills/${id}/edit`} className={styles.editBtn}>
            Edit
          </Link>
          <button onClick={handleDelete} className={styles.deleteBtn}>
            Delete
          </button>
        </div>
      </div>

      {/* Proficiency Information */}
      <section className={styles.section}>
        <h2>Proficiency</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <label>Level</label>
            <p className={styles.level}>{skill.level}</p>
          </div>
          <div className={styles.infoItem}>
            <label>Experience</label>
            <p>{skill.yearsOfExperience} {skill.yearsOfExperience === 1 ? 'year' : 'years'}</p>
          </div>
          <div className={styles.infoItem}>
            <label>Rating</label>
            <p className={styles.rating}>
              {'★'.repeat(skill.rating)}{'☆'.repeat(5 - skill.rating)}
            </p>
          </div>
          {skill.iconName && (
            <div className={styles.infoItem}>
              <label>Icon</label>
              <p>{skill.iconName}</p>
            </div>
          )}
        </div>
      </section>

      {/* Role Relevance */}
      {skill.roleRelevance && skill.roleRelevance.length > 0 && (
        <section className={styles.section}>
          <h2>Role Relevance</h2>
          <div className={styles.roleTypes}>
            {skill.roleRelevance.map((role, idx) => (
              <span key={idx} className={styles.roleTag}>
                {role}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Tags */}
      {skill.tags && skill.tags.length > 0 && (
        <section className={styles.section}>
          <h2>Tags</h2>
          <div className={styles.tagsList}>
            {skill.tags.map((tag, idx) => (
              <span key={idx} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Keywords */}
      {skill.keywords && skill.keywords.length > 0 && (
        <section className={styles.section}>
          <h2>Keywords</h2>
          <div className={styles.keywordsList}>
            {skill.keywords.map((keyword, idx) => (
              <span key={idx} className={styles.keyword}>
                {keyword}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Timestamps */}
      <div className={styles.timestamps}>
        <p>Created: {new Date(skill.createdAt).toLocaleDateString()}</p>
        <p>Last Updated: {new Date(skill.updatedAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
}
