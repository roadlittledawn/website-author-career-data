/**
 * TypeScript type definitions for Career Data models
 * Based on MongoDB schema from REQUIREMENTS.md
 */

// Role types used across collections
export type RoleType =
  | 'technical_writer'
  | 'technical_writing_manager'
  | 'software_engineer'
  | 'engineering_manager';

// Proficiency levels for skills
export type ProficiencyLevel = 'expert' | 'advanced' | 'intermediate' | 'beginner';

// Project types
export type ProjectType = 'technical_writing' | 'software_engineering' | 'leadership' | 'hybrid';

// Profile Collection
export interface Profile {
  _id?: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    links: {
      portfolio?: string;
      github?: string;
      linkedin?: string;
      writingSamples?: string;
    };
  };
  positioning: {
    current: string;
    byRole: {
      technical_writer?: string;
      technical_writing_manager?: string;
      software_engineer?: string;
      engineering_manager?: string;
    };
  };
  valuePropositions: string[];
  professionalMission?: string;
  uniqueSellingPoints: string[];
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Experiences Collection
export interface Experience {
  _id?: string;
  company: string;
  location: string;
  title: string;
  industry?: string;
  startDate: Date;
  endDate?: Date | null;
  organizations?: string[];
  roleTypes: RoleType[];
  responsibilities: string[];
  achievements?: Array<{
    description: string;
    impact?: string;
    keywords?: string[];
  }>;
  technologies: string[];
  crossFunctional?: string[];
  displayOrder?: number;
  featured?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Skills Collection (Flat Structure)
export interface Skill {
  _id?: string;
  name: string;
  roleRelevance: string[];
  level: string; // e.g., "Beginner", "Intermediate", "Advanced", "Expert"
  rating: number; // 1-5
  yearsOfExperience: number;
  tags: string[];
  iconName?: string;
  keywords: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Legacy: Old nested structure (deprecated)
export interface LegacySkillItem {
  name: string;
  proficiency?: ProficiencyLevel;
  yearsUsed?: number;
  lastUsed?: Date;
  keywords?: string[];
  featured?: boolean;
}

export interface SkillCategory {
  _id?: string;
  category: string;
  roleRelevance: RoleType[];
  skills: LegacySkillItem[];
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Projects Collection
export interface Project {
  _id?: string;
  name: string;
  type: ProjectType;
  date?: Date;
  featured?: boolean;
  overview: string;
  challenge?: string;
  approach?: string;
  outcome?: string;
  impact?: string;
  technologies: string[];
  keywords?: string[];
  links?: Array<{
    url: string;
    linkText: string;
    type: 'github' | 'demo' | 'writing_sample' | 'other';
  }>;
  roleTypes: RoleType[];
  createdAt: Date;
  updatedAt: Date;
}

// Education Collection
export interface Education {
  _id?: string;
  institution: string;
  degree: string;
  field: string;
  graduationYear: number;
  relevantCoursework?: string[];
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Keywords Collection
export interface KeywordTerm {
  primary: string;
  alternatives?: string[];
  frequency?: number;
  context?: string;
}

export interface KeywordCategory {
  _id?: string;
  category: string;
  roleType?: RoleType;
  terms: KeywordTerm[];
  createdAt: Date;
  updatedAt: Date;
}

// AI Assistant Types
export interface AIContext {
  profileSummary: {
    name: string;
    positioning: string;
    valueProps: string[];
    mission?: string;
  };
  currentItem: any; // Type depends on collection
  relatedContext: {
    skills?: SkillCategory[];
    keywords?: KeywordCategory[];
    recentExperiences?: Experience[];
    relatedProjects?: Project[];
  };
  editingContext: {
    collection: string;
    roleType: RoleType;
    field?: string;
  };
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIRequest {
  messages: AIMessage[];
  context: AIContext;
  options?: {
    stream?: boolean;
    maxTokens?: number;
    temperature?: number;
  };
}

export interface AIResponse {
  message: {
    role: string;
    content: string;
  };
  usage?: {
    input_tokens: number;
    output_tokens: number;
    cached_tokens?: number;
  };
}

// API Response Types
export interface APIError {
  error: string;
  code?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Filter/Query Types
export interface ExperienceFilters {
  roleTypes?: RoleType | RoleType[];
  featured?: boolean;
  company?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  skip?: number;
}

export interface SkillFilters {
  roleRelevance?: RoleType | RoleType[];
  category?: string;
}

export interface ProjectFilters {
  roleTypes?: RoleType | RoleType[];
  type?: ProjectType;
  featured?: boolean;
  limit?: number;
}
