import { z } from 'zod';

// Shared client->server tracking event shape (transport payload)
export const trackingEventSchema = z.object({
  actionType: z.string(),
  targetType: z.string(),
  targetId: z.number().optional(),
  metadata: z.record(z.any()).optional(),
  sessionId: z.string().optional(),
  timestamp: z.string().optional(),
});

export type TrackingEvent = z.infer<typeof trackingEventSchema>;
