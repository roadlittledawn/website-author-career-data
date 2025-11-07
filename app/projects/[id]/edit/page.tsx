'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProjectForm from '@/components/ProjectForm';
import { projectsApi } from '@/lib/api';
import type { Project } from '@/lib/types';
import styles from './edit.module.css';

export default function EditProjectPage() {
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

  const handleSubmit = async (data: Partial<Project>) => {
    try {
      await projectsApi.update(projectId, data);
      router.push(`/projects/${projectId}`);
    } catch (error) {
      throw error;
    }
  };

  const handleCancel = () => {
    router.push(`/projects/${projectId}`);
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
        <h1>Edit Project</h1>
        <p>Update {project.name}</p>
      </div>

      <ProjectForm
        initialData={project}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
