'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { skillsApi } from '@/lib/api';
import type { SkillCategory } from '@/lib/types';
import styles from './skill.module.css';

export default function SkillPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [skill, setSkill] = useState<SkillCategory | null>(null);
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
      setError(err instanceof Error ? err.message : 'Failed to load skill category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this skill category?')) {
      return;
    }

    try {
      await skillsApi.delete(id);
      router.push('/skills');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete skill category');
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading skill category...</div>
      </div>
    );
  }

  if (error || !skill) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error || 'Skill category not found'}</div>
        <Link href="/skills" className={styles.backLink}>Back to Skills</Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <Link href="/skills" className={styles.backLink}>← Back to Skills</Link>
          <h1>{skill.category}</h1>
          <div className={styles.metadata}>
            <span className={styles.skillCount}>
              {skill.skills.length} {skill.skills.length === 1 ? 'skill' : 'skills'}
            </span>
            {skill.displayOrder !== undefined && (
              <span className={styles.displayOrder}>Display Order: {skill.displayOrder}</span>
            )}
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

      {/* Role Relevance */}
      <section className={styles.section}>
        <h2>Role Relevance</h2>
        <div className={styles.roleTypes}>
          {skill.roleRelevance.map((role) => (
            <span key={role} className={styles.roleTag}>
              {role.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className={styles.section}>
        <h2>Skills</h2>
        <div className={styles.skillsList}>
          {skill.skills.map((skillItem, index) => (
            <div key={index} className={styles.skillItem}>
              <div className={styles.skillHeader}>
                <h3>
                  {skillItem.featured && <span className={styles.star}>★</span>}
                  {skillItem.name}
                </h3>
                {skillItem.proficiency && (
                  <span className={styles.proficiencyBadge}>
                    {skillItem.proficiency}
                  </span>
                )}
              </div>

              <div className={styles.skillDetails}>
                {skillItem.yearsUsed !== undefined && (
                  <div className={styles.detail}>
                    <label>Experience:</label>
                    <span>{skillItem.yearsUsed} {skillItem.yearsUsed === 1 ? 'year' : 'years'}</span>
                  </div>
                )}

                {skillItem.lastUsed && (
                  <div className={styles.detail}>
                    <label>Last Used:</label>
                    <span>
                      {new Date(skillItem.lastUsed).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>

              {skillItem.keywords && skillItem.keywords.length > 0 && (
                <div className={styles.keywords}>
                  <label>Keywords:</label>
                  <div className={styles.keywordTags}>
                    {skillItem.keywords.map((keyword, kwIndex) => (
                      <span key={kwIndex} className={styles.keywordTag}>
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Timestamps */}
      <div className={styles.timestamps}>
        <p>Created: {new Date(skill.createdAt).toLocaleDateString()}</p>
        <p>Last Updated: {new Date(skill.updatedAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
}
