'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './resume-view.module.css';

export default function ResumeViewPage() {
  const searchParams = useSearchParams();
  const [resumeContent, setResumeContent] = useState('');

  useEffect(() => {
    // In a real implementation, you'd fetch the resume content
    // For now, we'll get it from URL params or localStorage
    const content = searchParams.get('content') || localStorage.getItem('finalizedResume') || '';
    setResumeContent(content);
  }, [searchParams]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const blob = new Blob([resumeContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tailored-resume.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <button onClick={handlePrint} className={styles.printButton}>
          🖨️ Print to PDF
        </button>
        <button onClick={handleDownload} className={styles.downloadButton}>
          📄 Download Markdown
        </button>
      </div>
      
      <div className={styles.resumeContent}>
        <div 
          className={styles.markdownContent}
          dangerouslySetInnerHTML={{ 
            __html: resumeContent
              .replace(/\n/g, '<br>')
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/^# (.*$)/gm, '<h1>$1</h1>')
              .replace(/^## (.*$)/gm, '<h2>$1</h2>')
              .replace(/^### (.*$)/gm, '<h3>$1</h3>')
              .replace(/^- (.*$)/gm, '<li>$1</li>')
          }}
        />
      </div>
    </div>
  );
}
