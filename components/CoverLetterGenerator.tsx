'use client';

import { useState } from 'react';
import { marked } from 'marked';
import styles from './CoverLetterGenerator.module.css';

type JobType = 'technical-writer' | 'technical-writing-manager' | 'software-engineer' | 'software-engineering-manager';

interface JobInfo {
  url?: string;
  description: string;
  jobType: JobType;
  extractedDescription?: string;
}

interface CoverLetterGeneratorProps {
  jobInfo: JobInfo;
  onFinalize: (finalizedCoverLetter: string) => void;
  onBack: () => void;
}

export default function CoverLetterGenerator({ jobInfo, onFinalize, onBack }: CoverLetterGeneratorProps) {
  const [additionalContext, setAdditionalContext] = useState('');
  const [coverLetterDraft, setCoverLetterDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [iterations, setIterations] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<'context' | 'review' | 'finalize'>('context');
  const [viewMode, setViewMode] = useState<'rendered' | 'markdown'>('rendered');
  const [isEditing, setIsEditing] = useState(false);

  const generateCoverLetter = async (action: 'generate' | 'revise' = 'generate') => {
    setIsGenerating(true);
    try {
      // Create abort controller with 90 second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);

      const response = await fetch('/.netlify/functions/job-agent-cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('career_admin_token')}`
        },
        body: JSON.stringify({
          jobInfo,
          additionalContext: action === 'generate' ? additionalContext : feedback,
          action
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to generate cover letter');
      }

      const data = await response.json();
      setCoverLetterDraft(data.coverLetter);

      if (action === 'generate') {
        setIterations([data.coverLetter]);
        setCurrentStep('review');
      } else {
        setIterations(prev => [...prev, data.coverLetter]);
      }

      setFeedback('');
    } catch (error) {
      console.error('Cover letter generation error:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        alert('Request timed out after 90 seconds. The cover letter generation is taking longer than expected. Please try again or contact support.');
      } else {
        alert('Failed to generate cover letter. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateCoverLetter('generate');
  };

  const handleRevise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    generateCoverLetter('revise');
  };

  const handleFinalize = () => {
    onFinalize(coverLetterDraft);
  };

  const handleDirectEdit = (newContent: string) => {
    setCoverLetterDraft(newContent);
    setIterations(prev => [...prev, newContent]);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={onBack} className={styles.backButton}>
          ← Back to Resume
        </button>
        <h2>Cover Letter Generation</h2>
      </div>

      {jobInfo.url && (
        <div className={styles.jobContext}>
          <h3>Job Posting Context</h3>
          <div className={styles.jobUrl}>
            <strong>URL:</strong> <a href={jobInfo.url} target="_blank" rel="noopener noreferrer">{jobInfo.url}</a>
          </div>
          {jobInfo.description && (
            <details className={styles.jobDescription}>
              <summary>Job Description</summary>
              <div className={styles.descriptionContent}>
                {jobInfo.description}
              </div>
            </details>
          )}
        </div>
      )}

      {currentStep === 'context' && (
        <div className={styles.contextStep}>
          <div className={styles.prompt}>
            <h3>Cover Letter Preferences</h3>
            <p>
              I&apos;m ready to create a tailored cover letter based on your career data and the job requirements.
              Before I begin, please provide any specific preferences:
            </p>
            <ul>
              <li>Tone preferences (formal, conversational, enthusiastic, etc.)</li>
              <li>Specific experiences or achievements you want highlighted</li>
              <li>Company research or cultural fit points to emphasize</li>
              <li>Any information about the hiring manager or team</li>
              <li>Particular aspects of the role you&apos;re most excited about</li>
            </ul>
          </div>

          <form onSubmit={handleContextSubmit} className={styles.form}>
            <textarea
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="Provide any additional context or preferences for your cover letter (optional)..."
              rows={6}
              className={styles.textarea}
            />
            <button
              type="submit"
              disabled={isGenerating}
              className={styles.generateButton}
            >
              {isGenerating ? 'Generating Cover Letter...' : 'Generate Cover Letter'}
            </button>
          </form>
        </div>
      )}

      {currentStep === 'review' && (
        <div className={styles.reviewStep}>
          <div className={styles.splitView}>
            <div className={styles.previewPanel}>
              <div className={styles.previewHeader}>
                <h3>Cover Letter Preview</h3>
                <div className={styles.viewControls}>
                  <button
                    onClick={() => setViewMode('rendered')}
                    className={`${styles.viewButton} ${viewMode === 'rendered' ? styles.active : ''}`}
                  >
                    Rendered
                  </button>
                  <button
                    onClick={() => setViewMode('markdown')}
                    className={`${styles.viewButton} ${viewMode === 'markdown' ? styles.active : ''}`}
                  >
                    Markdown
                  </button>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`${styles.editButton} ${isEditing ? styles.active : ''}`}
                  >
                    {isEditing ? 'View' : 'Edit'}
                  </button>
                </div>
              </div>

              <div className={styles.coverLetterPreview}>
                {isEditing ? (
                  <textarea
                    value={coverLetterDraft}
                    onChange={(e) => handleDirectEdit(e.target.value)}
                    className={styles.markdownEditor}
                  />
                ) : viewMode === 'rendered' ? (
                  <div
                    className={styles.renderedContent}
                    dangerouslySetInnerHTML={{ __html: marked(coverLetterDraft) }}
                  />
                ) : (
                  <pre className={styles.markdownContent}>
                    {coverLetterDraft}
                  </pre>
                )}
              </div>
            </div>

            <div className={styles.controlsPanel}>
              <div className={styles.feedbackSection}>
                <h4>Feedback & Revisions</h4>
                <form onSubmit={handleRevise} className={styles.feedbackForm}>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide feedback for revisions (e.g., 'Make the tone more enthusiastic', 'Add more emphasis on technical leadership', etc.)"
                    rows={4}
                    className={styles.textarea}
                  />
                  <button
                    type="submit"
                    disabled={isGenerating || !feedback.trim()}
                    className={styles.reviseButton}
                  >
                    {isGenerating ? 'Revising...' : 'Revise Cover Letter'}
                  </button>
                </form>
              </div>

              <div className={styles.actions}>
                <button
                  onClick={handleFinalize}
                  className={styles.finalizeButton}
                >
                  Finalize Cover Letter
                </button>
              </div>

              {iterations.length > 1 && (
                <div className={styles.iterations}>
                  <h4>Previous Versions</h4>
                  <div className={styles.iterationList}>
                    {iterations.map((iteration, index) => (
                      <button
                        key={index}
                        onClick={() => setCoverLetterDraft(iteration)}
                        className={`${styles.iterationButton} ${
                          iteration === coverLetterDraft ? styles.active : ''
                        }`}
                      >
                        Version {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
