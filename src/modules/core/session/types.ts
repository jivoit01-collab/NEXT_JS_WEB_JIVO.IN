/** Public-safe session projection — excludes the internal `id`. */
export interface SessionDTO {
  sessionId: string;
  visitorId: string;
  startedAt: Date;
  endedAt: Date | null;
  duration: number | null;
  entryPage: string | null;
  exitPage: string | null;
  isBounce: boolean;
  createdAt: Date;
  updatedAt: Date;
}
