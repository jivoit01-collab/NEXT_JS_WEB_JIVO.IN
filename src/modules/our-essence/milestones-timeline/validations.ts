import { z } from 'zod';

export const milestonesTimelineVideoSchema = z.object({
  video: z.string().optional().default(''),
  videoMobile: z.string().optional().default(''),
  videoWidth: z.coerce.number().int().min(0).optional().default(0),
  videoHeight: z.coerce.number().int().min(0).optional().default(0),
  videoMobileWidth: z.coerce.number().int().min(0).optional().default(0),
  videoMobileHeight: z.coerce.number().int().min(0).optional().default(0),
});

export const milestonesTimelineSectionSchemas = {
  video: milestonesTimelineVideoSchema,
} as const;

export type MilestonesTimelineVideoSchema = z.infer<typeof milestonesTimelineVideoSchema>;