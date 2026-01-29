'use client';

import { useRouter } from 'next/navigation';
import ProjectForm from '@/components/ProjectForm';
import type { Project } from '@/lib/types';
import styles from '@/app/projects/[id]/edit/edit.module.css';
import { updateProject } from '@/app/projects/actions';

interface ProjectEditFormProps {
  project: Project;
}

export function ProjectEditForm({ project }: ProjectEditFormProps) {
  const router = useRouter();
  const projectId = project.id;

  const handleSubmit = async (data: Partial<Project>) => {
    await updateProject(projectId, data);
    router.push(`/projects/${projectId}`);
  };

  const handleCancel = () => {
    router.push(`/projects/${projectId}`);
  };

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
