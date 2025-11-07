'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Project, ProjectType, RoleType } from '@/lib/types';
import AIButton from './AIAssistant/AIButton';
import styles from './ProjectForm.module.css';

interface ProjectFormProps {
  initialData?: Project;
  onSubmit: (data: Partial<Project>) => Promise<void>;
  onCancel: () => void;
}

export default function ProjectForm({ initialData, onSubmit, onCancel }: ProjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [technologies, setTechnologies] = useState<string[]>(initialData?.technologies || []);
  const [newTech, setNewTech] = useState('');
  const [keywords, setKeywords] = useState<string[]>(initialData?.keywords || []);
  const [newKeyword, setNewKeyword] = useState('');
  const [links, setLinks] = useState(initialData?.links || []);
  const [showAI, setShowAI] = useState(false);
  const [aiField, setAiField] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: initialData?.name || '',
      type: initialData?.type || 'technical_writing',
      date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
      featured: initialData?.featured || false,
      overview: initialData?.overview || '',
      challenge: initialData?.challenge || '',
      approach: initialData?.approach || '',
      outcome: initialData?.outcome || '',
      impact: initialData?.impact || '',
      roleTypes: initialData?.roleTypes || [],
      writingSampleGoogleDocId: initialData?.writingSample?.googleDocId || '',
      writingSampleFormat: initialData?.writingSample?.format || '',
    },
  });

  const onFormSubmit = async (data: any) => {
    setError('');
    setIsSubmitting(true);

    try {
      const projectData: Partial<Project> = {
        name: data.name,
        type: data.type as ProjectType,
        date: data.date ? new Date(data.date) : undefined,
        featured: data.featured,
        overview: data.overview,
        challenge: data.challenge || undefined,
        approach: data.approach || undefined,
        outcome: data.outcome || undefined,
        impact: data.impact || undefined,
        technologies,
        keywords,
        links: links.length > 0 ? links : undefined,
        roleTypes: data.roleTypes,
        writingSample: data.writingSampleGoogleDocId ? {
          googleDocId: data.writingSampleGoogleDocId,
          format: data.writingSampleFormat,
        } : undefined,
      };

      await onSubmit(projectData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save project');
      setIsSubmitting(false);
    }
  };

  const addTechnology = () => {
    if (newTech.trim() && !technologies.includes(newTech.trim())) {
      setTechnologies([...technologies, newTech.trim()]);
      setNewTech('');
    }
  };

  const removeTechnology = (tech: string) => {
    setTechnologies(technologies.filter(t => t !== tech));
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const addLink = () => {
    setLinks([...links, { type: 'github', url: '', description: '' }]);
  };

  const updateLink = (index: number, field: string, value: string) => {
    const updated = [...links];
    updated[index] = { ...updated[index], [field]: value };
    setLinks(updated);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const openAIAssistant = (field: string) => {
    setAiField(field);
    setShowAI(true);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className={styles.form}>
      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className={styles.section}>
        <h2>Basic Information</h2>

        <div className={styles.field}>
          <label htmlFor="name">
            Project Name <span className={styles.required}>*</span>
          </label>
          <div className={styles.fieldWithAI}>
            <input
              id="name"
              {...register('name', { required: 'Project name is required' })}
              placeholder="Enter project name"
              disabled={isSubmitting}
            />
            <AIButton
              variant="secondary"
              size="sm"
              onClick={() => openAIAssistant('name')}
            />
          </div>
          {errors.name && <span className={styles.fieldError}>{errors.name.message}</span>}
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="type">
              Project Type <span className={styles.required}>*</span>
            </label>
            <select
              id="type"
              {...register('type', { required: 'Project type is required' })}
              disabled={isSubmitting}
            >
              <option value="technical_writing">Technical Writing</option>
              <option value="software_engineering">Software Engineering</option>
              <option value="leadership">Leadership</option>
              <option value="hybrid">Hybrid</option>
            </select>
            {errors.type && <span className={styles.fieldError}>{errors.type.message}</span>}
          </div>

          <div className={styles.field}>
            <label htmlFor="date">Project Date</label>
            <input
              id="date"
              type="date"
              {...register('date')}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className={styles.checkboxField}>
          <input
            id="featured"
            type="checkbox"
            {...register('featured')}
            disabled={isSubmitting}
          />
          <label htmlFor="featured">Feature this project</label>
        </div>
      </div>

      {/* Project Description */}
      <div className={styles.section}>
        <h2>Project Description</h2>

        <div className={styles.field}>
          <label htmlFor="overview">
            Overview <span className={styles.required}>*</span>
          </label>
          <div className={styles.fieldWithAI}>
            <textarea
              id="overview"
              {...register('overview', { required: 'Overview is required' })}
              rows={4}
              placeholder="Brief overview of the project"
              disabled={isSubmitting}
            />
            <AIButton
              variant="secondary"
              size="sm"
              onClick={() => openAIAssistant('overview')}
            />
          </div>
          {errors.overview && <span className={styles.fieldError}>{errors.overview.message}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="challenge">Challenge</label>
          <div className={styles.fieldWithAI}>
            <textarea
              id="challenge"
              {...register('challenge')}
              rows={3}
              placeholder="What problem or challenge did this project address?"
              disabled={isSubmitting}
            />
            <AIButton
              variant="secondary"
              size="sm"
              onClick={() => openAIAssistant('challenge')}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="approach">Approach</label>
          <div className={styles.fieldWithAI}>
            <textarea
              id="approach"
              {...register('approach')}
              rows={3}
              placeholder="How did you approach solving this problem?"
              disabled={isSubmitting}
            />
            <AIButton
              variant="secondary"
              size="sm"
              onClick={() => openAIAssistant('approach')}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="outcome">Outcome</label>
          <div className={styles.fieldWithAI}>
            <textarea
              id="outcome"
              {...register('outcome')}
              rows={3}
              placeholder="What was the result or deliverable?"
              disabled={isSubmitting}
            />
            <AIButton
              variant="secondary"
              size="sm"
              onClick={() => openAIAssistant('outcome')}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="impact">Impact</label>
          <div className={styles.fieldWithAI}>
            <textarea
              id="impact"
              {...register('impact')}
              rows={3}
              placeholder="What was the business or user impact?"
              disabled={isSubmitting}
            />
            <AIButton
              variant="secondary"
              size="sm"
              onClick={() => openAIAssistant('impact')}
            />
          </div>
        </div>
      </div>

      {/* Technologies */}
      <div className={styles.section}>
        <h2>Technologies <span className={styles.required}>*</span></h2>

        <div className={styles.tagsInput}>
          <input
            type="text"
            value={newTech}
            onChange={(e) => setNewTech(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
            placeholder="Add technology (press Enter)"
            disabled={isSubmitting}
          />
          <button type="button" onClick={addTechnology} disabled={isSubmitting}>
            Add
          </button>
        </div>

        <div className={styles.tags}>
          {technologies.map((tech, idx) => (
            <span key={idx} className={styles.tag}>
              {tech}
              <button
                type="button"
                onClick={() => removeTechnology(tech)}
                disabled={isSubmitting}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        {technologies.length === 0 && (
          <span className={styles.fieldError}>At least one technology is required</span>
        )}
      </div>

      {/* Role Types */}
      <div className={styles.section}>
        <h2>Relevant Role Types <span className={styles.required}>*</span></h2>

        <div className={styles.checkboxGroup}>
          <label>
            <input
              type="checkbox"
              value="technical_writer"
              {...register('roleTypes', { required: 'Select at least one role type' })}
              disabled={isSubmitting}
            />
            Technical Writer
          </label>
          <label>
            <input
              type="checkbox"
              value="technical_writing_manager"
              {...register('roleTypes', { required: 'Select at least one role type' })}
              disabled={isSubmitting}
            />
            Technical Writing Manager
          </label>
          <label>
            <input
              type="checkbox"
              value="software_engineer"
              {...register('roleTypes', { required: 'Select at least one role type' })}
              disabled={isSubmitting}
            />
            Software Engineer
          </label>
          <label>
            <input
              type="checkbox"
              value="engineering_manager"
              {...register('roleTypes', { required: 'Select at least one role type' })}
              disabled={isSubmitting}
            />
            Engineering Manager
          </label>
        </div>
        {errors.roleTypes && <span className={styles.fieldError}>{errors.roleTypes.message}</span>}
      </div>

      {/* Keywords */}
      <div className={styles.section}>
        <h2>Keywords (Optional)</h2>

        <div className={styles.tagsInput}>
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
            placeholder="Add keyword (press Enter)"
            disabled={isSubmitting}
          />
          <button type="button" onClick={addKeyword} disabled={isSubmitting}>
            Add
          </button>
        </div>

        <div className={styles.tags}>
          {keywords.map((keyword, idx) => (
            <span key={idx} className={styles.tag}>
              {keyword}
              <button
                type="button"
                onClick={() => removeKeyword(keyword)}
                disabled={isSubmitting}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className={styles.section}>
        <h2>Project Links (Optional)</h2>
        <button type="button" onClick={addLink} className={styles.addButton} disabled={isSubmitting}>
          + Add Link
        </button>

        {links.map((link, idx) => (
          <div key={idx} className={styles.linkGroup}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Type</label>
                <select
                  value={link.type}
                  onChange={(e) => updateLink(idx, 'type', e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="github">GitHub</option>
                  <option value="demo">Live Demo</option>
                  <option value="docs">Documentation</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className={styles.field}>
                <label>URL</label>
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => updateLink(idx, 'url', e.target.value)}
                  placeholder="https://..."
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label>Description</label>
              <input
                type="text"
                value={link.description || ''}
                onChange={(e) => updateLink(idx, 'description', e.target.value)}
                placeholder="Optional description"
                disabled={isSubmitting}
              />
            </div>

            <button
              type="button"
              onClick={() => removeLink(idx)}
              className={styles.removeButton}
              disabled={isSubmitting}
            >
              Remove Link
            </button>
          </div>
        ))}
      </div>

      {/* Writing Sample */}
      <div className={styles.section}>
        <h2>Writing Sample (Optional)</h2>
        <p className={styles.sectionDesc}>For technical writing projects</p>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="writingSampleGoogleDocId">Google Doc ID</label>
            <input
              id="writingSampleGoogleDocId"
              {...register('writingSampleGoogleDocId')}
              placeholder="Document ID from Google Docs URL"
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="writingSampleFormat">Format</label>
            <input
              id="writingSampleFormat"
              {...register('writingSampleFormat')}
              placeholder="e.g., Tutorial, API Reference, Guide"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className={styles.actions}>
        <button
          type="button"
          onClick={onCancel}
          className={styles.cancelBtn}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isSubmitting || technologies.length === 0}
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update Project' : 'Create Project'}
        </button>
      </div>
    </form>
  );
}
