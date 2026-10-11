/**
 * TerminalEasterEggPage
 *
 * A hidden `<div role="dialog" aria-label="Interactive shell">`
 * overlay toggled by Cmd+K / Ctrl+K on any non-form page.
 *
 * The component listens at `window` level, so the spec must
 * dispatch the keydown directly to `window` (not to a focused
 * element) — we use the `pressChord` helper from
 * `utils/assertions.ts` for that.
 */
import { expect, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { pressChord, waitForHydration } from '../utils/assertions';

export class TerminalEasterEggPage extends BasePage {
  async goto(): Promise<void> {
    await this.openAt('/');
    await waitForHydration(this.page);
  }

  get dialog(): Locator {
    return this.page.getByRole('dialog', { name: /interactive shell/i });
  }

  async openViaCtrlK(): Promise<void> {
    await pressChord(this.page, { key: 'k', ctrlKey: true });
  }

  async closeViaEsc(): Promise<void> {
    // The Escape listener is bound inside a useEffect that
    // depends on `open`, so wait one tick for the effect to fire
    // before dispatching the keydown.
    await this.page.waitForTimeout(100);
    await pressChord(this.page, { key: 'Escape' });
  }

  async expectDialogVisible(timeout = 10_000): Promise<void> {
    await expect(this.dialog).toBeVisible({ timeout });
  }

  async expectDialogHidden(timeout = 10_000): Promise<void> {
    await expect(this.dialog).toBeHidden({ timeout });
  }
}