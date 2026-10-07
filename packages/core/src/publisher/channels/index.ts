import type { Channel, Facts } from "../../types.js";
import { appleAdapter } from "./apple.js";
import { bingAdapter } from "./bing.js";
import { directoryAdapter } from "./directories.js";
import { gbpAdapter } from "./gbp.js";
import type { ChannelAdapter, SyncResult } from "./types.js";

export * from "./types.js";
export { gbpAdapter } from "./gbp.js";
export { bingAdapter } from "./bing.js";
export { appleAdapter } from "./apple.js";
export {
  DIRECTORIES,
  directoryAdapter,
  directoryForUrl,
  findDirectory,
  findListing,
  findAllListings,
  setFormAgent,
  operatorFormAgent,
  type Directory,
  type FormAgent,
  type FormTask,
  type FormResult,
} from "./directories.js";

const ADAPTERS: Partial<Record<Channel["type"], ChannelAdapter>> = {
  gbp: gbpAdapter,
  bing: bingAdapter,
  apple: appleAdapter,
  directory: directoryAdapter,
};

export function adapterFor(type: Channel["type"]): ChannelAdapter | null {
  return ADAPTERS[type] ?? null;
}

/** Dispatch to the adapter for the channel type. facts_page channels are handled by publishFactsPage. */
export async function syncChannel(channel: Channel, facts: Facts): Promise<SyncResult> {
  const adapter = adapterFor(channel.type);
  if (!adapter) {
    return { channelId: channel.id, channelType: channel.type, status: "skipped", diff: [], evidence: { reason: `no adapter for ${channel.type}` } };
  }
  return adapter.syncChannel(channel, facts);
}
