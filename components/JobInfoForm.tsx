'use client';

import { useState } from 'react';
import styles from './JobInfoForm.module.css';

type JobType = 'technical-writer' | 'technical-writing-manager' | 'software-engineer' | 'software-engineering-manager';

interface JobInfoFormProps {
  onSubmit: (data: {
    url?: string;
    description: string;
    jobType: JobType;
    extractedDescription?: string;
  }) => void;
  initialData?: {
    url?: string;
    description?: string;
    jobType?: JobType;
    extractedDescription?: string;
  };
}

export default function JobInfoForm({ onSubmit, initialData }: JobInfoFormProps) {
  const [url, setUrl] = useState(initialData?.url || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [jobType, setJobType] = useState<JobType>(initialData?.jobType || 'technical-writer');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedDescription, setExtractedDescription] = useState(initialData?.extractedDescription || '');
  const [showExtracted, setShowExtracted] = useState(false);

  const handleUrlBlur = async () => {
    if (url && !description) {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('career_admin_token');
        if (!token || token === 'null') {
          alert('Please log in first');
          return;
        }

        const response = await fetch('/.netlify/functions/job-scraper', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ url })
        });
        
        if (response.ok) {
          const data = await response.json();
          const extracted = data.description || '';
          setExtractedDescription(extracted);
          setDescription(extracted);
          setShowExtracted(!!extracted);
        } else {
          const errorData = await response.json();
          console.warn('Failed to fetch job description:', errorData.error);
          if (response.status === 401) {
            alert('Session expired. Please log in again.');
          }
        }
      } catch (error) {
        console.error('Failed to fetch job description:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If URL is provided but no description yet, try to fetch it first
    if (url.trim() && !description.trim() && !isLoading) {
      handleUrlBlur();
      return;
    }
    
    // Require either URL or description
    if (!description.trim() && !url.trim()) return;
    
    onSubmit({
      url: url || undefined,
      description: description.trim(),
      jobType,
      extractedDescription: extractedDescription || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Job Information</h2>
      
      <div className={styles.field}>
        <label htmlFor="jobUrl">Job Posting URL (optional)</label>
        <input
          id="jobUrl"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={handleUrlBlur}
          placeholder="https://company.com/jobs/position"
          className={styles.input}
        />
        {isLoading && <div className={styles.loading}>Fetching job description...</div>}
        {extractedDescription && (
          <div className={styles.extractedSection}>
            <button 
              type="button"
              onClick={() => setShowExtracted(!showExtracted)}
              className={styles.toggleButton}
            >
              {showExtracted ? '▼' : '▶'} Extracted Job Description
            </button>
            {showExtracted && (
              <div className={styles.extractedContent}>
                <div className={styles.extractedText}>
                  {extractedDescription}
                </div>
              </div>
            )}
          </div>
        )}
        <div className={styles.helpText}>
          Provide a job posting URL to automatically extract the description, or paste the description manually below.
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="jobDescription">
          Job Description {!url ? '*' : '(will be auto-filled from URL)'}
        </label>
        <textarea
          id="jobDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={url ? "Job description will be extracted from URL above..." : "Paste the job description here..."}
          required={!url}
          rows={10}
          className={styles.textarea}
        />
        {url && !description && !isLoading && (
          <div className={styles.helpText}>
            If the URL doesn't work, you can paste the job description manually here.
          </div>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="jobType">Job Type *</label>
        <select
          id="jobType"
          value={jobType}
          onChange={(e) => setJobType(e.target.value as JobType)}
          className={styles.select}
        >
          <option value="technical-writer">Technical Writer</option>
          <option value="technical-writing-manager">Technical Writing Manager</option>
          <option value="software-engineer">Software Engineer</option>
          <option value="software-engineering-manager">Software Engineering Manager</option>
        </select>
      </div>

      <button 
        type="submit" 
        disabled={!description.trim() && !url.trim()}
        className={styles.submitButton}
      >
        Start Resume Generation
      </button>
    </form>
  );
}
