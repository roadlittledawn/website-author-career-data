'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { gql } from 'graphql-request';
import graphqlClient from '@/lib/graphql-client';
import type { Project } from '@/lib/types';
import styles from '@/app/projects/[id]/detail.module.css';

const DELETE_PROJECT_MUTATION = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id) {
      success
      id
    }
  }
`;

interface ProjectDetailProps {
  project: Project;
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  const router = useRouter();
  const projectId = project.id;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await graphqlClient.request(DELETE_PROJECT_MUTATION, { id: projectId });
      router.push('/projects');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div className={styles.breadcrumb}>
            <Link href="/projects">Projects</Link>
            <span>/</span>
            <span>{project.name}</span>
          </div>
          <h1>{project.name}</h1>
          {project.featured && (
            <span className={styles.featuredBadge}>⭐ Featured</span>
          )}
        </div>
        <div className={styles.actions}>
          <Link href={`/projects/${projectId}/edit`} className={styles.editBtn}>
            Edit
          </Link>
          <button onClick={handleDelete} className={styles.deleteBtn}>
            Delete
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {/* Metadata */}
        <div className={styles.metadata}>
          <div className={styles.metaItem}>
            <strong>Type:</strong>
            <span className={styles.projectType}>
              {project.type.replace(/_/g, ' ')}
            </span>
          </div>
          <div className={styles.metaItem}>
            <strong>Date:</strong>
            <span>{formatDate(project.date)}</span>
          </div>
        </div>

        {/* Overview */}
        <div className={styles.section}>
          <h2>Overview</h2>
          <p>{project.overview}</p>
        </div>

        {/* Challenge */}
        {project.challenge && (
          <div className={styles.section}>
            <h2>Challenge</h2>
            <p>{project.challenge}</p>
          </div>
        )}

        {/* Approach */}
        {project.approach && (
          <div className={styles.section}>
            <h2>Approach</h2>
            <p>{project.approach}</p>
          </div>
        )}

        {/* Outcome */}
        {project.outcome && (
          <div className={styles.section}>
            <h2>Outcome</h2>
            <p>{project.outcome}</p>
          </div>
        )}

        {/* Impact */}
        {project.impact && (
          <div className={styles.section}>
            <h2>Impact</h2>
            <p>{project.impact}</p>
          </div>
        )}

        {/* Technologies */}
        <div className={styles.section}>
          <h2>Technologies</h2>
          <div className={styles.tags}>
            {project.technologies.map((tech, idx) => (
              <span key={idx} className={styles.tag}>
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Role Types */}
        <div className={styles.section}>
          <h2>Relevant Role Types</h2>
          <div className={styles.roleTags}>
            {project.roleTypes.map((role, idx) => (
              <span key={idx} className={styles.roleTag}>
                {role.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>

        {/* Keywords */}
        {project.keywords && project.keywords.length > 0 && (
          <div className={styles.section}>
            <h2>Keywords</h2>
            <div className={styles.tags}>
              {project.keywords.map((keyword, idx) => (
                <span key={idx} className={styles.tag}>
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        {project.links && project.links.length > 0 && (
          <div className={styles.section}>
            <h2>Project Links</h2>
            <div className={styles.links}>
              {project.links.map((link, idx) => (
                <div key={idx} className={styles.link}>
                  <span className={styles.linkType}>{link.type.replace('_', ' ')}</span>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.linkText || link.url}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
