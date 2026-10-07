/** Structured one-line JSON logs (stdout), shared by core modules and the worker. */
export type LogFields = Record<string, unknown>;

function emit(level: "debug" | "info" | "warn" | "error", msg: string, fields?: LogFields): void {
  const line = JSON.stringify({ t: new Date().toISOString(), level, msg, ...(fields ?? {}) });
  if (level === "error") console.error(line);
  else console.log(line);
}

export const log = {
  debug: (msg: string, fields?: LogFields) => {
    if (process.env.LOG_LEVEL === "debug") emit("debug", msg, fields);
  },
  info: (msg: string, fields?: LogFields) => emit("info", msg, fields),
  warn: (msg: string, fields?: LogFields) => emit("warn", msg, fields),
  error: (msg: string, fields?: LogFields) => emit("error", msg, fields),
};

export function errorMessage(err: unknown): string {
  return err instanceof Error ? `${err.name}: ${err.message}` : String(err);
}
