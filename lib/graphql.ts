/**
 * GraphQL Client
 * Client for communicating with the Career Data GraphQL API using graphql-request
 */

import { GraphQLClient, gql } from 'graphql-request';

// API Configuration
const GRAPHQL_API_URL = process.env.NEXT_PUBLIC_GRAPHQL_API_URL || '';
const GRAPHQL_API_KEY = process.env.NEXT_PUBLIC_GRAPHQL_API_KEY || '';

// Create configured GraphQL client
export const graphqlClient = new GraphQLClient(GRAPHQL_API_URL, {
  headers: {
    'X-API-Key': GRAPHQL_API_KEY,
  },
});

// Re-export gql for query definitions
export { gql };

// ===========================================
// GraphQL Query/Mutation Definitions
// ===========================================

// Profile
export const PROFILE_QUERY = gql`
  query GetProfile {
    profile {
      id
      personalInfo {
        name
        email
        phone
        location
        linkedin
        github
        website
      }
      positioning {
        headline
        summary
        targetRoles
        targetIndustries
      }
      valuePropositions
      professionalMission
      uniqueSellingPoints
      updatedAt
    }
  }
`;

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: ProfileInput!) {
    updateProfile(input: $input) {
      id
      personalInfo {
        name
        email
        phone
        location
        linkedin
        github
        website
      }
      positioning {
        headline
        summary
        targetRoles
        targetIndustries
      }
      valuePropositions
      professionalMission
      uniqueSellingPoints
      updatedAt
    }
  }
`;

// Experiences
export const EXPERIENCES_QUERY = gql`
  query GetExperiences($filter: ExperienceFilter) {
    experiences(filter: $filter) {
      id
      company
      location
      title
      industry
      startDate
      endDate
      roleTypes
      responsibilities
      achievements {
        description
        metrics
        impact
      }
      technologies
      featured
      createdAt
      updatedAt
    }
  }
`;

export const EXPERIENCE_QUERY = gql`
  query GetExperience($id: ID!) {
    experience(id: $id) {
      id
      company
      location
      title
      industry
      startDate
      endDate
      roleTypes
      responsibilities
      achievements {
        description
        metrics
        impact
      }
      technologies
      featured
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_EXPERIENCE_MUTATION = gql`
  mutation CreateExperience($input: ExperienceInput!) {
    createExperience(input: $input) {
      id
      company
      location
      title
      industry
      startDate
      endDate
      roleTypes
      responsibilities
      achievements {
        description
        metrics
        impact
      }
      technologies
      featured
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_EXPERIENCE_MUTATION = gql`
  mutation UpdateExperience($id: ID!, $input: ExperienceInput!) {
    updateExperience(id: $id, input: $input) {
      id
      company
      location
      title
      industry
      startDate
      endDate
      roleTypes
      responsibilities
      achievements {
        description
        metrics
        impact
      }
      technologies
      featured
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_EXPERIENCE_MUTATION = gql`
  mutation DeleteExperience($id: ID!) {
    deleteExperience(id: $id) {
      success
      id
    }
  }
`;

// Skills
export const SKILLS_QUERY = gql`
  query GetSkills($filter: SkillFilter) {
    skills(filter: $filter) {
      id
      name
      roleRelevance
      level
      rating
      yearsOfExperience
      tags
      keywords
      createdAt
      updatedAt
    }
  }
`;

export const SKILL_QUERY = gql`
  query GetSkill($id: ID!) {
    skill(id: $id) {
      id
      name
      roleRelevance
      level
      rating
      yearsOfExperience
      tags
      keywords
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_SKILL_MUTATION = gql`
  mutation CreateSkill($input: SkillInput!) {
    createSkill(input: $input) {
      id
      name
      roleRelevance
      level
      rating
      yearsOfExperience
      tags
      keywords
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_SKILL_MUTATION = gql`
  mutation UpdateSkill($id: ID!, $input: SkillInput!) {
    updateSkill(id: $id, input: $input) {
      id
      name
      roleRelevance
      level
      rating
      yearsOfExperience
      tags
      keywords
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_SKILL_MUTATION = gql`
  mutation DeleteSkill($id: ID!) {
    deleteSkill(id: $id) {
      success
      id
    }
  }
`;

// Projects
export const PROJECTS_QUERY = gql`
  query GetProjects($filter: ProjectFilter) {
    projects(filter: $filter) {
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
      createdAt
      updatedAt
    }
  }
`;

export const PROJECT_QUERY = gql`
  query GetProject($id: ID!) {
    project(id: $id) {
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
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_PROJECT_MUTATION = gql`
  mutation CreateProject($input: ProjectInput!) {
    createProject(input: $input) {
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
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_PROJECT_MUTATION = gql`
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
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_PROJECT_MUTATION = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id) {
      success
      id
    }
  }
`;

// Educations
export const EDUCATIONS_QUERY = gql`
  query GetEducations($filter: EducationFilter) {
    educations(filter: $filter) {
      id
      institution
      degree
      field
      graduationYear
      relevantCoursework
      createdAt
      updatedAt
    }
  }
`;

export const EDUCATION_QUERY = gql`
  query GetEducation($id: ID!) {
    education(id: $id) {
      id
      institution
      degree
      field
      graduationYear
      relevantCoursework
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_EDUCATION_MUTATION = gql`
  mutation CreateEducation($input: EducationInput!) {
    createEducation(input: $input) {
      id
      institution
      degree
      field
      graduationYear
      relevantCoursework
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_EDUCATION_MUTATION = gql`
  mutation UpdateEducation($id: ID!, $input: EducationInput!) {
    updateEducation(id: $id, input: $input) {
      id
      institution
      degree
      field
      graduationYear
      relevantCoursework
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_EDUCATION_MUTATION = gql`
  mutation DeleteEducation($id: ID!) {
    deleteEducation(id: $id) {
      success
      id
    }
  }
`;

// AI Generation Mutations
export const GENERATE_RESUME_MUTATION = gql`
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

export const REVISE_RESUME_MUTATION = gql`
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

export const GENERATE_COVER_LETTER_MUTATION = gql`
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

export const REVISE_COVER_LETTER_MUTATION = gql`
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

export const GENERATE_ANSWER_MUTATION = gql`
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

export const REVISE_ANSWER_MUTATION = gql`
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
