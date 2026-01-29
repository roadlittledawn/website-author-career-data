'use client';

import { useRouter } from 'next/navigation';
import { gql } from 'graphql-request';
import graphqlClient from '@/lib/graphql-client';
import ProjectForm from '@/components/ProjectForm';
import type { Project } from '@/lib/types';
import styles from '@/app/projects/[id]/edit/edit.module.css';

const UPDATE_PROJECT_MUTATION = gql`
  mutation UpdateProject($id: ID!, $input: ProjectInput!) {
    updateProject(id: $id, input: $input) {
      id
      name
      type
      date
      featured
      overview
      challenge
      approach
      outcome
      impact
      technologies
      keywords
      roleTypes
      links {
        url
        linkText
        type
      }
    }
  }
`;

interface ProjectEditFormProps {
  project: Project;
}

export function ProjectEditForm({ project }: ProjectEditFormProps) {
  const router = useRouter();
  const projectId = project.id;

  const handleSubmit = async (data: Partial<Project>) => {
    await graphqlClient.request(UPDATE_PROJECT_MUTATION, { id: projectId, input: data });
    router.refresh();
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
