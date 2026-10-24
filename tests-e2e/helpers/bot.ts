import type { Page } from "@playwright/test";
import { MIN_FILL_MS } from "../../lib/botSignals";

/**
 * Public forms reject anything submitted faster than a person could fill it
 * in (lib/botSignals.ts). Call this just before clicking submit so the form
 * has been open long enough — measured from page load, which is how the
 * form measures it too.
 */
export async function waitUntilHumanSpeed(page: Page) {
  await page.waitForTimeout(MIN_FILL_MS + 300);
}
