/**
 * node:http server that mounts the facts-page handler (fetch-style Request →
 * Response) so facts pages can be served from the worker in dev and on a
 * plain VM. Behind Cloudflare the same handler can run in a Worker.
 */
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { handleFactsRequest } from "@maicro/core/publisher";
import { errorMessage, log } from "./log.js";

function toRequest(req: IncomingMessage): Request {
  const host = req.headers.host ?? "localhost";
  const url = `http://${host}${req.url ?? "/"}`;
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (Array.isArray(v)) v.forEach((x) => headers.append(k, x));
    else if (v != null) headers.set(k, v);
  }
  return new Request(url, { method: req.method ?? "GET", headers });
}

async function writeResponse(res: ServerResponse, r: Response, head: boolean): Promise<void> {
  res.statusCode = r.status;
  r.headers.forEach((v, k) => res.setHeader(k, v));
  if (head || r.status === 304) {
    res.end();
    return;
  }
  const buf = Buffer.from(await r.arrayBuffer());
  res.setHeader("content-length", String(buf.length));
  res.end(buf);
}

export function startHttp(port = Number(process.env.FACTS_PORT ?? 8787), handler: (req: Request) => Promise<Response> = handleFactsRequest): Server {
  const server = createServer(async (req, res) => {
    const started = Date.now();
    try {
      const r = await handler(toRequest(req));
      await writeResponse(res, r, req.method === "HEAD");
      log.info("http", { host: req.headers.host, path: req.url, status: r.status, ms: Date.now() - started });
    } catch (err) {
      log.error("http.error", { path: req.url, error: errorMessage(err) });
      res.statusCode = 500;
      res.end("Er ging iets mis.");
    }
  });
  server.listen(port, () => log.info("http.listening", { port }));
  return server;
}
