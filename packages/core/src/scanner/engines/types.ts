/**
 * One interface for every AI engine the scanner samples.
 */
import type { Business, Engine, Facts, Prompt } from "../../types";

export interface AskContext {
  business: Business;
  /** Optional extras; the mock engine uses them to produce plausible answers. */
  facts?: Facts;
  prompt?: Prompt;
  sampleIndex?: number;
}

export interface EngineAnswer {
  answerText: string;
  citations: string[];
  costCents: number;
  /** True when the engine had nothing to say (e.g. no AI Overview shown). The sample is skipped. */
  skipped?: boolean;
}

export interface EngineClient {
  engine: Engine;
  /** Keys present / adapter usable. Unavailable engines are reported as skipped. */
  available(): boolean;
  ask(promptNl: string, ctx: AskContext): Promise<EngineAnswer>;
}

/** System instruction shared by all real engines. */
export const SYSTEM_NL =
  "Je bent een behulpzame assistent voor een gebruiker in Nederland. Antwoord in het Nederlands, kort en feitelijk. " +
  "Noem concrete gegevens (openingstijden, telefoonnummer, adres) als je ze weet en vermeld je bronnen.";

/** Per-engine timeout for one ask(). */
export const ENGINE_TIMEOUT_MS = Number(process.env.ENGINE_TIMEOUT_MS ?? 60_000);
