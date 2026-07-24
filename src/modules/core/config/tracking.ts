// Canonical read surface for tracking-engine configuration.
// Definitions live in `../tracking/constants` (unchanged); grouped here so
// future modules tune tracking from one place.

import {
  QUEUE_CONFIG,
  SCROLL_DEPTHS,
  SCROLL_THROTTLE_MS,
  DOWNLOAD_EXTENSIONS,
  LIMITS,
  UTM_KEYS,
} from '../tracking/constants';

export const TRACKING_CONFIG = {
  queue: QUEUE_CONFIG,
  scrollDepths: SCROLL_DEPTHS,
  scrollThrottleMs: SCROLL_THROTTLE_MS,
  downloadExtensions: DOWNLOAD_EXTENSIONS,
  limits: LIMITS,
  utmKeys: UTM_KEYS,
} as const;
