export type ConfidenceLevel = 'high' | 'med' | 'low';
export type FlagType = 'unsure' | 'wrong';
export type ViewType = 'chat' | 'confidence' | 'doubt-log';

export interface Entity {
  value: string;
  type: 'DATE' | 'PERSON' | 'ORG' | 'PLAN' | 'PLACE';
  label: string;
  reason: string;
}

export interface Sentence {
  id: string;
  text: string;
  confidence: ConfidenceLevel;
  entities: Entity[];
}

export interface AIMessage {
  id: string;
  role: 'assistant';
  sentences: Sentence[];
  timestamp: Date;
}

export interface UserMessage {
  id: string;
  role: 'user';
  text: string;
  timestamp: Date;
}

export type Message = AIMessage | UserMessage;

export interface FlagEntry {
  sentenceId: string;
  messageId: string;
  text: string;
  type: FlagType;
  flaggedAt: Date;
}

export interface ConfidenceDetail {
  sentenceId: string;
  claim: string;
  level: ConfidenceLevel;
  reasoning: string;
  sources: string;
}
