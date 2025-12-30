'use client';

import { useState } from 'react';
import { marked } from 'marked';
import styles from './ResumeGenerator.module.css';

type JobType = 'technical-writer' | 'technical-writing-manager' | 'software-engineer' | 'software-engineering-manager';

interface JobInfo {
  url?: string;
  description: string;
  jobType: JobType;
  extractedDescription?: string;
}

interface ResumeGeneratorProps {
  jobInfo: JobInfo;
  onFinalize: (finalizedResume: string) => void;
  onBack: () => void;
}

export default function ResumeGenerator({ jobInfo, onFinalize, onBack }: ResumeGeneratorProps) {
  const [additionalContext, setAdditionalContext] = useState('');
  const [resumeDraft, setResumeDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [iterations, setIterations] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<'context' | 'review' | 'finalize'>('context');
  const [viewMode, setViewMode] = useState<'rendered' | 'markdown'>('rendered');
  const [isEditing, setIsEditing] = useState(false);

  const generateResume = async (action: 'generate' | 'revise' = 'generate') => {
    setIsGenerating(true);
    try {
      const response = await fetch('/.netlify/functions/job-agent-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('career_admin_token')}`
        },
        body: JSON.stringify({
          jobInfo,
          additionalContext: action === 'generate' ? additionalContext : feedback,
          action
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate resume');
      }

      const data = await response.json();
      setResumeDraft(data.resume);
      
      if (action === 'generate') {
        setIterations([data.resume]);
        setCurrentStep('review');
      } else {
        setIterations(prev => [...prev, data.resume]);
      }
      
      setFeedback('');
    } catch (error) {
      console.error('Resume generation error:', error);
      alert('Failed to generate resume. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateResume('generate');
  };

  const handleRevise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    generateResume('revise');
  };

  const handleFinalize = () => {
    onFinalize(resumeDraft);
  };

  const handleDirectEdit = (newContent: string) => {
    setResumeDraft(newContent);
    setIterations(prev => [...prev, newContent]);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={onBack} className={styles.backButton}>
          ← Back to Job Info
        </button>
        <h2>Resume Generation</h2>
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
            <h3>Additional Context</h3>
            <p>
              I've analyzed your career data and the job requirements. Before I create your tailored resume, 
              are there any specific skills, experiences, projects, or achievements you'd like me to highlight 
              that might not be prominently featured? For example:
            </p>
            <ul>
              <li>Technical skills or tools you've used that match the job requirements</li>
              <li>Relevant projects or accomplishments from recent work</li>
              <li>Certifications or training you've completed</li>
              <li>Specific types of work that align with this role</li>
              <li>Cross-functional collaboration experiences</li>
              <li>Any quantifiable achievements that align with this position</li>
            </ul>
          </div>

          <form onSubmit={handleContextSubmit} className={styles.form}>
            <textarea
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="Provide any additional context or specific points you'd like incorporated (optional)..."
              rows={6}
              className={styles.textarea}
            />
            <button 
              type="submit" 
              disabled={isGenerating}
              className={styles.generateButton}
            >
              {isGenerating ? 'Generating Resume...' : 'Generate Resume'}
            </button>
          </form>
        </div>
      )}

      {currentStep === 'review' && (
        <div className={styles.reviewStep}>
          <div className={styles.splitView}>
            <div className={styles.previewPanel}>
              <div className={styles.previewHeader}>
                <h3>Resume Preview</h3>
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
              
              <div className={styles.resumePreview}>
                {isEditing ? (
                  <textarea
                    value={resumeDraft}
                    onChange={(e) => handleDirectEdit(e.target.value)}
                    className={styles.markdownEditor}
                  />
                ) : viewMode === 'rendered' ? (
                  <div 
                    className={styles.renderedContent}
                    dangerouslySetInnerHTML={{ __html: marked(resumeDraft) }}
                  />
                ) : (
                  <pre className={styles.markdownContent}>
                    {resumeDraft}
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
                    placeholder="Provide feedback for revisions (e.g., 'Emphasize API documentation experience more', 'Add more quantifiable metrics', etc.)"
                    rows={4}
                    className={styles.textarea}
                  />
                  <button 
                    type="submit" 
                    disabled={isGenerating || !feedback.trim()}
                    className={styles.reviseButton}
                  >
                    {isGenerating ? 'Revising...' : 'Revise Resume'}
                  </button>
                </form>
              </div>

              <div className={styles.actions}>
                <button 
                  onClick={handleFinalize}
                  className={styles.finalizeButton}
                >
                  Finalize Resume
                </button>
              </div>

              {iterations.length > 1 && (
                <div className={styles.iterations}>
                  <h4>Previous Versions</h4>
                  <div className={styles.iterationList}>
                    {iterations.map((iteration, index) => (
                      <button
                        key={index}
                        onClick={() => setResumeDraft(iteration)}
                        className={`${styles.iterationButton} ${
                          iteration === resumeDraft ? styles.active : ''
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
