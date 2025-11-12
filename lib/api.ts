/**
 * API Client
 * Utilities for making authenticated API requests
 */

import { authenticatedFetch } from './auth';
import type { Project, Experience, Profile, Skill } from './types';

// Base API URL
const API_BASE = '/.netlify/functions';

/**
 * Projects API
 */
export const projectsApi = {
  /**
   * List all projects with optional filters
   */
  async list(params?: {
    type?: string;
    featured?: boolean;
    roleType?: string;
    search?: string;
  }): Promise<{ projects: Project[] }> {
    const query = new URLSearchParams();
    if (params?.type) query.append('type', params.type);
    if (params?.featured !== undefined) query.append('featured', String(params.featured));
    if (params?.roleType) query.append('roleType', params.roleType);
    if (params?.search) query.append('search', params.search);

    const url = `${API_BASE}/projects${query.toString() ? `?${query}` : ''}`;
    const response = await authenticatedFetch(url);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || error.details || `HTTP ${response.status}: Failed to fetch projects`);
    }

    return response.json();
  },

  /**
   * Get single project by ID
   */
  async get(id: string): Promise<{ project: Project }> {
    const response = await authenticatedFetch(`${API_BASE}/projects/${id}`);
    return response.json();
  },

  /**
   * Create new project
   */
  async create(data: Partial<Project>): Promise<{ project: Project; projectId: string }> {
    const response = await authenticatedFetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  /**
   * Update existing project
   */
  async update(id: string, data: Partial<Project>): Promise<{ project: Project }> {
    const response = await authenticatedFetch(`${API_BASE}/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  /**
   * Delete project
   */
  async delete(id: string): Promise<{ message: string }> {
    const response = await authenticatedFetch(`${API_BASE}/projects/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

/**
 * Experiences API
 */
export const experiencesApi = {
  /**
   * List all experiences with optional filters
   */
  async list(params?: {
    company?: string;
    roleType?: string;
    featured?: boolean;
    search?: string;
  }): Promise<{ experiences: Experience[] }> {
    const query = new URLSearchParams();
    if (params?.company) query.append('company', params.company);
    if (params?.roleType) query.append('roleType', params.roleType);
    if (params?.featured !== undefined) query.append('featured', String(params.featured));
    if (params?.search) query.append('search', params.search);

    const url = `${API_BASE}/experiences${query.toString() ? `?${query}` : ''}`;
    const response = await authenticatedFetch(url);
    return response.json();
  },

  /**
   * Get single experience by ID
   */
  async get(id: string): Promise<{ experience: Experience }> {
    const response = await authenticatedFetch(`${API_BASE}/experiences/${id}`);
    return response.json();
  },

  /**
   * Create new experience
   */
  async create(data: Partial<Experience>): Promise<{ experience: Experience; experienceId: string }> {
    const response = await authenticatedFetch(`${API_BASE}/experiences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  /**
   * Update existing experience
   */
  async update(id: string, data: Partial<Experience>): Promise<{ experience: Experience }> {
    const response = await authenticatedFetch(`${API_BASE}/experiences/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  /**
   * Delete experience
   */
  async delete(id: string): Promise<{ message: string }> {
    const response = await authenticatedFetch(`${API_BASE}/experiences/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

/**
 * Profile API
 * Note: Profile is a singleton - only one profile per user
 */
export const profileApi = {
  /**
   * Get profile (creates default if doesn't exist)
   */
  async get(): Promise<{ profile: Profile }> {
    const response = await authenticatedFetch(`${API_BASE}/profile`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || error.details || `HTTP ${response.status}: Failed to fetch profile`);
    }
    return response.json();
  },

  /**
   * Update profile
   */
  async update(data: Partial<Profile>): Promise<{ profile: Profile }> {
    const response = await authenticatedFetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || error.details || `HTTP ${response.status}: Failed to update profile`);
    }
    return response.json();
  },

  /**
   * Delete profile (reset to default)
   */
  async delete(): Promise<{ message: string }> {
    const response = await authenticatedFetch(`${API_BASE}/profile`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

/**
 * Skills API
 */
export const skillsApi = {
  /**
   * List all skills with optional filters
   */
  async list(params?: {
    name?: string;
    roleRelevance?: string;
    level?: string;
    tag?: string;
    search?: string;
  }): Promise<{ skills: Skill[] }> {
    const query = new URLSearchParams();
    if (params?.name) query.append('name', params.name);
    if (params?.roleRelevance) query.append('roleRelevance', params.roleRelevance);
    if (params?.level) query.append('level', params.level);
    if (params?.tag) query.append('tag', params.tag);
    if (params?.search) query.append('search', params.search);

    const url = `${API_BASE}/skills${query.toString() ? `?${query}` : ''}`;
    const response = await authenticatedFetch(url);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || error.details || `HTTP ${response.status}: Failed to fetch skills`);
    }

    return response.json();
  },

  /**
   * Get single skill by ID
   */
  async get(id: string): Promise<{ skill: Skill }> {
    const response = await authenticatedFetch(`${API_BASE}/skills/${id}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || error.details || `HTTP ${response.status}: Failed to fetch skill`);
    }
    return response.json();
  },

  /**
   * Create new skill
   */
  async create(data: Partial<Skill>): Promise<{ skill: Skill; skillId: string }> {
    const response = await authenticatedFetch(`${API_BASE}/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || error.details || `HTTP ${response.status}: Failed to create skill`);
    }
    return response.json();
  },

  /**
   * Update existing skill
   */
  async update(id: string, data: Partial<Skill>): Promise<{ skill: Skill }> {
    const response = await authenticatedFetch(`${API_BASE}/skills/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || error.details || `HTTP ${response.status}: Failed to update skill`);
    }
    return response.json();
  },

  /**
   * Delete skill
   */
  async delete(id: string): Promise<{ message: string }> {
    const response = await authenticatedFetch(`${API_BASE}/skills/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || error.details || `HTTP ${response.status}: Failed to delete skill`);
    }
    return response.json();
  },
};
