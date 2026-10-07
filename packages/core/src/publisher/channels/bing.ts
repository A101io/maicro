/**
 * Bing Places for Business adapter (stub).
 *
 * TODO(bing): Bing Places has no public write API for single businesses; the
 * supported routes are (a) the Bing Places bulk-upload CSV for agencies/chains
 * or (b) the web console. Plan: register Maicro as an agency account, keep a
 * per-customer listing, and push changes through the bulk feed. Until then this
 * adapter computes the diff and hands it to the operator queue.
 */
import type { Channel, Facts } from "../../types.js";
import { log } from "../../shared/log.js";
import { diffFacts, type ChannelAdapter, type SyncResult } from "./types.js";

export const bingAdapter: ChannelAdapter = {
  type: "bing",
  async syncChannel(channel: Channel, facts: Facts): Promise<SyncResult> {
    // Without an API we cannot read the current listing; assume unknown → full diff of the facts we want to push.
    const diff = diffFacts({}, facts);
    log.info("bing.sync.stub", { channelId: channel.id, fields: diff.map((d) => d.field) });
    return {
      channelId: channel.id,
      channelType: "bing",
      status: "manual",
      diff,
      evidence: { mode: "stub", at: new Date().toISOString(), listingUrl: channel.url },
      followUp: {
        kind: "operator_task",
        payload: { reason: "bing_manual_sync", channelId: channel.id, businessId: channel.businessId, diff },
      },
      note: "Bing Places: handmatig via de console tot de bulk-upload is ingericht.",
    };
  },
};
