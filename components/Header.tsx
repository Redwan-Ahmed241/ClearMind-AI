'use client';

import { useChatContext } from '@/lib/ChatContext';

export default function Header() {
  const { state, dispatch } = useChatContext();
  const flagCount = Object.keys(state.flags).length;

  return (
    <div
      style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 20px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}
    >
      {/* Logo + Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            background: 'var(--text)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-hidden="true"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.5" />
            <path d="M5 8.5L7 10.5L11 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.2 }}>ClearMind AI</div>
          <div className="hidden sm:block" style={{ fontSize: '11px', color: 'var(--muted)' }}>Doubt-aware assistant</div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Prioritize Accuracy toggle */}
        <button
          id="honesty-toggle"
          onClick={() => dispatch({ type: 'TOGGLE_HONESTY' })}
          aria-pressed={state.honestyMode}
          aria-label="Toggle accuracy mode"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '8px',
            border: `1px solid ${state.honestyMode ? 'var(--conf-high)' : 'var(--border)'}`,
            background: state.honestyMode ? 'var(--conf-high-bg)' : 'var(--surface)',
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: '12px',
            fontWeight: 500,
            color: state.honestyMode ? 'var(--conf-high)' : 'var(--text)',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" />
            <path d="M7 4V7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <circle cx="7" cy="10" r="0.8" fill="currentColor" />
          </svg>
          <span className="hidden sm:inline">Prioritize Accuracy</span>
          {state.honestyMode && (
            <span
              style={{ width: '8px', height: '8px', background: 'var(--conf-high)', borderRadius: '50%' }}
              aria-label="Active"
            />
          )}
        </button>

        {/* Doubt Log button */}
        <button
          id="doubt-log-btn"
          onClick={() => dispatch({ type: 'TOGGLE_DOUBT_SHEET' })}
          aria-label={`Doubt log — ${flagCount} flag${flagCount !== 1 ? 's' : ''}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--text)',
            cursor: 'pointer',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 1L8.5 5H13L9.5 7.5L11 11.5L7 9L3 11.5L4.5 7.5L1 5H5.5L7 1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          </svg>
          <span className="hidden sm:inline">Doubt Log</span>
          {flagCount > 0 && (
            <span className="flag-count" aria-label={`${flagCount} flags`}>{flagCount}</span>
          )}
        </button>

        {/* Confidence view button */}
        <button
          onClick={() => dispatch({ type: 'SET_VIEW', payload: 'confidence' })}
          aria-label="Open confidence view"
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--text)',
            cursor: 'pointer',
          }}
        >
          <span className="hidden sm:inline">Confidence view →</span>
          <span className="inline sm:hidden">Conf →</span>
        </button>
      </div>
    </div>
  );
}
