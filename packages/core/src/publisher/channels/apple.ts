/**
 * Apple Business Connect adapter (stub).
 *
 * TODO(apple): Apple Business Connect API requires an Apple Business Connect
 * account with API access (OAuth client credentials, `businessconnect.apple.com`
 * `/v1/locations/{id}` read + PATCH for hours/phone/website). Once
 * APPLE_BC_CLIENT_ID / APPLE_BC_CLIENT_SECRET exist: fetch location by
 * channel.externalId, diffFacts, PATCH, store request id as evidence.
 * Until then: diff + operator task.
 */
import type { Channel, Facts } from "../../types.js";
import { log } from "../../shared/log.js";
import { diffFacts, type ChannelAdapter, type SyncResult } from "./types.js";

export const appleAdapter: ChannelAdapter = {
  type: "apple",
  async syncChannel(channel: Channel, facts: Facts): Promise<SyncResult> {
    const diff = diffFacts({}, facts);
    log.info("apple.sync.stub", { channelId: channel.id, fields: diff.map((d) => d.field) });
    return {
      channelId: channel.id,
      channelType: "apple",
      status: "manual",
      diff,
      evidence: { mode: "stub", at: new Date().toISOString(), listingUrl: channel.url },
      followUp: {
        kind: "operator_task",
        payload: { reason: "apple_manual_sync", channelId: channel.id, businessId: channel.businessId, diff },
      },
      note: "Apple Business Connect: handmatig tot de API-koppeling er is.",
    };
  },
};
