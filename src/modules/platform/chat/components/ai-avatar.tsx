'use client';

// AI avatar — brand gradient sphere carrying the Jivo mark. Reused in the header,
// welcome screen and every assistant message. The presence ("Online") dot was
// removed: availability isn't tracked, so showing it asserted something untrue.
import { JivoMark } from '@/components/shared/jivo-mark';

export function AiAvatar({ size = 32 }: { size?: number }) {
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }} aria-hidden="true">
      <span
        className="flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm"
        style={{ width: size, height: size }}
      >
        {/* The logo is a wide wordmark (~2:1). Size it by WIDTH inside the circle
            and let the height follow, so it is never squashed or cropped. */}
        <JivoMark style={{ width: size * 0.74, height: 'auto' }} />
      </span>
    </span>
  );
}
