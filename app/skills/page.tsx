'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { SkillCategory } from '@/lib/types';
import { skillsApi } from '@/lib/api';
import styles from './skills.module.css';

export default function SkillsPage() {
  const router = useRouter();
  const [skills, setSkills] = useState<SkillCategory[]>([]);
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
    if (!confirm('Are you sure you want to delete this skill category?')) {
      return;
    }

    try {
      await skillsApi.delete(id);
      setSkills(skills.filter(skill => skill._id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete skill category');
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
          <p>Organize your technical and professional skills by category</p>
        </div>
        <Link href="/skills/new" className={styles.createBtn}>
          + New Skill Category
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
            <p>No skill categories yet</p>
            <Link href="/skills/new">Create your first skill category</Link>
          </div>
        ) : (
          skills.map((skillCategory) => {
            const skillId = skillCategory._id?.toString() || '';

            return (
              <div key={skillId} className={styles.skillCard}>
                <div className={styles.cardHeader}>
                  <h3>{skillCategory.category}</h3>
                  <span className={styles.skillCount}>
                    {skillCategory.skills.length} {skillCategory.skills.length === 1 ? 'skill' : 'skills'}
                  </span>
                </div>

                <div className={styles.roleTypes}>
                  {skillCategory.roleRelevance.map((role) => (
                    <span key={role} className={styles.roleTag}>
                      {role.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>

                {skillCategory.skills.length > 0 && (
                  <div className={styles.skillsList}>
                    {skillCategory.skills.slice(0, 5).map((skill, idx) => (
                      <div key={idx} className={styles.skillItem}>
                        <span className={styles.skillName}>
                          {skill.featured && <span className={styles.star}>★</span>}
                          {skill.name}
                        </span>
                        {skill.proficiency && (
                          <span className={styles.proficiency}>
                            {skill.proficiency}
                          </span>
                        )}
                      </div>
                    ))}
                    {skillCategory.skills.length > 5 && (
                      <div className={styles.moreSkills}>
                        +{skillCategory.skills.length - 5} more
                      </div>
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
