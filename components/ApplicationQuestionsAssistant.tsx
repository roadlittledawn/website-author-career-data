'use client';

import { useState } from 'react';
import { marked } from 'marked';
import { jobAgentApi } from '../lib/api';
import styles from './ApplicationQuestionsAssistant.module.css';

type JobType = 'technical-writer' | 'technical-writing-manager' | 'software-engineer' | 'software-engineering-manager';

interface JobInfo {
  url?: string;
  description: string;
  jobType: JobType;
  extractedDescription?: string;
}

interface QuestionAnswer {
  question: string;
  answer: string;
  iterations: string[];
  isApproved: boolean;
}

interface ApplicationQuestionsAssistantProps {
  jobInfo: JobInfo;
  onComplete: (questions: Array<{ question: string; response: string; iterations: string[] }>) => void;
  onBack: () => void;
}

export default function ApplicationQuestionsAssistant({ jobInfo, onComplete, onBack }: ApplicationQuestionsAssistantProps) {
  const [questions, setQuestions] = useState<QuestionAnswer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [newQuestion, setNewQuestion] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'rendered' | 'plain'>('rendered');
  const [isEditing, setIsEditing] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const addQuestion = () => {
    if (!newQuestion.trim()) return;

    setQuestions(prev => [
      ...prev,
      {
        question: newQuestion.trim(),
        answer: '',
        iterations: [],
        isApproved: false
      }
    ]);
    setNewQuestion('');
  };

  const generateAnswer = async (action: 'generate' | 'revise' = 'generate') => {
    if (!currentQuestion) return;

    setIsGenerating(true);
    try {
      let result;

      if (action === 'generate') {
        result = await jobAgentApi.generateAnswer(
          jobInfo,
          currentQuestion.question,
          currentQuestion.answer || undefined
        );
      } else {
        result = await jobAgentApi.reviseAnswer(
          jobInfo,
          currentQuestion.question,
          currentQuestion.answer,
          feedback
        );
      }

      setQuestions(prev => prev.map((q, idx) => {
        if (idx === currentQuestionIndex) {
          return {
            ...q,
            answer: result.content,
            iterations: action === 'generate' ? [result.content] : [...q.iterations, result.content]
          };
        }
        return q;
      }));

      setFeedback('');
    } catch (error) {
      console.error('Answer generation error:', error);
      alert('Failed to generate answer. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = () => {
    setQuestions(prev => prev.map((q, idx) => {
      if (idx === currentQuestionIndex) {
        return { ...q, isApproved: true };
      }
      return q;
    }));

    // Move to next question or complete if this was the last one
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setFeedback('');
      setIsEditing(false);
    }
  };

  const handleDirectEdit = (newContent: string) => {
    setQuestions(prev => prev.map((q, idx) => {
      if (idx === currentQuestionIndex) {
        return {
          ...q,
          answer: newContent,
          iterations: [...q.iterations, newContent]
        };
      }
      return q;
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Answer copied to clipboard!');
  };

  const allQuestionsApproved = questions.length > 0 && questions.every(q => q.isApproved);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={onBack} className={styles.backButton}>
          ← Back to Cover Letter
        </button>
        <h2>Application Questions Assistant</h2>
      </div>

      <div className={styles.content}>
        {/* Question Input Section */}
        <div className={styles.addQuestionSection}>
          <h3>Add Application Questions</h3>
          <p>Enter questions from the job application one at a time. I&apos;ll help you craft tailored answers.</p>
          <div className={styles.questionInput}>
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Paste application question here..."
              rows={3}
              className={styles.textarea}
            />
            <button
              onClick={addQuestion}
              disabled={!newQuestion.trim()}
              className={styles.addButton}
            >
              Add Question
            </button>
          </div>
        </div>

        {/* Questions List */}
        {questions.length > 0 && (
          <div className={styles.questionsList}>
            <h3>Questions ({questions.filter(q => q.isApproved).length}/{questions.length} approved)</h3>
            <div className={styles.questionsNav}>
              {questions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentQuestionIndex(idx);
                    setFeedback('');
                    setIsEditing(false);
                  }}
                  className={`${styles.questionTab} ${
                    idx === currentQuestionIndex ? styles.active : ''
                  } ${q.isApproved ? styles.approved : ''}`}
                >
                  Q{idx + 1} {q.isApproved && '✓'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Current Question Workspace */}
        {currentQuestion && (
          <div className={styles.workspace}>
            <div className={styles.questionDisplay}>
              <h4>Question {currentQuestionIndex + 1}:</h4>
              <p className={styles.questionText}>{currentQuestion.question}</p>
            </div>

            {!currentQuestion.answer ? (
              <div className={styles.generateSection}>
                <p>Click generate to create a tailored answer based on your career data and the job requirements.</p>
                <button
                  onClick={() => generateAnswer('generate')}
                  disabled={isGenerating}
                  className={styles.generateButton}
                >
                  {isGenerating ? 'Generating Answer...' : 'Generate Answer'}
                </button>
              </div>
            ) : (
              <div className={styles.answerSection}>
                <div className={styles.answerHeader}>
                  <h4>Answer:</h4>
                  <div className={styles.controls}>
                    <button
                      onClick={() => setViewMode('rendered')}
                      className={`${styles.viewButton} ${viewMode === 'rendered' ? styles.active : ''}`}
                    >
                      Rendered
                    </button>
                    <button
                      onClick={() => setViewMode('plain')}
                      className={`${styles.viewButton} ${viewMode === 'plain' ? styles.active : ''}`}
                    >
                      Plain Text
                    </button>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`${styles.editButton} ${isEditing ? styles.active : ''}`}
                    >
                      {isEditing ? 'View' : 'Edit'}
                    </button>
                    <button
                      onClick={() => copyToClipboard(currentQuestion.answer)}
                      className={styles.copyButton}
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className={styles.answerDisplay}>
                  {isEditing ? (
                    <textarea
                      value={currentQuestion.answer}
                      onChange={(e) => handleDirectEdit(e.target.value)}
                      className={styles.answerEditor}
                      rows={10}
                    />
                  ) : viewMode === 'rendered' ? (
                    <div
                      className={styles.renderedContent}
                      dangerouslySetInnerHTML={{ __html: marked(currentQuestion.answer) }}
                    />
                  ) : (
                    <pre className={styles.plainContent}>
                      {currentQuestion.answer}
                    </pre>
                  )}
                </div>

                {!currentQuestion.isApproved && (
                  <div className={styles.feedbackSection}>
                    <h4>Revise Answer</h4>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Provide feedback for revisions (e.g., 'Make it more concise', 'Add more technical details', 'Emphasize leadership experience')"
                      rows={3}
                      className={styles.textarea}
                    />
                    <div className={styles.actionButtons}>
                      <button
                        onClick={() => generateAnswer('revise')}
                        disabled={isGenerating || !feedback.trim()}
                        className={styles.reviseButton}
                      >
                        {isGenerating ? 'Revising...' : 'Revise Answer'}
                      </button>
                      <button
                        onClick={handleApprove}
                        className={styles.approveButton}
                      >
                        Approve & Next
                      </button>
                    </div>
                  </div>
                )}

                {currentQuestion.isApproved && (
                  <div className={styles.approvedBanner}>
                    ✓ Answer approved! {currentQuestionIndex < questions.length - 1 ? 'Move to the next question above.' : 'All questions complete!'}
                  </div>
                )}

                {currentQuestion.iterations.length > 1 && (
                  <div className={styles.iterations}>
                    <h4>Previous Versions</h4>
                    <div className={styles.iterationList}>
                      {currentQuestion.iterations.map((iteration, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleDirectEdit(iteration)}
                          className={`${styles.iterationButton} ${
                            iteration === currentQuestion.answer ? styles.active : ''
                          }`}
                        >
                          Version {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Complete Button */}
        {allQuestionsApproved && (
          <div className={styles.completeSection}>
            <button
              onClick={() => onComplete(questions.map(q => ({
                question: q.question,
                response: q.answer,
                iterations: q.iterations
              })))}
              className={styles.completeButton}
            >
              Complete Application
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
