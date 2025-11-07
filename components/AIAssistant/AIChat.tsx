'use client';

import { useState, useRef, useEffect } from 'react';
import { useAIContext } from '@/lib/hooks/useAIContext';
import type { AIContext, AIMessage, RoleType } from '@/lib/types';
import styles from './AIChat.module.css';

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  collection: string;
  itemId?: string;
  roleType: RoleType;
  field?: string;
}

export default function AIChat({
  isOpen,
  onClose,
  collection,
  itemId,
  roleType,
  field,
}: AIChatProps) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [context, setContext] = useState<AIContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { buildContext, isLoading: isLoadingContext } = useAIContext();

  // Build context when panel opens
  useEffect(() => {
    if (isOpen) {
      buildContext({ collection, itemId, roleType, field }).then((ctx) => {
        if (ctx) {
          setContext(ctx);
          setMessages([{
            role: 'system',
            content: `AI Writing Assistant ready! I have context about your ${collection} for ${roleType.replace(/_/g, ' ')} roles.`,
          }]);
        }
      });
    } else {
      // Reset when closed
      setMessages([]);
      setInput('');
      setContext(null);
    }
  }, [isOpen, collection, itemId, roleType, field, buildContext]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !context || isStreaming) return;

    const userMessage: AIMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    try {
      const response = await fetch('/.netlify/functions/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          messages: [...messages.filter(m => m.role !== 'system'), userMessage],
          context,
          options: { stream: false, maxTokens: 1000 },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: data.message.content,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'system',
          content: 'Error: Failed to get AI response. Please try again.',
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.panel}>
        <div className={styles.header}>
          <div className={styles.title}>
            <svg className={styles.icon} width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z"/>
            </svg>
            <h3>AI Writing Assistant</h3>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className={styles.context}>
          <span className={styles.contextIndicator}>
            📝 {collection} | 👤 {roleType.replace(/_/g, ' ')}
          </span>
        </div>

        <div className={styles.messages}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`${styles.message} ${styles[`message-${msg.role}`]}`}>
              <div className={styles.messageAvatar}>
                {msg.role === 'user' ? 'You' : msg.role === 'assistant' ? 'AI' : ''}
              </div>
              <div className={styles.messageContent}>
                <div className={styles.messageText}>{msg.content}</div>
                {msg.role === 'assistant' && (
                  <button
                    className={styles.copyBtn}
                    onClick={() => copyToClipboard(msg.content)}
                  >
                    Copy
                  </button>
                )}
              </div>
            </div>
          ))}
          {isStreaming && (
            <div className={styles.typing}>
              <span></span><span></span><span></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.inputContainer}>
          <textarea
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask AI to help you write..."
            rows={3}
            disabled={isStreaming || isLoadingContext}
          />
          <button
            className={styles.sendBtn}
            onClick={sendMessage}
            disabled={!input.trim() || isStreaming || isLoadingContext}
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}
