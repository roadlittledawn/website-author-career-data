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
      const sortedSkills = (data.skills || []).sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );
      setSkills(sortedSkills);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load skills');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
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

  // Calculate stats
  const totalSkills = skills.length;
  const writingSkills = skills.filter(skill =>
    skill.roleRelevance?.some(role => role.toLowerCase().includes('writing'))
  ).length;
  const engineeringSkills = skills.filter(skill =>
    skill.roleRelevance?.some(role => role.toLowerCase().includes('engineering'))
  ).length;

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

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{totalSkills}</div>
          <div className={styles.statLabel}>Total Skills</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{writingSkills}</div>
          <div className={styles.statLabel}>Writing Skills</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{engineeringSkills}</div>
          <div className={styles.statLabel}>Engineering Skills</div>
        </div>
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
                <div className={styles.cardContent}>
                  <h3 className={styles.skillName}>{skill.name}</h3>

                  <div className={styles.rating}>
                    {'★'.repeat(skill.rating)}{'☆'.repeat(5 - skill.rating)}
                  </div>

                  <div className={styles.level}>{skill.level}</div>

                  {skill.roleRelevance && skill.roleRelevance.length > 0 && (
                    <div className={styles.roles}>
                      {skill.roleRelevance.map((role, idx) => (
                        <span key={idx} className={styles.roleTag}>
                          {role}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.cardActions}>
                  <Link href={`/skills/${skillId}`} className={styles.iconBtn} title="View">
                    👁️
                  </Link>
                  <Link href={`/skills/${skillId}/edit`} className={styles.iconBtn} title="Edit">
                    ✏️
                  </Link>
                  <button
                    onClick={() => handleDelete(skillId, skill.name)}
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
