'use client';

import { useState } from 'react';
import styles from './JobInfoForm.module.css';

type JobType = 'technical-writer' | 'technical-writing-manager' | 'software-engineer' | 'software-engineering-manager';

interface JobInfoFormProps {
  onSubmit: (data: {
    url?: string;
    description: string;
    jobType: JobType;
  }) => void;
  initialData?: {
    url?: string;
    description?: string;
    jobType?: JobType;
  };
}

export default function JobInfoForm({ onSubmit, initialData }: JobInfoFormProps) {
  const [url, setUrl] = useState(initialData?.url || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [jobType, setJobType] = useState<JobType>(initialData?.jobType || 'technical-writer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) return;

    onSubmit({
      url: url.trim() || undefined,
      description: description.trim(),
      jobType,
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
          placeholder="https://company.com/jobs/position"
          className={styles.input}
        />
        <div className={styles.helpText}>
          For reference only. Copy and paste the job description below.
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="jobDescription">Job Description *</label>
        <textarea
          id="jobDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Paste the job description here..."
          required
          rows={10}
          className={styles.textarea}
        />
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
        disabled={!description.trim()}
        className={styles.submitButton}
      >
        Start Resume Generation
      </button>
    </form>
  );
}
