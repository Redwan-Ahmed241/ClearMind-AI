'use client';

import { useEffect } from 'react';
import { useChatContext } from '@/lib/ChatContext';

export default function Toast() {
  const { state } = useChatContext();
  const { toast } = state;

  return (
    <div
      className={`toast${toast ? ' visible' : ''}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {toast?.msg ?? ''}
    </div>
  );
}
