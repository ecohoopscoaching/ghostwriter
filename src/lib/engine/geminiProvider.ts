/**
 * Live Gemini API lyric provider.
 *
 * Calls the Gemini Generative Language REST API directly from the local app
 * using the user's own API key (stored only in browser localStorage or .env.local).
 * Feeds the full Rap / R&B Rulebook and checklists via `buildLiveLlmPrompts`.
 */
import { parseModelOutput } from './lyrics';
import { buildLiveLlmPrompts, type LyricProvider } from './providers';

export const GEMINI_MODELS = [
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', note: 'Fast & sharp (recommended)' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', note: 'Deepest lyric craft' },
] as const;

export type GeminiModelId = (typeof GEMINI_MODELS)[number]['id'];

export const DEFAULT_GEMINI_MODEL: GeminiModelId = 'gemini-2.5-flash';

const STORAGE_KEY_API = 'ghostwriter_gemini_api_key';
const STORAGE_KEY_MODEL = 'ghostwriter_gemini_model';

export interface GeminiSettings {
  apiKey: string;
  model: GeminiModelId;
}

export function loadGeminiSettings(): GeminiSettings {
  const envKey =
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY
      ? String(import.meta.env.VITE_GEMINI_API_KEY).trim()
      : '';

  if (typeof window === 'undefined' || !window.localStorage) {
    return { apiKey: envKey, model: DEFAULT_GEMINI_MODEL };
  }

  try {
    const savedKey = window.localStorage.getItem(STORAGE_KEY_API)?.trim() ?? '';
    const savedModel = window.localStorage.getItem(STORAGE_KEY_MODEL) as GeminiModelId | null;
    const validModel = GEMINI_MODELS.some((m) => m.id === savedModel)
      ? (savedModel as GeminiModelId)
      : DEFAULT_GEMINI_MODEL;
    return {
      apiKey: savedKey || envKey,
      model: validModel,
    };
  } catch {
    return { apiKey: envKey, model: DEFAULT_GEMINI_MODEL };
  }
}

export function saveGeminiSettings(settings: GeminiSettings): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const trimmed = settings.apiKey.trim();
    if (trimmed) {
      window.localStorage.setItem(STORAGE_KEY_API, trimmed);
    } else {
      window.localStorage.removeItem(STORAGE_KEY_API);
    }
    window.localStorage.setItem(STORAGE_KEY_MODEL, settings.model);
  } catch {
    // Ignore storage quota / private-mode restrictions
  }
}

function stripCodeFences(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:[a-zA-Z0-9_-]+)?\s*\n([\s\S]*?)\n```$/);
  return fenced ? fenced[1].trim() : trimmed;
}

interface GeminiResponsePayload {
  candidates?: Array<{
    finishReason?: string;
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
}

export interface CreateGeminiProviderOptions {
  apiKey: string;
  model?: GeminiModelId;
  fetchImpl?: typeof fetch;
}

export function createGeminiProvider({
  apiKey,
  model = DEFAULT_GEMINI_MODEL,
  fetchImpl = fetch,
}: CreateGeminiProviderOptions): LyricProvider {
  const cleanKey = apiKey.trim();
  const modelMeta = GEMINI_MODELS.find((m) => m.id === model);
  const displayName = modelMeta ? modelMeta.label : model;

  return {
    name: displayName,
    async generate({ topic, spec, feedback }) {
      if (!cleanKey) {
        throw new Error('Add your Gemini API key to write with Gemini.');
      }

      const { system, user } = buildLiveLlmPrompts(topic, spec, feedback);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

      let response: Response;
      try {
        response = await fetchImpl(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': cleanKey,
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: system }],
            },
            contents: [
              {
                role: 'user',
                parts: [{ text: user }],
              },
            ],
            generationConfig: {
              temperature: 0.9,
              maxOutputTokens: 4096,
            },
          }),
        });
      } catch {
        throw new Error('Could not reach the Gemini API. Check your internet connection and try again.');
      }

      let payload: GeminiResponsePayload = {};
      try {
        payload = (await response.json()) as GeminiResponsePayload;
      } catch {
        // Non-JSON error body
      }

      if (!response.ok) {
        if (response.status === 400 || response.status === 401 || response.status === 403) {
          throw new Error('Gemini rejected the API key. Double-check your key in Gemini settings.');
        }
        if (response.status === 429) {
          throw new Error('Gemini rate limit reached. Wait a moment or switch to Gemini 2.5 Flash.');
        }
        const apiMsg = payload.error?.message?.trim();
        throw new Error(apiMsg || `Gemini API error (${response.status}).`);
      }

      const candidate = payload.candidates?.[0];
      const rawText = (candidate?.content?.parts ?? [])
        .map((p) => p.text ?? '')
        .join('')
        .trim();

      if (!rawText) {
        const reason = candidate?.finishReason;
        throw new Error(
          reason && reason !== 'STOP'
            ? `Gemini returned no lyrics (${reason}). Try rephrasing the topic.`
            : 'Gemini returned an empty response. Try generating again.',
        );
      }

      const cleaned = stripCodeFences(rawText);
      const parsed = parseModelOutput(cleaned);
      return {
        title: parsed.title || 'Untitled',
        lyrics: parsed.lyrics || cleaned,
      };
    },
  };
}
