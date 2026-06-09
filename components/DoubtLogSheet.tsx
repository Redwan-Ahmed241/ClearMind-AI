'use client';

import { useEffect } from 'react';
import { useChatContext } from '@/lib/ChatContext';
import { FlagEntry, AIMessage } from '@/types/chat';

export default function DoubtLogSheet() {
  const { state, dispatch } = useChatContext();
  const { doubtSheetOpen, flags } = state;
  const flagEntries = Object.values(flags);

  // Escape to close
  useEffect(() => {
    if (!doubtSheetOpen) return;
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') dispatch({ type: 'CLOSE_DOUBT_SHEET' }); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [doubtSheetOpen, dispatch]);

  return (
    <>
      {doubtSheetOpen && (
        <div
          onClick={() => dispatch({ type: 'CLOSE_DOUBT_SHEET' })}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.15)', zIndex: 399 }}
          aria-hidden="true"
        />
      )}

      <div
        className={`doubt-sheet${doubtSheetOpen ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Doubt log"
        aria-hidden={!doubtSheetOpen}
      >
        {/* Sheet header */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '13px', fontWeight: 600 }}>
            Doubt Log — <span>{flagEntries.length}</span> flag{flagEntries.length !== 1 ? 's' : ''}
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => { dispatch({ type: 'CLOSE_DOUBT_SHEET' }); dispatch({ type: 'SET_VIEW', payload: 'doubt-log' }); }}
              style={{
                padding: '5px 10px',
                borderRadius: '7px',
                border: '1px solid var(--border)',
                background: 'transparent',
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: '12px',
                cursor: 'pointer',
                color: 'var(--text)',
              }}
              aria-label="View full doubt log"
            >
              View all
            </button>
            <button
              onClick={() => dispatch({ type: 'CLOSE_DOUBT_SHEET' })}
              aria-label="Close doubt log"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 2L10 10M10 2L2 10" stroke="var(--text)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Sheet body */}
        <div style={{ overflowY: 'auto', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: 'calc(50vh - 52px)' }}>
          {flagEntries.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
              No flags yet — tap sentences in chat to flag them
            </div>
          ) : (
            flagEntries.map((f) => <SheetFlagItem key={f.sentenceId} entry={f} />)
          )}
        </div>
      </div>
    </>
  );
}

function SheetFlagItem({ entry }: { entry: FlagEntry }) {
  const { dispatch } = useChatContext();

  const isWrong = entry.type === 'wrong';
  const color = isWrong ? 'var(--doubt-red)' : 'var(--doubt-yellow)';
  const bg = isWrong ? 'var(--doubt-red-bg)' : 'var(--doubt-yellow-bg)';

  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${color}`,
        borderRadius: '8px',
        padding: '8px 10px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
      }}
      role="listitem"
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
          marginTop: '5px',
        }}
        aria-hidden="true"
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '12px', color: 'var(--text)', lineHeight: 1.5 }}>
          {entry.text.length > 80 ? entry.text.slice(0, 80) + '…' : entry.text}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
          {isWrong ? 'Seems wrong' : 'Not sure'}
        </div>
      </div>
      <button
        onClick={() => {
          dispatch({ type: 'REMOVE_FLAG', payload: entry.sentenceId });
          dispatch({ type: 'SHOW_TOAST', payload: 'Flag removed' });
        }}
        aria-label={`Remove flag from: ${entry.text.slice(0, 30)}`}
        style={{
          fontSize: '11px',
          color: 'var(--muted)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          flexShrink: 0,
          padding: '2px',
        }}
      >
        ✕
      </button>
    </div>
  );
}
