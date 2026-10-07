/** Structured one-line JSON logs for the worker. */
export type Fields = Record<string, unknown>;

function emit(level: "debug" | "info" | "warn" | "error", msg: string, fields?: Fields): void {
  const line = JSON.stringify({ t: new Date().toISOString(), level, svc: "worker", msg, ...(fields ?? {}) });
  if (level === "error") console.error(line);
  else console.log(line);
}

export const log = {
  debug: (msg: string, fields?: Fields) => {
    if (process.env.LOG_LEVEL === "debug") emit("debug", msg, fields);
  },
  info: (msg: string, fields?: Fields) => emit("info", msg, fields),
  warn: (msg: string, fields?: Fields) => emit("warn", msg, fields),
  error: (msg: string, fields?: Fields) => emit("error", msg, fields),
};

export function errorMessage(err: unknown): string {
  if (err instanceof Error) return `${err.name}: ${err.message}`;
  return String(err);
}
