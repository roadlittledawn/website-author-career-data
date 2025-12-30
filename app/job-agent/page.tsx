'use client';

import { useState } from 'react';
import JobInfoForm from '../../components/JobInfoForm';
import ResumeGenerator from '../../components/ResumeGenerator';
import styles from './job-agent.module.css';

type JobType = 'technical-writer' | 'technical-writing-manager' | 'software-engineer' | 'software-engineering-manager';

interface JobAgentState {
  currentStep: 'job-info' | 'resume' | 'cover-letter' | 'questions' | 'summary';
  jobInfo: {
    url?: string;
    description: string;
    jobType: JobType;
    additionalContext?: string;
    extractedDescription?: string;
  };
  resume: {
    draft?: string;
    finalized?: string;
    iterations: string[];
  };
  coverLetter: {
    draft?: string;
    finalized?: string;
    iterations: string[];
  };
  questions: Array<{
    question: string;
    response: string;
    iterations: string[];
  }>;
}

export default function JobAgentPage() {
  const [state, setState] = useState<JobAgentState>({
    currentStep: 'job-info',
    jobInfo: {
      description: '',
      jobType: 'technical-writer'
    },
    resume: {
      iterations: []
    },
    coverLetter: {
      iterations: []
    },
    questions: []
  });

  const handleJobInfoSubmit = (jobInfo: { url?: string; description: string; jobType: JobType; extractedDescription?: string }) => {
    setState(prev => ({
      ...prev,
      jobInfo: {
        ...prev.jobInfo,
        ...jobInfo
      },
      currentStep: 'resume'
    }));
  };

  const handleResumeFinalize = (finalizedResume: string) => {
    setState(prev => ({
      ...prev,
      resume: {
        ...prev.resume,
        finalized: finalizedResume
      },
      currentStep: 'cover-letter'
    }));
  };

  const handleBackToJobInfo = () => {
    setState(prev => ({
      ...prev,
      currentStep: 'job-info'
    }));
  };

  return (
    <div className={styles.container}>
      <h1>Job Application Agent</h1>
      
      <div className={styles.progressBar}>
        <div className={`${styles.step} ${state.currentStep === 'job-info' ? styles.active : ''}`}>
          Job Info
        </div>
        <div className={`${styles.step} ${state.currentStep === 'resume' ? styles.active : ''}`}>
          Resume
        </div>
        <div className={`${styles.step} ${state.currentStep === 'cover-letter' ? styles.active : ''}`}>
          Cover Letter
        </div>
        <div className={`${styles.step} ${state.currentStep === 'questions' ? styles.active : ''}`}>
          Questions
        </div>
        <div className={`${styles.step} ${state.currentStep === 'summary' ? styles.active : ''}`}>
          Summary
        </div>
      </div>

      <div className={styles.content}>
        {state.currentStep === 'job-info' && (
          <JobInfoForm 
            onSubmit={handleJobInfoSubmit}
            initialData={state.jobInfo}
          />
        )}
        {state.currentStep === 'resume' && (
          <ResumeGenerator 
            jobInfo={state.jobInfo}
            onFinalize={handleResumeFinalize}
            onBack={handleBackToJobInfo}
          />
        )}
        {state.currentStep === 'cover-letter' && (
          <div>Cover Letter Generator - Coming Soon</div>
        )}
        {state.currentStep === 'questions' && (
          <div>Application Questions - Coming Soon</div>
        )}
        {state.currentStep === 'summary' && (
          <div>Summary - Coming Soon</div>
        )}
      </div>
    </div>
  );
}
