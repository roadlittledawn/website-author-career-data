'use client';

import { useState } from 'react';
import AIChat from './AIChat';
import type { RoleType } from '@/lib/types';
import styles from './AIButton.module.css';

interface AIButtonProps {
  collection: string;
  itemId?: string;
  roleType: RoleType;
  field?: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export default function AIButton({
  collection,
  itemId,
  roleType,
  field,
  variant = 'primary',
  size = 'md',
}: AIButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={`${styles.button} ${styles[variant]} ${styles[size]}`}
        onClick={() => setIsOpen(true)}
      >
        <svg className={styles.icon} width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z"/>
        </svg>
        Ask AI
      </button>

      <AIChat
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        collection={collection}
        itemId={itemId}
        roleType={roleType}
        field={field}
      />
    </>
  );
}
