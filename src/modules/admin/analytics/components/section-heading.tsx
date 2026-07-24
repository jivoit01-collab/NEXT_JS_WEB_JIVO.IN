/** Small uppercase section label used between content blocks on a page. */
export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-muted-foreground mb-3 text-xs font-jost-bold uppercase tracking-widest 2xl:text-sm">
      {children}
    </h2>
  );
}
