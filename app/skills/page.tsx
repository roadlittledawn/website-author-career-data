'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Skill } from '@/lib/types';
import { skillsApi } from '@/lib/api';
import styles from './skills.module.css';

export default function SkillsPage() {
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setIsLoading(true);
      const data = await skillsApi.list();
      setSkills(data.skills || []);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load skills');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) {
      return;
    }

    try {
      await skillsApi.delete(id);
      setSkills(skills.filter(skill => skill._id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete skill');
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading skills...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Skills</h1>
          <p>Manage your technical and professional skills</p>
        </div>
        <Link href="/skills/new" className={styles.createBtn}>
          + New Skill
        </Link>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <div className={styles.skillsGrid}>
        {skills.length === 0 ? (
          <div className={styles.empty}>
            <p>No skills yet</p>
            <Link href="/skills/new">Create your first skill</Link>
          </div>
        ) : (
          skills.map((skill) => {
            const skillId = skill._id?.toString() || '';

            return (
              <div key={skillId} className={styles.skillCard}>
                <div className={styles.cardHeader}>
                  <h3>{skill.name}</h3>
                  <div className={styles.rating}>
                    {'★'.repeat(skill.rating)}{'☆'.repeat(5 - skill.rating)}
                  </div>
                </div>

                <div className={styles.skillInfo}>
                  <span className={styles.level}>{skill.level}</span>
                  <span className={styles.years}>
                    {skill.yearsOfExperience} {skill.yearsOfExperience === 1 ? 'year' : 'years'}
                  </span>
                </div>

                {skill.roleRelevance && skill.roleRelevance.length > 0 && (
                  <div className={styles.roleTypes}>
                    {skill.roleRelevance.map((role, idx) => (
                      <span key={idx} className={styles.roleTag}>
                        {role}
                      </span>
                    ))}
                  </div>
                )}

                {skill.tags && skill.tags.length > 0 && (
                  <div className={styles.tags}>
                    {skill.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                    {skill.tags.length > 3 && (
                      <span className={styles.tag}>
                        +{skill.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className={styles.cardActions}>
                  <Link href={`/skills/${skillId}`} className={styles.viewBtn}>
                    View
                  </Link>
                  <Link href={`/skills/${skillId}/edit`} className={styles.editBtn}>
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(skillId)}
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
