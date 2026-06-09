'use client';

import { Message, AIMessage, UserMessage } from '@/types/chat';
import { useChatContext } from '@/lib/ChatContext';
import AISentence from './AISentence';

interface ChatMessageProps {
  message: Message;
  onOpenTagPicker: (e: React.MouseEvent, sentenceId: string, messageId: string) => void;
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function UserMessageBubble({ message }: { message: UserMessage }) {
  return (
    <div
      className="msg-row"
      style={{ display: 'flex', justifyContent: 'flex-end' }}
      role="article"
      aria-label={`You said: ${message.text}`}
    >
      <div
        className="msg-user"
        style={{ padding: '10px 16px', maxWidth: '72%', fontSize: '14px', lineHeight: 1.6 }}
        title={formatTime(message.timestamp)}
      >
        {message.text}
      </div>
    </div>
  );
}

export function AIMessageBubble({ message, onOpenTagPicker }: { message: AIMessage; onOpenTagPicker: (e: React.MouseEvent, sentenceId: string, messageId: string) => void }) {
  const { state, dispatch } = useChatContext();

  return (
    <div
      className="msg-row"
      style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}
      role="article"
      aria-label="ClearMind AI response"
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
          marginTop: '2px',
        }}
        aria-hidden="true"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.5" />
          <path d="M5 8.5L7 10.5L11 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Bubble */}
      <div
        className="msg-ai"
        style={{
          padding: '14px 16px',
          borderRadius: '4px 16px 16px 16px',
          maxWidth: '84%',
          flex: 1,
        }}
      >
        {/* Header row */}
        <div
          style={{
            fontSize: '13px',
            color: 'var(--muted)',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexWrap: 'wrap',
          }}
        >
          <span>ClearMind AI</span>
          <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--border)', display: 'inline-block' }} />
          {state.honestyMode && (
            <>
              <span
                style={{
                  background: 'var(--conf-high-bg)',
                  color: 'var(--conf-high)',
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 600,
                }}
                aria-label="Accuracy mode is active"
              >
                ACCURACY MODE
              </span>
              <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--border)', display: 'inline-block' }} />
            </>
          )}
          <span style={{ fontSize: '11px' }}>Tap any sentence to flag doubt</span>
          <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--muted)' }}>
            {formatTime(message.timestamp)}
          </span>
        </div>

        {/* Sentences */}
        <div
          style={{ fontSize: '14px', lineHeight: 1.75, color: 'var(--text)' }}
          aria-live="polite"
        >
          {message.sentences.map((sentence) => (
            <AISentence
              key={sentence.id}
              sentence={sentence}
              messageId={message.id}
              onOpenTagPicker={onOpenTagPicker}
            />
          ))}
        </div>

        {/* Actions Row */}
        <div
          style={{
            marginTop: '12px',
            paddingTop: '10px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          {message.sentences.some((s) => s.confidence !== 'high') && (
            <>
              <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 500 }}>Confidence:</span>
              {message.sentences.some((s) => s.confidence === 'low') && (
                <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '12px', height: '2px', borderBottom: '2px dotted var(--conf-low)', display: 'inline-block' }} />
                  <span style={{ color: 'var(--conf-low)' }}>Low</span>
                </span>
              )}
              {message.sentences.some((s) => s.confidence === 'med') && (
                <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '12px', height: '2px', borderBottom: '2px dotted var(--conf-med)', display: 'inline-block' }} />
                  <span style={{ color: 'var(--conf-med)' }}>Medium</span>
                </span>
              )}
            </>
          )}

          <span style={{ flex: 1 }} />

          {/* Google Search Button */}
          <button
            onClick={() => {
              const lastUserMessage = state.messages
                .slice()
                .reverse()
                .find((m) => m.role === 'user');
              const query = encodeURIComponent(
                lastUserMessage && lastUserMessage.role === 'user' ? lastUserMessage.text : "ClearMind AI"
              );
              window.open(`https://www.google.com/search?q=${query}`, '_blank', 'noopener,noreferrer');
            }}
            style={{
              fontSize: '11px',
              color: 'var(--muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontWeight: 500,
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            aria-label="Search this query on Google"
          >
            Google Search 🔍
          </button>

          {message.sentences.some((s) => s.confidence !== 'high') && (
            <button
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'confidence' })}
              style={{
                fontSize: '11px',
                color: 'var(--accent)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontWeight: 500,
                padding: 0,
              }}
              aria-label="View sources and confidence details"
            >
              View sources →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatMessageComponent({ message, onOpenTagPicker }: ChatMessageProps) {
  if (message.role === 'user') return <UserMessageBubble message={message as UserMessage} />;
  return <AIMessageBubble message={message as AIMessage} onOpenTagPicker={onOpenTagPicker} />;
}
