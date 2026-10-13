/**
 * IndexNow: tell Bing/Yandex/etc. that a facts page changed.
 * Active only when INDEXNOW_KEY is set; otherwise logs and returns {skipped:true}.
 *
 * The key file must be served at https://{host}/{key}.txt (see serve.ts).
 */

export interface IndexNowResult {
  skipped: boolean;
  status?: number;
  urls: string[];
  error?: string;
}

export function indexNowKey(): string | null {
  const k = process.env.INDEXNOW_KEY?.trim();
  return k ? k : null;
}

/** Path of the key file relative to the host root, e.g. "/abc123.txt". */
export function indexNowKeyPath(): string | null {
  const k = indexNowKey();
  return k ? `/${k}.txt` : null;
}

export function isIndexNowKeyPath(pathname: string): boolean {
  const p = indexNowKeyPath();
  return p !== null && pathname === p;
}

export async function pingIndexNow(urls: string[]): Promise<IndexNowResult> {
  const key = indexNowKey();
  if (!key || urls.length === 0) {
    console.log(JSON.stringify({ msg: "indexnow.skip", reason: key ? "no urls" : "no INDEXNOW_KEY", urls }));
    return { skipped: true, urls };
  }
  if (process.env.VIDALO_MOCK === "1") {
    console.log(JSON.stringify({ msg: "indexnow.mock", urls }));
    return { skipped: true, urls };
  }
  const first = urls[0]!;
  const host = new URL(first).host;
  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host, key, keyLocation: `https://${host}/${key}.txt`, urlList: urls }),
    });
    console.log(JSON.stringify({ msg: "indexnow.ping", status: res.status, urls }));
    return { skipped: false, status: res.status, urls };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.log(JSON.stringify({ msg: "indexnow.error", error, urls }));
    return { skipped: false, urls, error };
  }
}
