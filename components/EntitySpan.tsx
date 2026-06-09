'use client';

import { Entity } from '@/types/chat';
import { useChatContext } from '@/lib/ChatContext';

interface EntitySpanProps {
  entity: Entity;
  sentenceText: string;
}

export default function EntitySpan({ entity }: EntitySpanProps) {
  const { dispatch } = useChatContext();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({
      type: 'OPEN_ENTITY_MODAL',
      payload: {
        value: entity.value,
        type: entity.type,
        label: entity.label,
        reason: entity.reason,
      },
    });
  };

  return (
    <span
      className="entity"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`${entity.label}: ${entity.value}. Click for verification info.`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(e as unknown as React.MouseEvent); }}
    >
      {entity.value}
      <span className="entity-suffix">{entity.type}</span>
    </span>
  );
}
