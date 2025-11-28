'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { projectsApi } from '@/lib/api';
import type { Project } from '@/lib/types';
import styles from './detail.module.css';

export default function ProjectDetailPage() {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      setIsLoading(true);
      const data = await projectsApi.get(projectId);
      setProject(data.project);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await projectsApi.delete(projectId);
      router.push('/projects');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading project...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error || 'Project not found'}</div>
        <button onClick={() => router.push('/projects')} className={styles.backBtn}>
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div className={styles.breadcrumb}>
            <button onClick={() => router.push('/projects')}>Projects</button>
            <span>/</span>
            <span>{project.name}</span>
          </div>
          <h1>{project.name}</h1>
          {project.featured && (
            <span className={styles.featuredBadge}>⭐ Featured</span>
          )}
        </div>
        <div className={styles.actions}>
          <button
            onClick={() => router.push(`/projects/${projectId}/edit`)}
            className={styles.editBtn}
          >
            Edit
          </button>
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
