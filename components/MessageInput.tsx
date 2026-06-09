'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useChatContext } from '@/lib/ChatContext';
import { useVoiceInput } from '@/hooks/useVoiceInput';

export default function MessageInput() {
  const { state, sendMessage } = useChatContext();
  const [text, setText] = useState('');
  const [mounted, setMounted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);
  const isLoading = state.isLoading;

  const { isListening, isSupported, transcript, error: voiceError, startListening, stopListening, clearTranscript } = useVoiceInput();

  useEffect(() => {
    if (!isListening && transcript) {
      setText((prev) => (prev + ' ' + transcript).trim());
      clearTranscript();
    }
  }, [isListening, transcript, clearTranscript]);

  const adjustHeight = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 100) + 'px';
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    adjustHeight();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    const val = text.trim();
    if (!val || isLoading) return;
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await sendMessage(val);
  };

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div
      style={{
        padding: '12px 16px',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        flexShrink: 0,
      }}
    >
      {/* Voice error message */}
      {voiceError && (
        <div
          style={{
            marginBottom: '8px',
            padding: '6px 10px',
            background: 'var(--doubt-red-bg)',
            color: 'var(--doubt-red)',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          role="alert"
        >
          {voiceError}
        </div>
      )}

      {/* Input row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '8px',
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '10px 12px',
        }}
      >
        <textarea
          ref={textareaRef}
          id="chat-input"
          className="chat-input"
          value={isListening && transcript ? `${text} ${transcript}`.trimStart() : text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Ask a follow-up or express your doubt..."
          aria-label="Type your message"
          aria-multiline="true"
          disabled={isLoading || isListening}
          style={{ opacity: isLoading || isListening ? 0.6 : 1 }}
        />

        {/* Voice button */}
        <div className="has-tooltip" style={{ position: 'relative', flexShrink: 0 }}>
          {mounted ? (
            <button
              type="button"
              onClick={toggleVoice}
              disabled={!isSupported}
              aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
              aria-pressed={isListening}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                border: isListening ? '1.5px solid var(--doubt-red)' : '1px solid var(--border)',
                background: isListening ? 'var(--doubt-red-bg)' : 'transparent',
                cursor: isSupported ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                opacity: isSupported ? 1 : 0.4,
                transition: 'all 0.15s',
              }}
              className={isListening ? 'voice-pulse' : ''}
            >
              {isListening ? (
                /* Stop/recording icon */
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <rect x="3" y="3" width="8" height="8" rx="1.5" fill="var(--doubt-red)" />
                </svg>
              ) : (
                /* Microphone icon */
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <rect x="4.5" y="1" width="5" height="7" rx="2.5" stroke={isSupported ? 'var(--muted)' : 'var(--border)'} strokeWidth="1.3" />
                  <path d="M2 7.5C2 10.537 4.239 13 7 13C9.761 13 12 10.537 12 7.5" stroke={isSupported ? 'var(--muted)' : 'var(--border)'} strokeWidth="1.3" strokeLinecap="round" />
                  <line x1="7" y1="13" x2="7" y2="14" stroke={isSupported ? 'var(--muted)' : 'var(--border)'} strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              )}
            </button>
          ) : (
            <button
              type="button"
              disabled
              aria-label="Start voice input"
              aria-pressed={false}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'transparent',
                cursor: 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                opacity: 0.4,
                transition: 'all 0.15s',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <rect x="4.5" y="1" width="5" height="7" rx="2.5" stroke="var(--border)" strokeWidth="1.3" />
                <path d="M2 7.5C2 10.537 4.239 13 7 13C9.761 13 12 10.537 12 7.5" stroke="var(--border)" strokeWidth="1.3" strokeLinecap="round" />
                <line x1="7" y1="13" x2="7" y2="14" stroke="var(--border)" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </button>
          )}
          <span className="tooltip">
            {!mounted ? 'Voice not supported in this browser' : !isSupported ? 'Voice not supported in this browser' : isListening ? 'Click to stop recording' : 'Click to speak'}
          </span>
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={isLoading || !text.trim()}
          aria-label="Send message"
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: isLoading || !text.trim() ? 'var(--border)' : 'var(--text)',
            border: 'none',
            cursor: isLoading || !text.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 0.15s',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 12L7 2L12 12L7 9.5L2 12Z" fill="white" />
          </svg>
        </button>
      </div>

      {/* Listening indicator */}
      {isListening && (
        <div
          style={{
            marginTop: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
          role="status"
          aria-live="polite"
          aria-label="Voice recording active"
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--doubt-red)', display: 'inline-block', animation: 'voicePulse 1.2s infinite' }} />
          <span style={{ fontSize: '12px', color: 'var(--doubt-red)', fontWeight: 500 }}>Listening… speak now</span>
        </div>
      )}

      {/* Footer hint */}
      <div style={{ fontSize: '11px', color: 'var(--muted)', textAlign: 'center', marginTop: '6px' }}>
        ClearMind may make mistakes — tap sentences to flag uncertainty
      </div>
    </div>
  );
}
