import { useState, useCallback } from 'react';
import type { AIContext, RoleType } from '../types';

interface BuildContextOptions {
  collection: string;
  itemId?: string;
  roleType: RoleType;
  field?: string;
}

/**
 * Hook for building smart AI context from career data
 */
export function useAIContext() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildContext = useCallback(async (options: BuildContextOptions): Promise<AIContext | null> => {
    const { collection, itemId, roleType, field } = options;

    setIsLoading(true);
    setError(null);

    try {
      // 1. Get profile summary
      const profileResponse = await fetch('/api/profile');
      if (!profileResponse.ok) throw new Error('Failed to fetch profile');
      const profile = await profileResponse.json();

      const profileSummary = {
        name: profile.personalInfo?.name || 'User',
        positioning: profile.positioning?.byRole?.[roleType] || profile.positioning?.current || '',
        valueProps: profile.valuePropositions?.slice(0, 3) || [],
        mission: profile.professionalMission || '',
      };

      // 2. Get current item being edited
      let currentItem = null;
      if (itemId && collection !== 'profile') {
        const itemResponse = await fetch(`/api/${collection}/${itemId}`);
        if (itemResponse.ok) {
          currentItem = await itemResponse.json();
        }
      } else if (collection === 'profile') {
        currentItem = profile;
      }

      // 3. Get related context
      const relatedContext: any = {};

      if (collection === 'experiences' || collection === 'projects') {
        // Get relevant skills
        try {
          const skillsResponse = await fetch(
            `/api/skills?roleRelevance=${roleType}`
          );
          if (skillsResponse.ok) {
            relatedContext.skills = await skillsResponse.json();
          }
        } catch (err) {
          console.error('Error fetching skills:', err);
        }

        // Get ATS keywords
        try {
          const keywordsResponse = await fetch(
            `/api/keywords?roleType=${roleType}`
          );
          if (keywordsResponse.ok) {
            relatedContext.keywords = await keywordsResponse.json();
          }
        } catch (err) {
          console.error('Error fetching keywords:', err);
        }

        // Get recent experiences for consistency
        if (collection === 'experiences') {
          try {
            const experiencesResponse = await fetch(
              `/api/experiences?roleTypes=${roleType}&limit=3`
            );
            if (experiencesResponse.ok) {
              const allExperiences = await experiencesResponse.json();
              relatedContext.recentExperiences = allExperiences
                .filter((exp: any) => exp._id !== itemId)
                .slice(0, 2);
            }
          } catch (err) {
            console.error('Error fetching experiences:', err);
          }
        }

        // Get related projects
        if (collection === 'projects') {
          try {
            const projectsResponse = await fetch(
              `/api/projects?roleTypes=${roleType}&limit=3`
            );
            if (projectsResponse.ok) {
              const allProjects = await projectsResponse.json();
              relatedContext.relatedProjects = allProjects
                .filter((proj: any) => proj._id !== itemId)
                .slice(0, 2);
            }
          } catch (err) {
            console.error('Error fetching projects:', err);
          }
        }
      }

      const context: AIContext = {
        profileSummary,
        currentItem,
        relatedContext,
        editingContext: {
          collection,
          roleType,
          field,
        },
      };

      setIsLoading(false);
      return context;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to build AI context';
      setError(errorMessage);
      setIsLoading(false);
      console.error('Error building AI context:', err);
      return null;
    }
  }, []);

  return {
    buildContext,
    isLoading,
    error,
  };
}

/**
 * Estimate token count for context (rough approximation)
 */
export function estimateTokenCount(context: AIContext): number {
  const jsonString = JSON.stringify(context);
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(jsonString.length / 4);
}

/**
 * Compress context to reduce token count
 */
export function compressContext(context: AIContext): AIContext {
  const compressed = { ...context };

  // Compress current item - only include essential fields
  if (compressed.currentItem) {
    const item = compressed.currentItem;
    if (item.responsibilities) {
      item.responsibilities = item.responsibilities.slice(0, 5);
    }
    if (item.achievements) {
      item.achievements = item.achievements.slice(0, 5);
    }
    if (item.bulletPoints) {
      item.bulletPoints = item.bulletPoints.slice(0, 5);
    }
    if (item.technologies) {
      item.technologies = item.technologies.slice(0, 10);
    }
  }

  // Compress related context
  if (compressed.relatedContext) {
    if (compressed.relatedContext.skills) {
      compressed.relatedContext.skills = compressed.relatedContext.skills.slice(0, 3);
    }
    if (compressed.relatedContext.keywords) {
      compressed.relatedContext.keywords = compressed.relatedContext.keywords.slice(0, 3);
    }
    if (compressed.relatedContext.recentExperiences) {
      compressed.relatedContext.recentExperiences = compressed.relatedContext.recentExperiences
        .slice(0, 2)
        .map((exp: any) => ({
          company: exp.company,
          title: exp.title,
          technologies: exp.technologies?.slice(0, 5),
        })) as any; // Compressed version with only essential fields
    }
  }

  return compressed;
}
