/**
 * TypeScript type definitions for Career Data models
 * Based on GraphQL schema from api-career-data
 */

// Supporting Types
export interface PersonalInfo {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  links?: {
    portfolio?: string;
    github?: string;
    linkedin?: string;
    writingSamples?: string;
  };
}

export interface Positioning {
  current?: string;
  byRole?: {
    technical_writer?: string;
    technical_writing_manager?: string;
    software_engineer?: string;
    engineering_manager?: string;
  };
}

export interface Achievement {
  description: string;
  metrics?: string;
  impact?: string;
}

// Entity Types
export interface Profile {
  id: string;
  personalInfo: PersonalInfo;
  positioning?: Positioning;
  valuePropositions: string[];
  professionalMission: string;
  uniqueSellingPoints: string[];
  updatedAt: string;
}

export interface Experience {
  id: string;
  company: string;
  location: string;
  title: string;
  industry?: string;
  startDate: string;
  endDate?: string;
  roleTypes: string[];
  responsibilities: string[];
  achievements: Achievement[];
  technologies: string[];
  organizations?: string[];
  crossFunctional?: string[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  roleRelevance: string[];
  level: string;
  rating: number;
  yearsOfExperience: number;
  tags: string[];
  keywords: string[];
  iconName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectLink {
  type: string;
  url: string;
  linkText?: string;
}

export interface Project {
  id: string;
  name: string;
  type: string;
  date?: string;
  featured: boolean;
  overview: string;
  challenge?: string;
  approach?: string;
  outcome?: string;
  impact?: string;
  technologies: string[];
  keywords: string[];
  roleTypes: string[];
  links?: ProjectLink[];
  createdAt: string;
  updatedAt: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  graduationYear: number;
  relevantCoursework: string[];
  displayOrder?: number;
  createdAt: string;
  updatedAt: string;
}

// Legacy types for compatibility
export type RoleType = string;
export type ProjectType = string;

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
    skills?: Skill[];
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
  role: "user" | "assistant" | "system";
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
