/**
 * Microsoft Copilot (copilot.microsoft.com / Bing Copilot).
 *
 * There is no public API that returns consumer Copilot answers with citations,
 * so this engine needs a headless-browser adapter (Playwright): open
 * copilot.microsoft.com with nl-NL locale, type the prompt, wait for the
 * answer to finish streaming, read the answer text and the "Bronnen" links.
 *
 * Until that adapter exists this client is a stub: available() is false unless
 * COPILOT_ENABLED=1, and ask() throws so the scanner marks the engine skipped
 * (lowest priority per ARCHITECTURE.md: "skip on failure").
 *
 * TODO(copilot): implement `CopilotBrowserAdapter` (in apps/worker or a
 * separate package with a Playwright dependency) and register it with
 * `setCopilotAdapter()` below; keep this core package free of browser deps.
 */
import type { EngineClient, AskContext, EngineAnswer } from "./types";

export interface CopilotBrowserAdapter {
  /** Ask Copilot one question in Dutch and return the answer + cited URLs. */
  ask(promptNl: string): Promise<{ answerText: string; citations: string[] }>;
}

let adapter: CopilotBrowserAdapter | null = null;

/** Register a headless-browser adapter (done by the worker at boot). */
export function setCopilotAdapter(a: CopilotBrowserAdapter | null): void {
  adapter = a;
}

export const copilotEngine: EngineClient = {
  engine: "copilot",
  available: () => process.env.COPILOT_ENABLED === "1" && adapter !== null,
  async ask(promptNl: string, _ctx: AskContext): Promise<EngineAnswer> {
    if (!adapter) throw new Error("copilot: no browser adapter registered (see scanner/engines/copilot.ts)");
    const { answerText, citations } = await adapter.ask(promptNl);
    return { answerText: answerText.trim(), citations: [...new Set(citations)], costCents: 0 };
  },
};
