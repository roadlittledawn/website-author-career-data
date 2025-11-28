/**
 * AI Context Builder
 * Builds smart context from career data for AI assistant
 */

/**
 * Build smart context for AI assistant
 * @param {Object} options - Context options
 * @param {string} options.collection - Collection being edited ('experiences', 'projects', etc.)
 * @param {string} options.itemId - ID of item being edited
 * @param {string} options.roleType - Target role type
 * @param {string} options.field - Specific field being edited (optional)
 * @param {Object} options.api - API client instance
 * @returns {Promise<Object>} Context object for AI
 */
async function buildSmartContext(options) {
  const {
    collection,
    itemId,
    roleType = 'technical_writer',
    field,
    api
  } = options;

  try {
    // 1. Always include profile summary
    const profile = await api.getProfile();
    const profileSummary = {
      name: profile.personalInfo?.name || 'User',
      positioning: profile.positioning?.byRole?.[roleType] || profile.positioning?.current || '',
      valueProps: profile.valuePropositions?.slice(0, 3) || [],
      mission: profile.professionalMission || ''
    };

    // 2. Get current item detail
    let currentItem = null;
    if (itemId && collection !== 'profile') {
      currentItem = await getCurrentItem(collection, itemId, api);
    } else if (collection === 'profile') {
      currentItem = profile;
    }

    // 3. Get related context based on collection type
    const relatedContext = await getRelatedContext(collection, roleType, itemId, api);

    return {
      profileSummary,
      currentItem,
      relatedContext,
      editingContext: {
        collection,
        roleType,
        field
      }
    };
  } catch (error) {
    console.error('Error building AI context:', error);

    // Return minimal context on error
    return {
      profileSummary: {
        name: 'User',
        positioning: '',
        valueProps: [],
        mission: ''
      },
      currentItem: null,
      relatedContext: {},
      editingContext: {
        collection,
        roleType,
        field
      }
    };
  }
}

/**
 * Get current item being edited
 */
async function getCurrentItem(collection, itemId, api) {
  try {
    switch (collection) {
      case 'experiences':
        return await api.getExperience(itemId);
      case 'skills':
        return await api.getSkill(itemId);
      case 'projects':
        return await api.getProject(itemId);
      case 'education':
        return await api.getEducation(itemId);
      case 'keywords':
        return await api.getKeyword(itemId);
      default:
        return null;
    }
  } catch (error) {
    console.error(`Error getting ${collection} item:`, error);
    return null;
  }
}

/**
 * Get related context based on collection type
 */
async function getRelatedContext(collection, roleType, currentItemId, api) {
  const context = {};

  try {
    // For experiences and projects, get relevant skills and keywords
    if (collection === 'experiences' || collection === 'projects') {
      // Get relevant skills
      try {
        const skillsResponse = await api.getSkills({
          roleRelevance: roleType
        });
        context.skills = Array.isArray(skillsResponse) ? skillsResponse : [];
      } catch (error) {
        console.error('Error fetching skills:', error);
        context.skills = [];
      }

      // Get ATS keywords
      try {
        const keywordsResponse = await api.getKeywords({
          roleType: roleType
        });
        context.keywords = Array.isArray(keywordsResponse) ? keywordsResponse : [];
      } catch (error) {
        console.error('Error fetching keywords:', error);
        context.keywords = [];
      }

      // For experiences, get other recent experiences for consistency
      if (collection === 'experiences') {
        try {
          const experiencesResponse = await api.getExperiences({
            roleTypes: roleType,
            limit: 3
          });
          const allExperiences = Array.isArray(experiencesResponse) ? experiencesResponse : [];
          context.recentExperiences = allExperiences
            .filter(exp => exp._id !== currentItemId)
            .slice(0, 2);
        } catch (error) {
          console.error('Error fetching experiences:', error);
          context.recentExperiences = [];
        }
      }

      // For projects, get related projects
      if (collection === 'projects') {
        try {
          const projectsResponse = await api.getProjects({
            roleTypes: roleType,
            limit: 3
          });
          const allProjects = Array.isArray(projectsResponse) ? projectsResponse : [];
          context.relatedProjects = allProjects
            .filter(proj => proj._id !== currentItemId)
            .slice(0, 2);
        } catch (error) {
          console.error('Error fetching projects:', error);
          context.relatedProjects = [];
        }
      }
    }

    // For skills, get related experiences
    if (collection === 'skills') {
      try {
        const experiencesResponse = await api.getExperiences({
          roleTypes: roleType,
          limit: 3,
          featured: true
        });
        context.relatedExperiences = Array.isArray(experiencesResponse) ? experiencesResponse : [];
      } catch (error) {
        console.error('Error fetching experiences for skills:', error);
        context.relatedExperiences = [];
      }
    }

    return context;
  } catch (error) {
    console.error('Error getting related context:', error);
    return {};
  }
}

/**
 * Compress context to reduce token count
 * Useful for large career profiles
 */
function compressContext(context) {
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
        .map(exp => ({
          company: exp.company,
          title: exp.title,
          technologies: exp.technologies?.slice(0, 5)
        }));
    }
  }

  return compressed;
}

/**
 * Estimate token count for context (rough approximation)
 * @param {Object} context - Context object
 * @returns {number} Estimated token count
 */
function estimateTokenCount(context) {
  const jsonString = JSON.stringify(context);
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(jsonString.length / 4);
}

/**
 * Helper to capitalize first letter
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    buildSmartContext,
    compressContext,
    estimateTokenCount
  };
}
