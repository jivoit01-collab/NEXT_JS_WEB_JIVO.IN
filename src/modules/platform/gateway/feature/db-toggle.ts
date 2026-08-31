import 'server-only';
import { prisma } from '@/lib/db';
import { isAiEnabled } from './index';

const SETTING_ID = 'default';

/**
 * Server-side AI switch WITH a DB override. Admins flip the chatbot on/off from
 * the admin (no redeploy) — that override is stored in PlatformSetting.aiEnabled
 * and wins here. When it's null (unset), we fall back to the env/static flag via
 * isAiEnabled(). Used by the Gateway to gate every chat request.
 */
export async function isAiEnabledResolved(): Promise<boolean> {
  try {
    const row = await prisma.platformSetting.findUnique({
      where: { id: SETTING_ID },
      select: { aiEnabled: true },
    });
    if (row && row.aiEnabled !== null && row.aiEnabled !== undefined) {
      return row.aiEnabled;
    }
  } catch {
    // On any DB error, fail safe to the env/static flag — never hard-crash chat.
  }
  return isAiEnabled();
}

/** Read the raw override value (true/false = explicit, null = follow env). */
export async function getAiToggle(): Promise<boolean | null> {
  const row = await prisma.platformSetting.findUnique({
    where: { id: SETTING_ID },
    select: { aiEnabled: true },
  });
  return row?.aiEnabled ?? null;
}

/** Set the admin override. Pass null to clear it (follow the env flag again). */
export async function setAiToggle(value: boolean | null): Promise<void> {
  await prisma.platformSetting.upsert({
    where: { id: SETTING_ID },
    update: { aiEnabled: value },
    create: { id: SETTING_ID, aiEnabled: value },
  });
}
