'use client';

import { useRouter } from 'next/navigation';
import ProjectForm from '@/components/ProjectForm';
import type { Project } from '@/lib/types';
import styles from './new.module.css';
import { createProject } from '@/app/projects/actions';

export default function NewProjectPage() {
  const router = useRouter();

  const handleSubmit = async (data: Partial<Project>) => {
    const result = await createProject(data);
    router.push(`/projects/${result.id}`);
  };

  const handleCancel = () => {
    router.push('/projects');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Create New Project</h1>
        <p>Add a new project to your portfolio</p>
      </div>

      <ProjectForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
}
