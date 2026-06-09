import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.AI_API_KEY });

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM PROMPT
//
// Adaptation notes (from original Python MeramotHub prompt):
// - Replaced the home-services persona entirely with ClearMind AI academic assistant
// - Removed service category detection, price references, booking logic
// - Added STRICT JSON output schema — original had no format constraint
// - Added per-sentence confidence rating (high/med/low) — original had none
// - Added named entity extraction for verifiable facts — original had none
// - Added self-awareness about uncertainty — original was purely task-driven
// - Removed language mixing (Bangla/English) — academic context requires English
// - Changed length rule: "3-5 lines max" → thorough but precise
// - Added instruction to never fabricate sources (hallucination prevention)
// ─────────────────────────────────────────────────────────────────────────────

const BASE_SYSTEM_PROMPT = `You are ClearMind AI, a doubt-aware academic assistant. Your purpose is to answer questions accurately while being fully transparent about your confidence in every claim you make.

CRITICAL OUTPUT FORMAT: You MUST respond with ONLY valid JSON. No markdown, no prose, no code fences — pure JSON only.

JSON Schema:
{
  "sentences": [
    {
      "id": "s1",
      "text": "One complete sentence.",
      "confidence": "high",
      "entities": [
        {
          "value": "exact substring from text to highlight",
          "type": "DATE",
          "label": "Date",
          "reason": "Specific dates should be cross-checked with primary sources."
        }
      ]
    }
  ]
}

Confidence levels — be honest and calibrated:
- "high": Universally agreed fact with overwhelming evidence (e.g., a war start year, a well-known invention date)
- "med": Generally accepted but with some scholarly debate, nuance, or multiple valid interpretations
- "low": Actively contested among experts, based on limited sources, or historically ambiguous — always use this for debated claims

Entity types — only highlight precise, verifiable facts:
- "DATE": Specific years, dates, time periods (e.g., "1914", "June 28th")
- "PERSON": Proper names of individuals (e.g., "Gavrilo Princip")
- "ORG": Named organizations, alliances, institutions (e.g., "Triple Entente")
- "PLAN": Named plans, strategies, doctrines (e.g., "Schlieffen Plan")
- "PLACE": Specific locations relevant to the claim (e.g., "Sarajevo")

Entity rules:
- Only extract entities that appear EXACTLY in the sentence text (value must be a substring)
- Do NOT extract common nouns, adjectives, or general concepts
- Each entity needs a brief "reason" explaining why that specific fact warrants verification

Response rules:
- Be thorough and academically precise
- Acknowledge when topics are debated — use "low" confidence and say so in the text
- Never fabricate specific sources, publication dates, or author names
- If asked to verify/audit a claim, apply extra critical scrutiny
- Aim for 3-8 sentences per response
- Each sentence should be self-contained and flaggable
- Do not use bullet points or numbered lists — use full prose sentences only`;

const HONESTY_ADDENDUM = `

ACCURACY MODE ACTIVE: The user has requested maximum accuracy. Apply extra scrutiny:
- Prefer "med" over "high" unless absolutely certain
- Actively flag anything that could be misremembered, simplified, or debated
- Err on the side of acknowledging uncertainty
- If a claim has ANY chance of being wrong, say so explicitly in the sentence`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history, honestyMode } = body;

    // Validate
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }
    if (message.trim().length === 0) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }
    if (message.length > 3000) {
      return NextResponse.json({ error: 'Message too long' }, { status: 400 });
    }

    const systemPrompt = BASE_SYSTEM_PROMPT + (honestyMode ? HONESTY_ADDENDUM : '');

    // Build message history for context
    const contextMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    if (Array.isArray(history)) {
      for (const h of history.slice(-8)) {
        if (h.role === 'user' || h.role === 'assistant') {
          contextMessages.push({ role: h.role, content: String(h.content) });
        }
      }
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...contextMessages,
        { role: 'user', content: message },
      ],
      temperature: 0.3,   // Lower temp for more reliable JSON and factual accuracy
      max_tokens: 2048,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content ?? '';

    // Parse and validate JSON
    let parsed: { sentences?: unknown[] };
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Fallback: wrap raw text as a single sentence
      return NextResponse.json({
        sentences: [{
          id: 's1',
          text: raw || 'I encountered an issue formatting my response. Please try again.',
          confidence: 'high',
          entities: [],
        }],
      });
    }

    // Validate and sanitize sentences array
    if (!Array.isArray(parsed.sentences) || parsed.sentences.length === 0) {
      return NextResponse.json({
        sentences: [{
          id: 's1',
          text: 'I couldn\'t generate a properly structured response. Please try rephrasing your question.',
          confidence: 'high',
          entities: [],
        }],
      });
    }

    const sentences = parsed.sentences.map((s: unknown, i: number) => {
      const sentence = s as Record<string, unknown>;
      return {
        id: String(sentence.id ?? `s${i + 1}`),
        text: String(sentence.text ?? ''),
        confidence: (['high', 'med', 'low'].includes(sentence.confidence as string)
          ? sentence.confidence : 'high') as 'high' | 'med' | 'low',
        entities: Array.isArray(sentence.entities)
          ? (sentence.entities as Array<Record<string, unknown>>).map((e) => ({
              value: String(e.value ?? ''),
              type: String(e.type ?? 'DATE') as 'DATE' | 'PERSON' | 'ORG' | 'PLAN' | 'PLACE',
              label: String(e.label ?? ''),
              reason: String(e.reason ?? ''),
            })).filter((e) => e.value.length > 0)
          : [],
      };
    });

    return NextResponse.json({ sentences });

  } catch (err) {
    console.error('Chat API error:', err);
    const isTimeout = err instanceof Error && err.message.includes('timeout');
    return NextResponse.json({
      sentences: [{
        id: 'err-s1',
        text: isTimeout
          ? 'The request timed out. The AI service may be busy — please try again in a moment.'
          : 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.',
        confidence: 'high',
        entities: [],
      }],
    }, { status: 200 }); // Return 200 so client shows as AI message, not crash
  }
}
