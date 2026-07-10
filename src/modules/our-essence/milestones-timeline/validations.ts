import { z } from 'zod';

export const milestonesTimelineVideoSchema = z.object({
  video: z.string().optional().default(''),
});

export const milestonesTimelineSectionSchemas = {
  video: milestonesTimelineVideoSchema,
} as const;

export type MilestonesTimelineVideoSchema = z.infer<typeof milestonesTimelineVideoSchema>;