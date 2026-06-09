'use client';

export default function TypingIndicator() {
  return (
    <div
      className="msg-row"
      style={{ display: 'flex', gap: '10px', alignItems: 'center' }}
      role="status"
      aria-label="ClearMind AI is typing"
      aria-live="polite"
    >
      {/* Avatar */}
      <div
        style={{
          width: '32px',
          height: '32px',
          background: 'var(--text)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.5" />
          <path d="M5 8.5L7 10.5L11 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Dots */}
      <div
        className="msg-ai"
        style={{
          padding: '12px 16px',
          borderRadius: '4px 16px 16px 16px',
          display: 'flex',
          gap: '5px',
          alignItems: 'center',
        }}
      >
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
    </div>
  );
}
