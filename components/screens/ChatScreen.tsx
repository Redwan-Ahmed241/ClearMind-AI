'use client';

import { useState, useCallback } from 'react';
import { useChatContext } from '@/lib/ChatContext';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import Header from '@/components/Header';
import ChatMessageComponent from '@/components/ChatMessage';
import TypingIndicator from '@/components/TypingIndicator';
import TagPicker from '@/components/TagPicker';
import HintBar from '@/components/HintBar';
import MessageInput from '@/components/MessageInput';
import ConfidencePanel from '@/components/ConfidencePanel';
import DoubtLogSheet from '@/components/DoubtLogSheet';
import EntityModal from '@/components/EntityModal';
import Toast from '@/components/Toast';
import { AIMessage } from '@/types/chat';
import Image from 'next/image';

interface TagPickerState {
  isOpen: boolean;
  position: { x: number; y: number };
}

export default function ChatScreen() {
  const { state, dispatch } = useChatContext();
  const { messages, isLoading } = state;

  const [tagPicker, setTagPicker] = useState<TagPickerState>({
    isOpen: false,
    position: { x: 0, y: 0 },
  });

  const scrollRef = useAutoScroll([messages.length, isLoading]);

  const openTagPicker = useCallback((e: React.MouseEvent, sentenceId: string, messageId: string) => {
    e.stopPropagation();
    dispatch({ type: 'SET_ACTIVE_SENTENCE', payload: { sentenceId, messageId } });

    const pickerW = 190;
    const pickerH = 200;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    let x = rect.left;
    let y = rect.bottom + 6;

    if (x + pickerW > window.innerWidth - 8) x = window.innerWidth - pickerW - 8;
    if (y + pickerH > window.innerHeight) y = rect.top - pickerH;

    setTagPicker({ isOpen: true, position: { x, y } });
  }, [dispatch]);

  const closeTagPicker = useCallback(() => {
    setTagPicker((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const hasAnyAIMessage = messages.some((m) => m.role === 'assistant');

  return (
    <div
      className="flex flex-col h-screen w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto relative"
    >
      <Header />

      {/* Messages area */}
      <div
        ref={scrollRef}
        id="chat-messages"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {/* Empty state */}
        {messages.length === 0 && !isLoading && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '60px 20px',
              color: 'var(--muted)',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              }}
            >
              <Image src="/logo.png" alt="ClearMind AI Logo" width={48} height={48} style={{ objectFit: 'cover' }} priority />
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
              Ask ClearMind AI anything
            </div>
            <div style={{ fontSize: '13px', maxWidth: '300px', lineHeight: 1.6 }}>
              Every response shows confidence levels per sentence. Tap any sentence to flag doubt.
            </div>
          </div>
        )}

        {/* Message list */}
        {messages.map((message) => (
          <ChatMessageComponent
            key={message.id}
            message={message}
            onOpenTagPicker={openTagPicker}
          />
        ))}

        {/* Typing indicator */}
        {isLoading && <TypingIndicator />}
      </div>

      {/* Hint bar — only after first AI message */}
      {hasAnyAIMessage && <HintBar />}

      {/* Input */}
      <MessageInput />

      {/* Overlays */}
      <TagPicker
        isOpen={tagPicker.isOpen}
        position={tagPicker.position}
        onClose={closeTagPicker}
      />
      <ConfidencePanel />
      <DoubtLogSheet />
      <EntityModal />
      <Toast />
    </div>
  );
}
