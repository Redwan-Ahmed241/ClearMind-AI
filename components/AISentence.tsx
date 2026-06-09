'use client';

import { Sentence, FlagType } from '@/types/chat';
import { useChatContext } from '@/lib/ChatContext';
import EntitySpan from './EntitySpan';

interface AISentenceProps {
  sentence: Sentence;
  messageId: string;
  onOpenTagPicker: (e: React.MouseEvent, sentenceId: string, messageId: string) => void;
}

export default function AISentence({ sentence, messageId, onOpenTagPicker }: AISentenceProps) {
  const { state } = useChatContext();
  const flag = state.flags[sentence.id];

  // Build class list
  const classes = ['ai-sentence'];
  if (sentence.confidence === 'low') classes.push('conf-low');
  if (sentence.confidence === 'med') classes.push('conf-med');
  if (flag?.type === 'unsure') { classes.push('flagged-unsure'); }
  if (flag?.type === 'wrong') { classes.push('flagged-wrong'); }

  // Render sentence text with entity highlights
  const renderText = () => {
    if (!sentence.entities || sentence.entities.length === 0) {
      return sentence.text;
    }

    // Sort entities by their position in the text
    const sorted = [...sentence.entities]
      .filter((e) => sentence.text.includes(e.value))
      .sort((a, b) => sentence.text.indexOf(a.value) - sentence.text.indexOf(b.value));

    const parts: React.ReactNode[] = [];
    let cursor = 0;

    for (const entity of sorted) {
      const idx = sentence.text.indexOf(entity.value, cursor);
      if (idx === -1) continue;
      if (idx > cursor) {
        parts.push(sentence.text.slice(cursor, idx));
      }
      parts.push(
        <EntitySpan key={`${entity.value}-${idx}`} entity={entity} sentenceText={sentence.text} />
      );
      cursor = idx + entity.value.length;
    }

    if (cursor < sentence.text.length) {
      parts.push(sentence.text.slice(cursor));
    }

    return parts;
  };

  return (
    <>
      <span
        className={classes.join(' ')}
        data-id={sentence.id}
        data-conf={sentence.confidence}
        data-message-id={messageId}
        onClick={(e) => onOpenTagPicker(e, sentence.id, messageId)}
        role="button"
        tabIndex={0}
        aria-label={`AI sentence. Confidence: ${sentence.confidence}${flag ? `. Flagged as ${flag.type}` : ''}. Click to flag.`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenTagPicker(e as unknown as React.MouseEvent, sentence.id, messageId);
          }
        }}
      >
        {renderText()}
      </span>
      <span> </span>
    </>
  );
}
