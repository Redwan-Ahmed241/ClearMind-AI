'use client';

export default function HintBar() {
  return (
    <div
      style={{
        padding: '8px 20px',
        background: 'var(--accent-light)',
        borderTop: '1px solid #D0D8FF',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexShrink: 0,
      }}
      role="note"
      aria-label="Usage hint"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="5.5" stroke="#3D5AFE" strokeWidth="1.3" />
        <path d="M7 6V9" stroke="#3D5AFE" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="7" cy="4.5" r="0.6" fill="#3D5AFE" />
      </svg>
      <span style={{ fontSize: '12px', color: '#3D5AFE', fontWeight: 500 }}>
        Tap any underlined sentence to flag it as doubtful — dotted underline = AI is less confident
      </span>
    </div>
  );
}
