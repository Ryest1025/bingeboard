import { z } from 'zod';

// Zod schema for validating user streaming preferences
export const userPreferencesSchema = z.object({
  preferredPlatforms: z.array(z.string().min(1).max(60)).max(50).optional(),
  excludedPlatforms: z.array(z.string().min(1).max(60)).max(50).optional(),
  subscriptionTypes: z.array(z.enum(['sub','buy','rent','free'])).max(10).optional(),
  onlyAffiliateSupported: z.boolean().optional()
}).strict();

export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;

export function parseUserPreferences(data: unknown) {
  const result = userPreferencesSchema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues.map(i => `${i.path.join('.')||'<root>'}: ${i.message}`).join('; ');
    const err = new Error('Invalid user preferences: ' + issues);
    (err as any).status = 400;
    throw err;
  }
  return result.data;
}
