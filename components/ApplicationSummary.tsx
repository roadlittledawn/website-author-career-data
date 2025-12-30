'use client';

import { useState } from 'react';
import { marked } from 'marked';
import styles from './ApplicationSummary.module.css';

type JobType = 'technical-writer' | 'technical-writing-manager' | 'software-engineer' | 'software-engineering-manager';

interface JobInfo {
  url?: string;
  description: string;
  jobType: JobType;
  extractedDescription?: string;
}

interface Resume {
  draft?: string;
  finalized?: string;
  iterations: string[];
}

interface CoverLetter {
  draft?: string;
  finalized?: string;
  iterations: string[];
}

interface Question {
  question: string;
  response: string;
  iterations: string[];
}

interface ApplicationSummaryProps {
  jobInfo: JobInfo;
  resume: Resume;
  coverLetter: CoverLetter;
  questions: Question[];
  onBack: () => void;
  onStartNew: () => void;
}

export default function ApplicationSummary({
  jobInfo,
  resume,
  coverLetter,
  questions,
  onBack,
  onStartNew
}: ApplicationSummaryProps) {
  const [expandedSections, setExpandedSections] = useState({
    jobInfo: true,
    resume: true,
    coverLetter: true,
    questions: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  const downloadAsMarkdown = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    const jobTypeLabel = jobInfo.jobType.replace(/-/g, ' ').split(' ').map(w =>
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join('-');
    const timestamp = new Date().toISOString().split('T')[0];

    let content = `# Job Application Materials\n\n`;
    content += `**Position Type:** ${jobInfo.jobType.replace(/-/g, ' ')}\n`;
    content += `**Date:** ${new Date().toLocaleDateString()}\n`;
    if (jobInfo.url) {
      content += `**Job URL:** ${jobInfo.url}\n`;
    }
    content += `\n---\n\n`;

    if (resume.finalized) {
      content += `# Resume\n\n${resume.finalized}\n\n---\n\n`;
    }

    if (coverLetter.finalized) {
      content += `# Cover Letter\n\n${coverLetter.finalized}\n\n---\n\n`;
    }

    if (questions.length > 0) {
      content += `# Application Questions & Answers\n\n`;
      questions.forEach((q, idx) => {
        content += `## Question ${idx + 1}\n\n`;
        content += `**Q:** ${q.question}\n\n`;
        content += `**A:** ${q.response}\n\n`;
        content += `---\n\n`;
      });
    }

    downloadAsMarkdown(content, `job-application-${jobTypeLabel}-${timestamp}.md`);
  };

  const printPage = () => {
    window.print();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={onBack} className={styles.backButton}>
          ← Back to Questions
        </button>
        <h2>Application Summary</h2>
      </div>

      <div className={styles.actions}>
        <button onClick={downloadAll} className={styles.actionButton}>
          📥 Download All (Markdown)
        </button>
        <button onClick={printPage} className={styles.actionButton}>
          🖨️ Print
        </button>
        <button onClick={onStartNew} className={styles.actionButton}>
          ✨ Start New Application
        </button>
      </div>

      <div className={styles.summary}>
        {/* Job Information Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader} onClick={() => toggleSection('jobInfo')}>
            <h3>📋 Job Information</h3>
            <span className={styles.toggle}>{expandedSections.jobInfo ? '−' : '+'}</span>
          </div>
          {expandedSections.jobInfo && (
            <div className={styles.sectionContent}>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <strong>Position Type:</strong>
                  <span>{jobInfo.jobType.replace(/-/g, ' ')}</span>
                </div>
                {jobInfo.url && (
                  <div className={styles.infoItem}>
                    <strong>Job URL:</strong>
                    <a href={jobInfo.url} target="_blank" rel="noopener noreferrer" className={styles.link}>
                      {jobInfo.url}
                    </a>
                  </div>
                )}
              </div>
              {jobInfo.description && (
                <details className={styles.details}>
                  <summary>View Job Description</summary>
                  <div className={styles.descriptionContent}>
                    {jobInfo.description}
                  </div>
                </details>
              )}
            </div>
          )}
        </section>

        {/* Resume Section */}
        {resume.finalized && (
          <section className={styles.section}>
            <div className={styles.sectionHeader} onClick={() => toggleSection('resume')}>
              <h3>📄 Resume</h3>
              <span className={styles.toggle}>{expandedSections.resume ? '−' : '+'}</span>
            </div>
            {expandedSections.resume && (
              <div className={styles.sectionContent}>
                <div className={styles.contentActions}>
                  <button
                    onClick={() => copyToClipboard(resume.finalized!, 'Resume')}
                    className={styles.copyButton}
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => downloadAsMarkdown(resume.finalized!, 'resume.md')}
                    className={styles.downloadButton}
                  >
                    Download
                  </button>
                </div>
                <div
                  className={styles.content}
                  dangerouslySetInnerHTML={{ __html: marked(resume.finalized) }}
                />
              </div>
            )}
          </section>
        )}

        {/* Cover Letter Section */}
        {coverLetter.finalized && (
          <section className={styles.section}>
            <div className={styles.sectionHeader} onClick={() => toggleSection('coverLetter')}>
              <h3>✉️ Cover Letter</h3>
              <span className={styles.toggle}>{expandedSections.coverLetter ? '−' : '+'}</span>
            </div>
            {expandedSections.coverLetter && (
              <div className={styles.sectionContent}>
                <div className={styles.contentActions}>
                  <button
                    onClick={() => copyToClipboard(coverLetter.finalized!, 'Cover Letter')}
                    className={styles.copyButton}
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => downloadAsMarkdown(coverLetter.finalized!, 'cover-letter.md')}
                    className={styles.downloadButton}
                  >
                    Download
                  </button>
                </div>
                <div
                  className={styles.content}
                  dangerouslySetInnerHTML={{ __html: marked(coverLetter.finalized) }}
                />
              </div>
            )}
          </section>
        )}

        {/* Application Questions Section */}
        {questions.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader} onClick={() => toggleSection('questions')}>
              <h3>❓ Application Questions ({questions.length})</h3>
              <span className={styles.toggle}>{expandedSections.questions ? '−' : '+'}</span>
            </div>
            {expandedSections.questions && (
              <div className={styles.sectionContent}>
                {questions.map((q, idx) => (
                  <div key={idx} className={styles.questionItem}>
                    <div className={styles.questionHeader}>
                      <h4>Question {idx + 1}</h4>
                      <button
                        onClick={() => copyToClipboard(q.response, `Answer ${idx + 1}`)}
                        className={styles.copyButton}
                      >
                        Copy Answer
                      </button>
                    </div>
                    <div className={styles.questionText}>
                      <strong>Q:</strong> {q.question}
                    </div>
                    <div className={styles.answerText}>
                      <strong>A:</strong>
                      <div
                        className={styles.answerContent}
                        dangerouslySetInnerHTML={{ __html: marked(q.response) }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Completion Message */}
      <div className={styles.completionMessage}>
        <h3>🎉 Application Materials Complete!</h3>
        <p>
          All your application materials have been generated and are ready to use.
          You can copy individual sections, download them, or print this page for reference.
        </p>
        <p className={styles.tip}>
          <strong>Tip:</strong> Review each section carefully before submitting your application.
          Make sure all information is accurate and tailored to the specific role.
        </p>
      </div>
    </div>
  );
}
