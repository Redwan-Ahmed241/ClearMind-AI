'use client';

import { useChatContext } from '@/lib/ChatContext';
import { FlagEntry, AIMessage } from '@/types/chat';
import Toast from '@/components/Toast';

export default function DoubtLogScreen() {
  const { state, dispatch, triggerSelfAudit } = useChatContext();
  const flagEntries = Object.values(state.flags);
  const wrongCount  = flagEntries.filter((f) => f.type === 'wrong').length;
  const unsureCount = flagEntries.filter((f) => f.type === 'unsure').length;

  const handleAuditAll = async () => {
    if (flagEntries.length === 0) {
      dispatch({ type: 'SHOW_TOAST', payload: 'No flags to audit' });
      return;
    }
    const combined = flagEntries
      .map((f) => `• ${f.type === 'wrong' ? 'Flagged as wrong' : 'Uncertain'}: "${f.text}"`)
      .join('\n');
    dispatch({ type: 'SET_VIEW', payload: 'chat' });
    await triggerSelfAudit(combined, true);
  };

  const handleReAskAll = () => {
    dispatch({ type: 'SET_VIEW', payload: 'chat' });
    dispatch({ type: 'SHOW_TOAST', payload: 'Switched to chat — type your follow-up question' });
  };

  const handleClearAll = () => {
    dispatch({ type: 'CLEAR_FLAGS' });
    dispatch({ type: 'SHOW_TOAST', payload: 'All flags cleared' });
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto relative">
      {/* Top bar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'chat' })}
            aria-label="Back to chat"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M9 2L4 7L9 12" stroke="var(--text)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>Doubt Log</div>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
              {flagEntries.length === 0 ? 'All flags from this session' : `${flagEntries.length} flag${flagEntries.length !== 1 ? 's' : ''} this session`}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {flagEntries.length > 0 && (
            <>
              <button
                onClick={handleAuditAll}
                aria-label="Ask AI to audit all flagged claims"
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--accent)',
                  background: 'var(--accent-light)',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--accent)',
                  cursor: 'pointer',
                }}
              >
                Audit All Flags
              </button>
              <button
                onClick={handleClearAll}
                aria-label="Clear all flags"
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--conf-low)',
                  cursor: 'pointer',
                }}
              >
                Clear all
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          padding: '12px 20px',
          display: 'flex',
          gap: '16px',
          flexShrink: 0,
        }}
        role="region"
        aria-label="Flag statistics"
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '22px',
              fontWeight: 600,
              fontFamily: 'var(--font-dm-mono), monospace',
            }}
            aria-label={`${flagEntries.length} total flagged`}
          >
            {flagEntries.length}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Flagged</div>
        </div>

        <div style={{ width: '1px', background: 'var(--border)' }} aria-hidden="true" />

        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '22px',
              fontWeight: 600,
              fontFamily: 'var(--font-dm-mono), monospace',
              color: 'var(--doubt-red)',
            }}
            aria-label={`${wrongCount} marked as wrong`}
          >
            {wrongCount}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Seems wrong</div>
        </div>

        <div style={{ width: '1px', background: 'var(--border)' }} aria-hidden="true" />

        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '22px',
              fontWeight: 600,
              fontFamily: 'var(--font-dm-mono), monospace',
              color: 'var(--doubt-yellow)',
            }}
            aria-label={`${unsureCount} marked as unsure`}
          >
            {unsureCount}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Not sure</div>
        </div>

        <div style={{ flex: 1 }} />

        <button
          onClick={handleReAskAll}
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            border: 'none',
            background: 'var(--text)',
            color: 'white',
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            alignSelf: 'center',
          }}
          aria-label="Go to chat to re-ask flagged questions"
        >
          Re-ask all →
        </button>
      </div>

      {/* Flag list */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
        role="list"
        aria-label="Flagged sentences"
      >
        {flagEntries.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 20px',
              color: 'var(--muted)',
              textAlign: 'center',
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              style={{ marginBottom: '12px', opacity: 0.3 }}
              aria-hidden="true"
            >
              <circle cx="20" cy="20" r="17" stroke="var(--muted)" strokeWidth="2" />
              <path d="M14 21L18 25L26 15" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>No doubts flagged yet</div>
            <div style={{ fontSize: '13px' }}>Go back to chat and tap sentences you're unsure about</div>
          </div>
        ) : (
          flagEntries.map((entry) => (
            <DoubtLogItem
              key={entry.sentenceId}
              entry={entry}
              onRemove={() => {
                dispatch({ type: 'REMOVE_FLAG', payload: entry.sentenceId });
                dispatch({ type: 'SHOW_TOAST', payload: 'Flag removed' });
              }}
              onAudit={async () => {
                dispatch({ type: 'SET_VIEW', payload: 'chat' });
                await triggerSelfAudit(entry.text);
              }}
            />
          ))
        )}
      </div>

      <Toast />
    </div>
  );
}

function DoubtLogItem({
  entry,
  onRemove,
  onAudit,
}: {
  entry: FlagEntry;
  onRemove: () => void;
  onAudit: () => void;
}) {
  const isWrong = entry.type === 'wrong';
  const dotColor = isWrong ? 'var(--doubt-red)' : 'var(--doubt-yellow)';

  return (
    <div
      role="listitem"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
      }}
    >
      {/* Dot */}
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: dotColor,
          flexShrink: 0,
          marginTop: '5px',
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text)', marginBottom: '4px' }}>
          {entry.text}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: isWrong ? 'var(--doubt-red)' : 'var(--doubt-yellow)',
              background: isWrong ? 'var(--doubt-red-bg)' : 'var(--doubt-yellow-bg)',
              padding: '1px 6px',
              borderRadius: '4px',
            }}
          >
            {isWrong ? 'Seems wrong' : 'Not sure'}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
            {new Date(entry.flaggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
        <button
          onClick={onAudit}
          aria-label={`Ask AI to audit: ${entry.text.slice(0, 30)}`}
          style={{
            padding: '4px 8px',
            borderRadius: '6px',
            border: '1px solid var(--accent)',
            background: 'var(--accent-light)',
            color: 'var(--accent)',
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          Audit
        </button>
        <button
          onClick={onRemove}
          aria-label={`Remove flag from: ${entry.text.slice(0, 30)}`}
          style={{
            padding: '4px 8px',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--muted)',
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
