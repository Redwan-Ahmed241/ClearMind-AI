'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useChatContext } from '@/lib/ChatContext';
import { FlagType } from '@/types/chat';
import { AIMessage } from '@/types/chat';

interface TagPickerProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
}

export default function TagPicker({ isOpen, position, onClose }: TagPickerProps) {
  const { state, dispatch, triggerSelfAudit } = useChatContext();
  const pickerRef = useRef<HTMLDivElement>(null);

  const sentenceId = state.activeSentenceId;
  const hasFlag = sentenceId ? !!state.flags[sentenceId] : false;

  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handle), 10);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handle);
    };
  }, [isOpen, onClose]);

  // Keyboard: Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [isOpen, onClose]);

  if (!isOpen || !sentenceId) return null;

  const applyFlag = (type: FlagType | 'remove') => {
    if (!sentenceId) return;
    const messageId = state.activeMessageId;

    if (type === 'remove') {
      dispatch({ type: 'REMOVE_FLAG', payload: sentenceId });
      dispatch({ type: 'SHOW_TOAST', payload: 'Flag removed' });
    } else {
      // Find sentence text
      let sentenceText = sentenceId;
      if (messageId) {
        const msg = state.messages.find((m) => m.id === messageId);
        if (msg?.role === 'assistant') {
          const sentence = (msg as AIMessage).sentences.find((s) => s.id === sentenceId);
          if (sentence) sentenceText = sentence.text;
        }
      }
      dispatch({
        type: 'ADD_FLAG',
        payload: {
          sentenceId,
          messageId: messageId ?? '',
          text: sentenceText,
          type,
          flaggedAt: new Date(),
        },
      });
      dispatch({
        type: 'SHOW_TOAST',
        payload: type === 'unsure' ? '⚠️ Marked as uncertain' : '✗ Marked as possibly wrong',
      });
    }
    onClose();
  };

  const handleSelfAudit = async () => {
    onClose();
    const messageId = state.activeMessageId;
    let sentenceText = '';
    if (sentenceId && messageId) {
      const msg = state.messages.find((m) => m.id === messageId);
      if (msg?.role === 'assistant') {
        const sentence = (msg as AIMessage).sentences.find((s) => s.id === sentenceId);
        if (sentence) sentenceText = sentence.text;
      }
    }
    if (sentenceText) await triggerSelfAudit(sentenceText);
  };

  const handleCheckConf = () => {
    onClose();
    dispatch({ type: 'SET_VIEW', payload: 'confidence' });
  };

  const content = (
    <div
      ref={pickerRef}
      className="tag-picker"
      role="menu"
      aria-label="Flag sentence options"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div
        style={{
          padding: '4px 8px 6px',
          fontSize: '11px',
          color: 'var(--muted)',
          fontWeight: 500,
          borderBottom: '1px solid var(--border)',
          marginBottom: '2px',
        }}
      >
        Flag this sentence
      </div>

      <button className="tag-btn" role="menuitem" onClick={() => applyFlag('unsure')}>
        <span className="tag-dot" style={{ background: 'var(--doubt-yellow)' }} />
        Not sure about this
      </button>

      <button className="tag-btn" role="menuitem" onClick={() => applyFlag('wrong')}>
        <span className="tag-dot" style={{ background: 'var(--doubt-red)' }} />
        Seems wrong
      </button>

      <button className="tag-btn" role="menuitem" onClick={handleCheckConf}>
        <span className="tag-dot" style={{ background: 'var(--accent)' }} />
        Check confidence/sources
      </button>

      <div style={{ borderTop: '1px solid var(--border)', margin: '2px 0' }} />

      <button
        className="tag-btn"
        role="menuitem"
        onClick={handleSelfAudit}
        style={{ background: 'var(--accent-light)' }}
      >
        <span className="tag-dot" style={{ background: 'var(--accent)' }} />
        Ask AI to verify this
      </button>

      {hasFlag && (
        <button
          className="tag-btn"
          role="menuitem"
          onClick={() => applyFlag('remove')}
          style={{ color: 'var(--muted)' }}
        >
          <span className="tag-dot" style={{ background: 'var(--border)' }} />
          Remove flag
        </button>
      )}
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null;
}
