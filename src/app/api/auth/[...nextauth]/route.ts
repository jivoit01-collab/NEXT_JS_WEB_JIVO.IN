import { handlers } from '@/lib/auth';

// Node runtime — the Credentials provider uses bcrypt + Prisma (pg).
export const runtime = 'nodejs';

export const { GET, POST } = handlers;
