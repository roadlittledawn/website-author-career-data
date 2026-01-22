/**
 * API Client
 * GraphQL client for career data API
 */

import { gql } from 'graphql-request';
import graphqlClient from './graphql-client';
import type { Project, Experience, Profile, Skill, Education } from './types';

/**
 * Projects API
 */
export const projectsApi = {
  async list(params?: { type?: string; featured?: boolean; roleType?: string }): Promise<{ projects: Project[] }> {
    const query = gql`
      query GetProjects($filter: ProjectFilter) {
        projects(filter: $filter) {
          id name type date featured overview challenge approach outcome impact
          technologies keywords roleTypes createdAt updatedAt
        }
      }
    `;
    const data = await graphqlClient.request<{ projects: Project[] }>(query, { filter: params });
    return data;
  },

  async get(id: string): Promise<{ project: Project }> {
    const query = gql`
      query GetProject($id: ID!) {
        project(id: $id) {
          id name type date featured overview challenge approach outcome impact
          technologies keywords roleTypes createdAt updatedAt
        }
      }
    `;
    const data = await graphqlClient.request<{ project: Project }>(query, { id });
    return data;
  },

  async create(input: Partial<Project>): Promise<{ project: Project }> {
    const mutation = gql`
      mutation CreateProject($input: ProjectInput!) {
        createProject(input: $input) {
          id name type date featured overview challenge approach outcome impact
          technologies keywords roleTypes createdAt updatedAt
        }
      }
    `;
    const data = await graphqlClient.request<{ createProject: Project }>(mutation, { input });
    return { project: data.createProject };
  },

  async update(id: string, input: Partial<Project>): Promise<{ project: Project }> {
    const mutation = gql`
      mutation UpdateProject($id: ID!, $input: ProjectInput!) {
        updateProject(id: $id, input: $input) {
          id name type date featured overview challenge approach outcome impact
          technologies keywords roleTypes createdAt updatedAt
        }
      }
    `;
    const data = await graphqlClient.request<{ updateProject: Project }>(mutation, { id, input });
    return { project: data.updateProject };
  },

  async delete(id: string): Promise<{ message: string }> {
    const mutation = gql`
      mutation DeleteProject($id: ID!) {
        deleteProject(id: $id) { success id }
      }
    `;
    await graphqlClient.request(mutation, { id });
    return { message: 'Project deleted successfully' };
  },
};

/**
 * Experiences API
 */
export const experiencesApi = {
  async list(params?: { company?: string; roleType?: string; featured?: boolean }): Promise<{ experiences: Experience[] }> {
    const query = gql`
      query GetExperiences($filter: ExperienceFilter) {
        experiences(filter: $filter) {
          id company location title industry startDate endDate roleTypes
          responsibilities achievements { description metrics impact }
          technologies featured createdAt updatedAt
        }
      }
    `;
    const data = await graphqlClient.request<{ experiences: Experience[] }>(query, { filter: params });
    return data;
  },

  async get(id: string): Promise<{ experience: Experience }> {
    const query = gql`
      query GetExperience($id: ID!) {
        experience(id: $id) {
          id company location title industry startDate endDate roleTypes
          responsibilities achievements { description metrics impact }
          technologies featured createdAt updatedAt
        }
      }
    `;
    const data = await graphqlClient.request<{ experience: Experience }>(query, { id });
    return data;
  },

  async create(input: Partial<Experience>): Promise<{ experience: Experience }> {
    const mutation = gql`
      mutation CreateExperience($input: ExperienceInput!) {
        createExperience(input: $input) {
          id company location title industry startDate endDate roleTypes
          responsibilities achievements { description metrics impact }
          technologies featured createdAt updatedAt
        }
      }
    `;
    const data = await graphqlClient.request<{ createExperience: Experience }>(mutation, { input });
    return { experience: data.createExperience };
  },

  async update(id: string, input: Partial<Experience>): Promise<{ experience: Experience }> {
    const mutation = gql`
      mutation UpdateExperience($id: ID!, $input: ExperienceInput!) {
        updateExperience(id: $id, input: $input) {
          id company location title industry startDate endDate roleTypes
          responsibilities achievements { description metrics impact }
          technologies featured createdAt updatedAt
        }
      }
    `;
    const data = await graphqlClient.request<{ updateExperience: Experience }>(mutation, { id, input });
    return { experience: data.updateExperience };
  },

  async delete(id: string): Promise<{ message: string }> {
    const mutation = gql`
      mutation DeleteExperience($id: ID!) {
        deleteExperience(id: $id) { success id }
      }
    `;
    await graphqlClient.request(mutation, { id });
    return { message: 'Experience deleted successfully' };
  },
};

export const profileApi = {
  async get(): Promise<{ profile: Profile | null }> {
    const query = gql`
      query GetProfile {
        profile {
          id
          personalInfo { 
            name email phone location 
            links { portfolio github linkedin writingSamples }
          }
          valuePropositions professionalMission uniqueSellingPoints updatedAt
        }
      }
    `;
    const data = await graphqlClient.request<{ profile: any }>(query);
    // Add default positioning if missing
    if (data.profile && !data.profile.positioning) {
      data.profile.positioning = {
        headline: '',
        summary: '',
        targetRoles: [],
        targetIndustries: []
      };
    }
    return data as { profile: Profile | null };
  },

  async update(input: Partial<Profile>): Promise<{ profile: Profile }> {
    const mutation = gql`
      mutation UpdateProfile($input: ProfileInput!) {
        updateProfile(input: $input) {
          id
          personalInfo { 
            name email phone location 
            links { portfolio github linkedin writingSamples }
          }
          positioning { headline summary targetRoles targetIndustries }
          valuePropositions professionalMission uniqueSellingPoints updatedAt
        }
      }
    `;
    const data = await graphqlClient.request<{ updateProfile: Profile }>(mutation, { input });
    return { profile: data.updateProfile };
  },
};

/**
 * Skills API
 */
export const skillsApi = {
  async list(params?: { name?: string; roleRelevance?: string; level?: string; tag?: string }): Promise<{ skills: Skill[] }> {
    const query = gql`
      query GetSkills($filter: SkillFilter) {
        skills(filter: $filter) {
          id name
        }
      }
    `;
    const data = await graphqlClient.request<{ skills: any[] }>(query, { filter: params });
    // Add default values for missing fields
    const skills = data.skills.map(skill => ({
      ...skill,
      roleRelevance: 'engineering',
      level: 'Intermediate',
      rating: 3,
      yearsOfExperience: 1,
      tags: [],
      keywords: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    return { skills };
  },

  async get(id: string): Promise<{ skill: Skill }> {
    const query = gql`
      query GetSkill($id: ID!) {
        skill(id: $id) {
          id name
        }
      }
    `;
    const data = await graphqlClient.request<{ skill: any }>(query, { id });
    // Add default values for missing fields
    const skill = {
      ...data.skill,
      roleRelevance: data.skill.roleRelevance || 'engineering',
      level: data.skill.level || 'Intermediate',
      rating: data.skill.rating || 3,
      yearsOfExperience: data.skill.yearsOfExperience || 1,
      tags: data.skill.tags || [],
      keywords: data.skill.keywords || [],
      createdAt: data.skill.createdAt || new Date().toISOString(),
      updatedAt: data.skill.updatedAt || new Date().toISOString()
    };
    return { skill };
  },

  async create(input: Partial<Skill>): Promise<{ skill: Skill }> {
    const mutation = gql`
      mutation CreateSkill($input: SkillInput!) {
        createSkill(input: $input) {
          id name roleRelevance level rating yearsOfExperience
          tags keywords createdAt updatedAt
        }
      }
    `;
    const data = await graphqlClient.request<{ createSkill: Skill }>(mutation, { input });
    return { skill: data.createSkill };
  },

  async update(id: string, input: Partial<Skill>): Promise<{ skill: Skill }> {
    const mutation = gql`
      mutation UpdateSkill($id: ID!, $input: SkillInput!) {
        updateSkill(id: $id, input: $input) {
          id name roleRelevance level rating yearsOfExperience
          tags keywords createdAt updatedAt
        }
      }
    `;
    const data = await graphqlClient.request<{ updateSkill: Skill }>(mutation, { id, input });
    return { skill: data.updateSkill };
  },

  async delete(id: string): Promise<{ message: string }> {
    const mutation = gql`
      mutation DeleteSkill($id: ID!) {
        deleteSkill(id: $id) { success id }
      }
    `;
    await graphqlClient.request(mutation, { id });
    return { message: 'Skill deleted successfully' };
  },
};

// Types for Job Agent API
interface JobInfoInput {
  url?: string;
  description: string;
  jobType: 'technical-writer' | 'technical-writing-manager' | 'software-engineer' | 'software-engineering-manager';
  extractedDescription?: string;
}

interface AIGenerationResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    cacheReadInputTokens: number;
    cacheCreationInputTokens: number;
  };
}

/**
 * Job Agent API - AI-powered resume, cover letter, and question generation
 */
export const jobAgentApi = {
  async generateResume(jobInfo: JobInfoInput, additionalContext?: string): Promise<AIGenerationResponse> {
    const mutation = gql`
      mutation GenerateResume($jobInfo: JobInfoInput!, $additionalContext: String) {
        generateResume(jobInfo: $jobInfo, additionalContext: $additionalContext) {
          content
          usage {
            inputTokens
            outputTokens
            cacheReadInputTokens
            cacheCreationInputTokens
          }
        }
      }
    `;
    const data = await graphqlClient.request<{ generateResume: AIGenerationResponse }>(mutation, {
      jobInfo,
      additionalContext
    });
    return data.generateResume;
  },

  async reviseResume(jobInfo: JobInfoInput, feedback: string): Promise<AIGenerationResponse> {
    const mutation = gql`
      mutation ReviseResume($jobInfo: JobInfoInput!, $feedback: String!) {
        reviseResume(jobInfo: $jobInfo, feedback: $feedback) {
          content
          usage {
            inputTokens
            outputTokens
            cacheReadInputTokens
            cacheCreationInputTokens
          }
        }
      }
    `;
    const data = await graphqlClient.request<{ reviseResume: AIGenerationResponse }>(mutation, {
      jobInfo,
      feedback
    });
    return data.reviseResume;
  },

  async generateCoverLetter(jobInfo: JobInfoInput, additionalContext?: string): Promise<AIGenerationResponse> {
    const mutation = gql`
      mutation GenerateCoverLetter($jobInfo: JobInfoInput!, $additionalContext: String) {
        generateCoverLetter(jobInfo: $jobInfo, additionalContext: $additionalContext) {
          content
          usage {
            inputTokens
            outputTokens
            cacheReadInputTokens
            cacheCreationInputTokens
          }
        }
      }
    `;
    const data = await graphqlClient.request<{ generateCoverLetter: AIGenerationResponse }>(mutation, {
      jobInfo,
      additionalContext
    });
    return data.generateCoverLetter;
  },

  async reviseCoverLetter(jobInfo: JobInfoInput, feedback: string): Promise<AIGenerationResponse> {
    const mutation = gql`
      mutation ReviseCoverLetter($jobInfo: JobInfoInput!, $feedback: String!) {
        reviseCoverLetter(jobInfo: $jobInfo, feedback: $feedback) {
          content
          usage {
            inputTokens
            outputTokens
            cacheReadInputTokens
            cacheCreationInputTokens
          }
        }
      }
    `;
    const data = await graphqlClient.request<{ reviseCoverLetter: AIGenerationResponse }>(mutation, {
      jobInfo,
      feedback
    });
    return data.reviseCoverLetter;
  },

  async generateAnswer(jobInfo: JobInfoInput, question: string, currentAnswer?: string): Promise<AIGenerationResponse> {
    const mutation = gql`
      mutation GenerateAnswer($jobInfo: JobInfoInput!, $question: String!, $currentAnswer: String) {
        generateAnswer(jobInfo: $jobInfo, question: $question, currentAnswer: $currentAnswer) {
          content
          usage {
            inputTokens
            outputTokens
            cacheReadInputTokens
            cacheCreationInputTokens
          }
        }
      }
    `;
    const data = await graphqlClient.request<{ generateAnswer: AIGenerationResponse }>(mutation, {
      jobInfo,
      question,
      currentAnswer
    });
    return data.generateAnswer;
  },

  async reviseAnswer(jobInfo: JobInfoInput, question: string, currentAnswer: string, feedback: string): Promise<AIGenerationResponse> {
    const mutation = gql`
      mutation ReviseAnswer($jobInfo: JobInfoInput!, $question: String!, $currentAnswer: String!, $feedback: String!) {
        reviseAnswer(jobInfo: $jobInfo, question: $question, currentAnswer: $currentAnswer, feedback: $feedback) {
          content
          usage {
            inputTokens
            outputTokens
            cacheReadInputTokens
            cacheCreationInputTokens
          }
        }
      }
    `;
    const data = await graphqlClient.request<{ reviseAnswer: AIGenerationResponse }>(mutation, {
      jobInfo,
      question,
      currentAnswer,
      feedback
    });
    return data.reviseAnswer;
  },
};

/**
 * Education API
 */
export const educationApi = {
  async list(params?: { institution?: string; degree?: string; field?: string }): Promise<{ educations: Education[] }> {
    const query = gql`
      query GetEducations($filter: EducationFilter) {
        educations(filter: $filter) {
          id institution degree field graduationYear relevantCoursework
          createdAt updatedAt
        }
      }
    `;
    const data = await graphqlClient.request<{ educations: Education[] }>(query, { filter: params });
    return data;
  },

  async get(id: string): Promise<{ education: Education }> {
    const query = gql`
      query GetEducation($id: ID!) {
        education(id: $id) {
          id institution degree field graduationYear relevantCoursework
          createdAt updatedAt
        }
      }
    `;
    const data = await graphqlClient.request<{ education: Education }>(query, { id });
    return data;
  },

  async create(input: Partial<Education>): Promise<{ education: Education }> {
    const mutation = gql`
      mutation CreateEducation($input: EducationInput!) {
        createEducation(input: $input) {
          id institution degree field graduationYear relevantCoursework
          createdAt updatedAt
        }
      }
    `;
    const data = await graphqlClient.request<{ createEducation: Education }>(mutation, { input });
    return { education: data.createEducation };
  },

  async update(id: string, input: Partial<Education>): Promise<{ education: Education }> {
    const mutation = gql`
      mutation UpdateEducation($id: ID!, $input: EducationInput!) {
        updateEducation(id: $id, input: $input) {
          id institution degree field graduationYear relevantCoursework
          createdAt updatedAt
        }
      }
    `;
    const data = await graphqlClient.request<{ updateEducation: Education }>(mutation, { id, input });
    return { education: data.updateEducation };
  },

  async delete(id: string): Promise<{ message: string }> {
    const mutation = gql`
      mutation DeleteEducation($id: ID!) {
        deleteEducation(id: $id) { success id }
      }
    `;
    await graphqlClient.request(mutation, { id });
    return { message: 'Education deleted successfully' };
  },
};
