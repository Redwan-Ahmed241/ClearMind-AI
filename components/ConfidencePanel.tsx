'use client';

import { useEffect } from 'react';
import { useChatContext } from '@/lib/ChatContext';
import { AIMessage } from '@/types/chat';
import { ConfidenceLevel } from '@/types/chat';

function confColor(level: ConfidenceLevel) {
  if (level === 'high') return { bg: 'var(--conf-high-bg)', color: 'var(--conf-high)', bar: 'var(--conf-high)', width: '90%' };
  if (level === 'med') return { bg: 'var(--conf-med-bg)', color: 'var(--conf-med)', bar: 'var(--conf-med)', width: '55%' };
  return { bg: 'var(--conf-low-bg)', color: 'var(--conf-low)', bar: 'var(--conf-low)', width: '25%' };
}

export default function ConfidencePanel() {
  const { state, dispatch, triggerSelfAudit } = useChatContext();
  const { confPanelOpen, confDetail, activeSentenceId } = state;

  // Escape closes
  useEffect(() => {
    if (!confPanelOpen) return;
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') dispatch({ type: 'CLOSE_CONF_PANEL' }); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [confPanelOpen, dispatch]);

  const conf = confDetail ? confColor(confDetail.level) : confColor('high');

  const handleReAsk = () => {
    dispatch({ type: 'CLOSE_CONF_PANEL' });
    dispatch({ type: 'SET_VIEW', payload: 'chat' });
  };

  const handleSelfAudit = async () => {
    if (!confDetail) return;
    dispatch({ type: 'CLOSE_CONF_PANEL' });
    await triggerSelfAudit(confDetail.claim);
  };

  const handleWebSearch = () => {
    if (!confDetail) return;
    const query = encodeURIComponent(confDetail.claim + ' history');
    window.open(`https://www.google.com/search?q=${query}`, '_blank', 'noopener,noreferrer');
    dispatch({ type: 'CLOSE_CONF_PANEL' });
  };

  const handleFlagFromPanel = () => {
    if (!activeSentenceId) return;
    // Find sentence text
    let text = activeSentenceId;
    for (const m of state.messages) {
      if (m.role === 'assistant') {
        const s = (m as AIMessage).sentences.find((s) => s.id === activeSentenceId);
        if (s) { text = s.text; break; }
      }
    }
    dispatch({
      type: 'ADD_FLAG',
      payload: {
        sentenceId: activeSentenceId,
        messageId: state.activeMessageId ?? '',
        text,
        type: 'unsure',
        flaggedAt: new Date(),
      },
    });
    dispatch({ type: 'SHOW_TOAST', payload: '⚠️ Flagged from confidence panel' });
    dispatch({ type: 'CLOSE_CONF_PANEL' });
  };

  return (
    <>
      {/* Backdrop when panel open */}
      {confPanelOpen && (
        <div
          onClick={() => dispatch({ type: 'CLOSE_CONF_PANEL' })}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.15)', zIndex: 499 }}
          aria-hidden="true"
        />
      )}

      <div
        className={`conf-panel${confPanelOpen ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Claim confidence analysis"
        aria-hidden={!confPanelOpen}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 600 }}>Claim Analysis</div>
          <button
            onClick={() => dispatch({ type: 'CLOSE_CONF_PANEL' })}
            aria-label="Close confidence panel"
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

        {/* Body */}
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {confDetail ? (
            <>
              {/* Confidence level */}
              <div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 500, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Confidence level
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    className="conf-badge"
                    style={{ background: conf.bg, color: conf.color }}
                    aria-label={`Confidence: ${confDetail.level}`}
                  >
                    {confDetail.level.toUpperCase()}
                  </span>
                  <div style={{ flex: 1, height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        borderRadius: '99px',
                        background: conf.bar,
                        width: conf.width,
                        transition: 'width 0.4s',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Claim */}
              <div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 500, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Specific claim
                </div>
                <div style={{ fontSize: '13px', lineHeight: 1.6, background: 'var(--bg)', borderRadius: '8px', padding: '10px', color: 'var(--text)', fontStyle: 'italic' }}>
                  {confDetail.claim}
                </div>
              </div>

              {/* Reasoning */}
              <div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 500, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Why this confidence level
                </div>
                <div style={{ fontSize: '13px', lineHeight: 1.65, color: 'var(--text)' }}>
                  {confDetail.reasoning}
                </div>
              </div>

              {/* Sources */}
              {confDetail.sources && (
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 500, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Sources
                  </div>
                  <div style={{ fontSize: '12px', lineHeight: 1.6, color: 'var(--accent)', background: 'var(--accent-light)', borderRadius: '8px', padding: '10px' }}>
                    {confDetail.sources}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ color: 'var(--muted)', fontSize: '13px', textAlign: 'center', paddingTop: '40px' }}>
              Click a sentence or claim card to inspect it here.
            </div>
          )}
        </div>

        {/* Actions */}
        {confDetail && (
          <div style={{ padding: '16px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              onClick={handleReAsk}
              style={{
                padding: '9px',
                borderRadius: '8px',
                border: '1.5px solid var(--accent)',
                background: 'var(--accent-light)',
                color: 'var(--accent)',
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Re-ask this specifically
            </button>
            <button
              onClick={handleSelfAudit}
              style={{
                padding: '9px',
                borderRadius: '8px',
                border: '1.5px solid #5E35B1',
                background: '#EDE7F6',
                color: '#5E35B1',
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Ask AI to audit itself
            </button>
            <button
              onClick={handleWebSearch}
              style={{
                padding: '9px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text)',
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
              aria-label="Cross-reference claim on the web"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.3" />
              </svg>
              Cross-reference on Web
            </button>
            <button
              onClick={handleFlagFromPanel}
              style={{
                padding: '9px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text)',
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Flag as doubtful
            </button>
          </div>
        )}
      </div>
    </>
  );
}
