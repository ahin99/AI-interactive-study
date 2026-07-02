import { GoogleGenAI } from "@google/genai";
import type { ContentListUnion } from "@google/genai";
import type { z } from "zod";
import type { AiApiErrorCode } from "./schemas";

export const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.5-flash";

type GeminiPrompt = ContentListUnion;

export class AiCallError extends Error {
  errorCode: AiApiErrorCode;

  constructor(errorCode: AiApiErrorCode, message: string) {
    super(message);
    this.name = "AiCallError";
    this.errorCode = errorCode;
  }
}

function getGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AiCallError("MISSING_API_KEY", "GEMINI_API_KEY is not set.");
  }
  return new GoogleGenAI({ apiKey });
}

function mapGeminiError(error: unknown): AiCallError {
  if (error instanceof AiCallError) return error;

  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED")) {
    return new AiCallError("RATE_LIMIT", "Gemini free-tier rate limit was reached.");
  }
  if (message.toLowerCase().includes("safety") || message.includes("SAFETY")) {
    return new AiCallError("SAFETY_BLOCKED", "Gemini safety filter blocked the response.");
  }
  return new AiCallError("UNKNOWN", message);
}

export async function requestGeminiJson<T>(input: {
  prompt: GeminiPrompt;
  jsonSchema: unknown;
  zodSchema: z.ZodType<T>;
}) {
  const client = getGemini();

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const prompt: GeminiPrompt =
      attempt === 0
        ? input.prompt
        : typeof input.prompt === "string"
          ? `${input.prompt}\n\n이전 응답은 유효한 JSON이 아니었다. 스키마에 맞는 JSON만 반환한다.`
          : input.prompt;

    try {
      const response = await client.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseJsonSchema: input.jsonSchema,
          thinkingConfig: { thinkingBudget: 0 },
          httpOptions: { timeout: 20000 },
        },
      });

      const raw = response.text;
      if (!raw) throw new AiCallError("INVALID_JSON", "Gemini returned an empty response.");
      return input.zodSchema.parse(JSON.parse(raw));
    } catch (error) {
      const mapped = mapGeminiError(error);
      if (attempt === 0) continue;
      throw mapped.errorCode === "UNKNOWN" || error instanceof SyntaxError
        ? new AiCallError("INVALID_JSON", mapped.message)
        : mapped;
    }
  }

  throw new AiCallError("INVALID_JSON", "Gemini did not return valid JSON.");
}
