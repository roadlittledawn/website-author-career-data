'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './AIChatPanel.module.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  contextData: any;
  contextLabel: string;
  collection?: string;
}

export default function AIChatPanel({ isOpen, onClose, contextData, contextLabel, collection = 'projects' }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Get auth token
      const token = localStorage.getItem('career_admin_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Convert our message format to Claude API format
      const claudeMessages = newMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('/.netlify/functions/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: claudeMessages,
          context: {
            editingContext: {
              collection,
              roleType: 'technical_writer',
            },
            currentItem: contextData,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      const data = await response.json();
      setMessages(prev => [...prev, {
        role: 'assistant' as const,
        content: data.message.content
      }]);
    } catch (error) {
      console.error('AI request failed:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant' as const, content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Please try again.'}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <div>
            <h2>AI Writing Assistant</h2>
            <p className={styles.subtitle}>Context: {contextLabel}</p>
          </div>
          <button onClick={onClose} className={styles.closeBtn}>
            ×
          </button>
        </div>

        <div className={styles.contextSection}>
          <details>
            <summary>View Data Context</summary>
            <pre className={styles.contextData}>
              {JSON.stringify(contextData, null, 2)}
            </pre>
          </details>
        </div>

        <div className={styles.messagesContainer}>
          {messages.length === 0 && (
            <div className={styles.emptyState}>
              <p>👋 Hi! I can help you with:</p>
              <ul>
                <li>Writing compelling project descriptions</li>
                <li>Improving clarity and impact</li>
                <li>Suggesting keywords and technologies</li>
                <li>Refining your messaging</li>
              </ul>
              <p>Ask me anything about your project!</p>
            </div>
          )}

          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`${styles.message} ${styles[message.role]}`}
            >
              <div className={styles.messageLabel}>
                {message.role === 'user' ? 'You' : 'AI Assistant'}
              </div>
              <div className={styles.messageContent}>
                {message.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className={`${styles.message} ${styles.assistant}`}>
              <div className={styles.messageLabel}>AI Assistant</div>
              <div className={styles.messageContent}>
                <span className={styles.typing}>Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className={styles.inputArea}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask for help with your project... (Shift+Enter for new line)"
            rows={3}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className={styles.sendBtn}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
