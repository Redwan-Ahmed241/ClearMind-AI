'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useChatContext } from '@/lib/ChatContext';

export default function EntityModal() {
  const { state, dispatch } = useChatContext();
  const { entityModalOpen, entityDetail } = state;
  const closeRef = useRef<HTMLButtonElement>(null);

  // Focus trap on open
  useEffect(() => {
    if (entityModalOpen) closeRef.current?.focus();
  }, [entityModalOpen]);

  // Escape to close
  useEffect(() => {
    if (!entityModalOpen) return;
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') dispatch({ type: 'CLOSE_ENTITY_MODAL' }); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [entityModalOpen, dispatch]);

  if (!entityModalOpen || !entityDetail) return null;

  const handleSearch = () => {
    const query = encodeURIComponent(`${entityDetail.value} history`);
    window.open(`https://www.google.com/search?q=${query}`, '_blank', 'noopener,noreferrer');
    dispatch({ type: 'CLOSE_ENTITY_MODAL' });
  };

  const content = (
    <>
      {/* Backdrop */}
      <div
        className="entity-modal-backdrop"
        onClick={() => dispatch({ type: 'CLOSE_ENTITY_MODAL' })}
        aria-hidden="true"
      />
      {/* Modal */}
      <div
        className="entity-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="entity-modal-title"
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                background: '#EDE7F6',
                color: '#5E35B1',
                fontSize: '10px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '6px',
                fontFamily: 'var(--font-dm-mono), monospace',
              }}
            >
              {entityDetail.type}
            </span>
            <span id="entity-modal-title" style={{ fontSize: '14px', fontWeight: 600 }}>
              {entityDetail.label}
            </span>
          </div>
          <button
            ref={closeRef}
            onClick={() => dispatch({ type: 'CLOSE_ENTITY_MODAL' })}
            aria-label="Close entity details"
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M2 2L8 8M8 2L2 8" stroke="var(--muted)" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Value */}
        <div
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: 'var(--text)',
            marginBottom: '12px',
            fontFamily: 'var(--font-dm-mono), monospace',
          }}
        >
          {entityDetail.value}
        </div>

        {/* Reason */}
        <div style={{ background: 'var(--bg)', borderRadius: '10px', padding: '12px', marginBottom: '14px' }}>
          <div
            style={{
              fontSize: '11px',
              color: 'var(--muted)',
              fontWeight: 600,
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Why this needs verification
          </div>
          <div style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--text)' }}>
            {entityDetail.reason}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleSearch}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid var(--accent)',
              background: 'var(--accent-light)',
              color: 'var(--accent)',
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
            aria-label={`Search for ${entityDetail.value} on Google`}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.1" />
            </svg>
            Search
          </button>
          <button
            onClick={() => dispatch({ type: 'CLOSE_ENTITY_MODAL' })}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text)',
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null;
}
