'use client';

import { useRouter } from 'next/navigation';
import { gql } from 'graphql-request';
import graphqlClient from '@/lib/graphql-client';
import ProjectForm from '@/components/ProjectForm';
import type { Project } from '@/lib/types';
import styles from './new.module.css';

const CREATE_PROJECT_MUTATION = gql`
  mutation CreateProject($input: ProjectInput!) {
    createProject(input: $input) {
      id
      name
    }
  }
`;

export default function NewProjectPage() {
  const router = useRouter();

  const handleSubmit = async (data: Partial<Project>) => {
    const result = await graphqlClient.request<{ createProject: Project }>(
      CREATE_PROJECT_MUTATION,
      { input: data }
    );
    router.refresh();
    router.push(`/projects/${result.createProject.id}`);
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
