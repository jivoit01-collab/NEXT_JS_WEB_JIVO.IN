// Shared hover-underline treatment — the website's standard link affordance:
// the label warms toward near-black while a brand-green rule sweeps in from the
// left. Extracted from the footer so the chat (and any future surface) reuses the
// SAME styling instead of inventing a second link language.
//
// Requires the parent anchor/button to carry Tailwind's `group` class, and the
// sweep is limited to real hover devices so it never sticks after a tap.
import type { ReactNode } from 'react';

export function HoverUnderlineText({ children }: { children: ReactNode }) {
  return (
    <span className="relative transition-colors duration-300 [@media(hover:hover)]:group-hover:text-[#111]">
      {children}
      <span className="absolute -bottom-0.5 left-0 h-[1.5px] w-0 bg-[#0a7d3f] transition-all duration-300 [@media(hover:hover)]:group-hover:w-full" />
    </span>
  );
}
