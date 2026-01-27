'use client';

import { useState } from 'react';
import Link from 'next/link';
import { gql } from 'graphql-request';
import graphqlClient from '@/lib/graphql-client';
import type { Skill } from '@/lib/types';
import styles from '@/app/skills/skills.module.css';

const DELETE_SKILL_MUTATION = gql`
  mutation DeleteSkill($id: ID!) {
    deleteSkill(id: $id) {
      success
      id
    }
  }
`;

interface SkillsListProps {
  initialSkills: Skill[];
}

export function SkillsList({ initialSkills }: SkillsListProps) {
  const [skills, setSkills] = useState(initialSkills);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await graphqlClient.request(DELETE_SKILL_MUTATION, { id });
      setSkills(skills.filter(skill => skill.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete skill');
    }
  };

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

      <div className={styles.skillsGrid}>
        {skills.length === 0 ? (
          <div className={styles.empty}>
            <p>No skills yet</p>
            <Link href="/skills/new">Create your first skill</Link>
          </div>
        ) : (
          skills.map((skill) => {
            const skillId = skill.id?.toString() || '';

            return (
              <div key={skillId} className={styles.skillCard}>
                <div className={styles.cardContent}>
                  <h3 className={styles.skillName}>
                    {skill.name}
                    {skill.featured && <span className={styles.featuredBadge}>⭐ Featured</span>}
                  </h3>

                  <div className={styles.rating}>
                    {'★'.repeat(skill.rating)}{'☆'.repeat(5 - skill.rating)}
                  </div>

                  <div className={styles.level}>{skill.level}</div>

                  {skill.roleRelevance && skill.roleRelevance.length > 0 && (
                    <div className={styles.roles}>
                      {skill.roleRelevance.map((role, idx) => (
                        <span key={idx} className={styles.badge}>{role}</span>
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
