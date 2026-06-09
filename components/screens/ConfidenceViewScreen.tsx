'use client';

import { useChatContext } from '@/lib/ChatContext';
import { AIMessage, ConfidenceLevel } from '@/types/chat';
import ConfidencePanel from '@/components/ConfidencePanel';
import Toast from '@/components/Toast';

function confColors(level: ConfidenceLevel) {
  if (level === 'high') return { bg: 'var(--conf-high-bg)', color: 'var(--conf-high)', label: 'HIGH' };
  if (level === 'med')  return { bg: 'var(--conf-med-bg)',  color: 'var(--conf-med)',  label: 'MED' };
  return                       { bg: 'var(--conf-low-bg)',  color: 'var(--conf-low)',  label: 'LOW' };
}

export default function ConfidenceViewScreen() {
  const { state, dispatch } = useChatContext();

  // Collect all sentences from all AI messages
  const allSentences = state.messages
    .filter((m) => m.role === 'assistant')
    .flatMap((m) => (m as AIMessage).sentences.map((s) => ({ ...s, messageId: m.id })));

  const openDetail = (sentence: typeof allSentences[0]) => {
    dispatch({
      type: 'SET_ACTIVE_SENTENCE',
      payload: { sentenceId: sentence.id, messageId: sentence.messageId },
    });
    dispatch({
      type: 'OPEN_CONF_PANEL',
      payload: {
        sentenceId: sentence.id,
        claim: sentence.text,
        level: sentence.confidence,
        reasoning: sentence.confidence === 'high'
          ? 'This claim is well-established with broad scholarly consensus and strong primary source support.'
          : sentence.confidence === 'med'
          ? 'This claim is generally accepted but has some scholarly debate or nuance worth exploring.'
          : 'This claim is contested or debated among experts. Cross-referencing with external sources is strongly recommended.',
        sources: sentence.confidence === 'low'
          ? 'Consider checking academic databases, encyclopedias, or peer-reviewed publications for this claim.'
          : 'Multiple reliable sources support this claim.',
      },
    });
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto relative">

      {/* Top bar */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 20px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'chat' })}
            aria-label="Back to chat"
            style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M9 2L4 7L9 12" stroke="var(--text)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div style={{ fontSize: '14px', fontWeight: 600 }}>Confidence + Sources</div>
        </div>
        <button
          onClick={() => dispatch({ type: 'SET_VIEW', payload: 'doubt-log' })}
          style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '12px', fontWeight: 500, color: 'var(--text)', cursor: 'pointer' }}
        >
          Doubt Log →
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Tap a claim to inspect confidence
        </div>

        {allSentences.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: 'var(--muted)', textAlign: 'center' }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ marginBottom: '12px', opacity: 0.3 }} aria-hidden="true">
              <circle cx="20" cy="20" r="17" stroke="var(--muted)" strokeWidth="2" />
              <path d="M14 21L18 25L26 15" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>No AI responses yet</div>
            <div style={{ fontSize: '13px' }}>Go back to chat and ask a question</div>
          </div>
        ) : (
          <>
            {allSentences.map((sentence) => {
              const conf = confColors(sentence.confidence);
              const isLow = sentence.confidence === 'low';
              const flag = state.flags[sentence.id];
              return (
                <div
                  key={`${sentence.messageId}-${sentence.id}`}
                  onClick={() => openDetail(sentence)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Sentence with ${sentence.confidence} confidence. Click to inspect.`}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openDetail(sentence); }}
                  style={{
                    background: 'var(--surface)',
                    border: `${isLow ? '1.5px' : '1px'} solid ${isLow ? 'var(--conf-low)' : 'var(--border)'}`,
                    borderRadius: '12px',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseOver={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = isLow ? '#B71C1C' : 'var(--accent)'; }}
                  onMouseOut={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = isLow ? 'var(--conf-low)' : 'var(--border)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text)', flex: 1 }}>
                      {sentence.text.length > 120 ? sentence.text.slice(0, 120) + '…' : sentence.text}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                      <span className="conf-badge" style={{ background: conf.bg, color: conf.color }}>
                        {conf.label}
                      </span>
                      {flag && (
                        <span style={{ fontSize: '10px', color: flag.type === 'wrong' ? 'var(--doubt-red)' : 'var(--doubt-yellow)', fontWeight: 600 }}>
                          {flag.type === 'wrong' ? '✗ Flagged wrong' : '⚠ Flagged unsure'}
                        </span>
                      )}
                    </div>
                  </div>
                  {isLow && (
                    <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M6 1L7 4.5H11L8 6.5L9.5 10L6 8L2.5 10L4 6.5L1 4.5H5L6 1Z" fill="var(--conf-low)" opacity=".6" />
                      </svg>
                      <span style={{ fontSize: '11px', color: 'var(--conf-low)', fontWeight: 500 }}>
                        Historically contested — tap for details
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Quick action card */}
            <div style={{ background: 'var(--accent-light)', border: '1px solid #C0CCFF', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '12px', color: '#3D5AFE', fontWeight: 600, marginBottom: '8px' }}>
                Not sure about something but can't explain why?
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.6, marginBottom: '10px' }}>
                Use the doubt buttons to mark sentences for follow-up or verification.
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => { dispatch({ type: 'SHOW_TOAST', payload: '❓ Marked as "Maybe" — your uncertainty is noted' }); }}
                  style={{ padding: '6px 12px', borderRadius: '8px', border: '1.5px solid #3D5AFE', background: 'white', color: '#3D5AFE', fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Maybe ❓
                </button>
                <button
                  onClick={() => dispatch({ type: 'SET_VIEW', payload: 'chat' })}
                  style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', color: 'var(--muted)', fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '12px', cursor: 'pointer' }}
                >
                  Back to chat
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <ConfidencePanel />
      <Toast />
    </div>
  );
}
