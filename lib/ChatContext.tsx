'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { Message, FlagEntry, FlagType, ViewType, AIMessage, UserMessage, ConfidenceDetail } from '@/types/chat';

// ─── State ───────────────────────────────────────────────────────────────────

interface ChatState {
  messages: Message[];
  flags: Record<string, FlagEntry>; // keyed by sentenceId
  currentView: ViewType;
  honestyMode: boolean;
  isLoading: boolean;
  activeSentenceId: string | null;
  activeMessageId: string | null;
  confPanelOpen: boolean;
  confDetail: ConfidenceDetail | null;
  doubtSheetOpen: boolean;
  entityModalOpen: boolean;
  entityDetail: { value: string; type: string; label: string; reason: string } | null;
  toast: { msg: string; id: number } | null;
}

type Action =
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_VIEW'; payload: ViewType }
  | { type: 'TOGGLE_HONESTY' }
  | { type: 'SET_ACTIVE_SENTENCE'; payload: { sentenceId: string | null; messageId: string | null } }
  | { type: 'ADD_FLAG'; payload: FlagEntry }
  | { type: 'REMOVE_FLAG'; payload: string }
  | { type: 'CLEAR_FLAGS' }
  | { type: 'OPEN_CONF_PANEL'; payload: ConfidenceDetail }
  | { type: 'CLOSE_CONF_PANEL' }
  | { type: 'TOGGLE_DOUBT_SHEET' }
  | { type: 'CLOSE_DOUBT_SHEET' }
  | { type: 'OPEN_ENTITY_MODAL'; payload: { value: string; type: string; label: string; reason: string } }
  | { type: 'CLOSE_ENTITY_MODAL' }
  | { type: 'SHOW_TOAST'; payload: string }
  | { type: 'CLEAR_TOAST' }
  | { type: 'LOAD_STATE'; payload: Partial<ChatState> };

function reducer(state: ChatState, action: Action): ChatState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_VIEW':
      return { ...state, currentView: action.payload, confPanelOpen: false, doubtSheetOpen: false };
    case 'TOGGLE_HONESTY':
      return { ...state, honestyMode: !state.honestyMode };
    case 'SET_ACTIVE_SENTENCE':
      return { ...state, activeSentenceId: action.payload.sentenceId, activeMessageId: action.payload.messageId };
    case 'ADD_FLAG': {
      const flags = { ...state.flags, [action.payload.sentenceId]: action.payload };
      return { ...state, flags };
    }
    case 'REMOVE_FLAG': {
      const flags = { ...state.flags };
      delete flags[action.payload];
      return { ...state, flags };
    }
    case 'CLEAR_FLAGS':
      return { ...state, flags: {} };
    case 'OPEN_CONF_PANEL':
      return { ...state, confPanelOpen: true, confDetail: action.payload };
    case 'CLOSE_CONF_PANEL':
      return { ...state, confPanelOpen: false };
    case 'TOGGLE_DOUBT_SHEET':
      return { ...state, doubtSheetOpen: !state.doubtSheetOpen };
    case 'CLOSE_DOUBT_SHEET':
      return { ...state, doubtSheetOpen: false };
    case 'OPEN_ENTITY_MODAL':
      return { ...state, entityModalOpen: true, entityDetail: action.payload };
    case 'CLOSE_ENTITY_MODAL':
      return { ...state, entityModalOpen: false };
    case 'SHOW_TOAST':
      return { ...state, toast: { msg: action.payload, id: Date.now() } };
    case 'CLEAR_TOAST':
      return { ...state, toast: null };
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

const DEFAULT_MESSAGES: Message[] = [
  {
    id: 'u-1',
    role: 'user',
    text: 'Can you explain the causes of World War I?',
    timestamp: new Date('2026-06-09T12:00:00.000Z'),
  },
  {
    id: 'a-1',
    role: 'assistant',
    timestamp: new Date('2026-06-09T12:00:05.000Z'),
    sentences: [
      {
        id: 's1',
        text: 'World War I began in 1914 following the assassination of Archduke Franz Ferdinand of Austria-Hungary in Sarajevo on June 28th.',
        confidence: 'high',
        entities: [
          { value: '1914', type: 'DATE', label: 'Date', reason: 'Specific dates should be cross-checked with primary sources.' },
          { value: 'June 28th', type: 'DATE', label: 'Date', reason: 'Specific dates should be cross-checked with primary sources.' }
        ]
      },
      {
        id: 's2',
        text: 'The assassination was carried out by Gavrilo Princip, a Bosnian Serb nationalist affiliated with the Black Hand secret society.',
        confidence: 'med',
        entities: [
          { value: 'Gavrilo Princip', type: 'PERSON', label: 'Name', reason: 'Verify the actor and their affiliation.' }
        ]
      },
      {
        id: 's3',
        text: 'However, historians generally agree that the assassination was merely the trigger, and deeper structural causes had been building for decades.',
        confidence: 'high',
        entities: []
      },
      {
        id: 's4',
        text: 'These included the complex web of military alliances (Triple Entente vs Triple Alliance), imperial competition between European powers, and rising nationalist movements particularly in the Balkans.',
        confidence: 'med',
        entities: [
          { value: 'Triple Entente', type: 'ORG', label: 'Organization', reason: 'Verify alliance members and agreements.' },
          { value: 'Triple Alliance', type: 'ORG', label: 'Organization', reason: 'Verify alliance members and agreements.' }
        ]
      },
      {
        id: 's5',
        text: "Germany's Schlieffen Plan, which had been prepared since 1905, required attacking France first before turning to Russia, effectively forcing a two-front war that escalated the conflict rapidly.",
        confidence: 'low',
        entities: [
          { value: "Germany's Schlieffen Plan", type: 'PLAN', label: 'Plan', reason: 'Verify plan details, origin date, and implementation.' },
          { value: '1905', type: 'DATE', label: 'Date', reason: 'Verify origin date of military strategy.' }
        ]
      },
      {
        id: 's6',
        text: 'The mobilisation of Austria-Hungary against Serbia triggered the alliance system, pulling Russia, Germany, France, and Britain into the conflict within weeks.',
        confidence: 'high',
        entities: []
      }
    ]
  },
  {
    id: 'u-2',
    role: 'user',
    text: 'What was the Black Hand society exactly?',
    timestamp: new Date('2026-06-09T12:01:00.000Z'),
  },
  {
    id: 'a-2',
    role: 'assistant',
    timestamp: new Date('2026-06-09T12:01:05.000Z'),
    sentences: [
      {
        id: 's7',
        text: 'The Black Hand (Ujedinjenje ili smrt, "Union or Death") was a secret Serbian nationalist society founded in 1911.',
        confidence: 'med',
        entities: [
          { value: '1911', type: 'DATE', label: 'Date', reason: 'Verify organization founding date.' }
        ]
      },
      {
        id: 's8',
        text: 'It was led by Colonel Dragutin Dimitrijević, also known as "Apis," who was the head of Serbian military intelligence at the time of the assassination.',
        confidence: 'low',
        entities: [
          { value: 'Dragutin Dimitrijević', type: 'PERSON', label: 'Name', reason: 'Verify leader name, role, and intelligence ties.' }
        ]
      },
      {
        id: 's9',
        text: 'The organization aimed to unite all South Slavic peoples into a Greater Serbia, and operated through a cell structure to maintain secrecy.',
        confidence: 'high',
        entities: []
      }
    ]
  }
];

const INITIAL_STATE: ChatState = {
  messages: DEFAULT_MESSAGES,
  flags: {},
  currentView: 'chat',
  honestyMode: false,
  isLoading: false,
  activeSentenceId: null,
  activeMessageId: null,
  confPanelOpen: false,
  confDetail: null,
  doubtSheetOpen: false,
  entityModalOpen: false,
  entityDetail: null,
  toast: null,
};

// ─── Context ─────────────────────────────────────────────────────────────────

interface ChatContextValue {
  state: ChatState;
  dispatch: React.Dispatch<Action>;
  sendMessage: (text: string) => Promise<void>;
  triggerSelfAudit: (sentenceText: string, all?: boolean) => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

// ─── Serialization helpers (localStorage) ────────────────────────────────────

const STORAGE_KEY = 'clearmind_state';

function serializeState(state: ChatState): string {
  return JSON.stringify({
    messages: state.messages,
    flags: state.flags,
  });
}

function deserializeState(raw: string): Partial<ChatState> | null {
  try {
    const parsed = JSON.parse(raw);
    // Re-hydrate Date objects
    const messages = (parsed.messages || []).map((m: Record<string, unknown>) => ({
      ...m,
      timestamp: new Date(m.timestamp as string),
    }));
    const flags: Record<string, FlagEntry> = {};
    for (const [k, v] of Object.entries(parsed.flags || {})) {
      const f = v as Record<string, unknown>;
      flags[k] = { ...f, flaggedAt: new Date(f.flaggedAt as string) } as FlagEntry;
    }
    return { messages, flags };
  } catch {
    return null;
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const loaded = deserializeState(raw);
      if (loaded) dispatch({ type: 'LOAD_STATE', payload: loaded });
    }
  }, []);

  // Save to localStorage when messages/flags change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, serializeState(state));
  }, [state.messages, state.flags]); // eslint-disable-line react-hooks/exhaustive-deps

  // Toast auto-dismiss
  useEffect(() => {
    if (!state.toast) return;
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => dispatch({ type: 'CLEAR_TOAST' }), 2500);
  }, [state.toast]);

  // ─── sendMessage ─────────────────────────────────────────────────
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMsg: UserMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };
    dispatch({ type: 'ADD_MESSAGE', payload: userMsg });
    dispatch({ type: 'SET_LOADING', payload: true });

    // Build history for context (last 10 messages)
    const history = state.messages.slice(-10).map((m) => {
      if (m.role === 'user') return { role: 'user', content: (m as UserMessage).text };
      const ai = m as AIMessage;
      return { role: 'assistant', content: ai.sentences.map((s) => s.text).join(' ') };
    });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history,
          honestyMode: state.honestyMode,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();

      const aiMsg: AIMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        sentences: data.sentences,
        timestamp: new Date(),
      };
      dispatch({ type: 'ADD_MESSAGE', payload: aiMsg });
    } catch (err) {
      const errMsg: AIMessage = {
        id: `a-err-${Date.now()}`,
        role: 'assistant',
        sentences: [{
          id: 'err-s1',
          text: err instanceof Error && err.name === 'TimeoutError'
            ? 'The request timed out. Please try again.'
            : 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.',
          confidence: 'high',
          entities: [],
        }],
        timestamp: new Date(),
      };
      dispatch({ type: 'ADD_MESSAGE', payload: errMsg });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.messages, state.honestyMode]);

  // ─── triggerSelfAudit ─────────────────────────────────────────────
  const triggerSelfAudit = useCallback(async (sentenceText: string, all = false) => {
    const prompt = all
      ? `Please audit the following claims I flagged as doubtful and tell me where you may have been uncertain or wrong:\n${sentenceText}`
      : `Please critically audit this specific claim you made and tell me if it is accurate, uncertain, or wrong:\n"${sentenceText}"`;

    dispatch({ type: 'SET_VIEW', payload: 'chat' });
    await sendMessage(prompt);
  }, [sendMessage]);

  return (
    <ChatContext.Provider value={{ state, dispatch, sendMessage, triggerSelfAudit }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatContext must be used inside ChatProvider');
  return ctx;
}
