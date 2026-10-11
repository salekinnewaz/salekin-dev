/**
 * ContactFormPage
 *
 * The contact form at `/#contact`. Client component using
 * react-hook-form + zod resolver that posts to a server action.
 *
 * Flows:
 *   - `goto()` boots the home page and scrolls to #contact.
 *   - `fillAndSubmit({name, email, message})` fills the 3 fields
 *     and clicks the submit button.
 *   - `expectNameError()` / `expectEmailError()` / `expectMessageError()`
 *     assert each field's error is visible.
 *   - `expectSuccess()` waits for the success state.
 *   - `expectHoneypotIsHidden()` confirms the off-screen wrapper.
 */
import { expect, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export type ContactFormSubmission = {
  name: string;
  email: string;
  message: string;
};

export class ContactFormPage extends BasePage {
  async goto(): Promise<void> {
    await this.openAt('/#contact');
    await this.form.waitFor({ state: 'visible' });
  }

  get form(): Locator {
    return this.page.locator('#contact-form');
  }

  get nameInput(): Locator {
    return this.page.locator('#contact-name');
  }

  get emailInput(): Locator {
    return this.page.locator('#contact-email');
  }

  get messageInput(): Locator {
    return this.page.locator('#contact-message');
  }

  get honeypotInput(): Locator {
    return this.page.locator('#contact-website');
  }

  get submitButton(): Locator {
    return this.page.locator('#contact-form button[type="submit"]');
  }

  get nameError(): Locator {
    return this.page.getByTestId('contact-name-error');
  }

  get emailError(): Locator {
    return this.page.getByTestId('contact-email-error');
  }

  get messageError(): Locator {
    return this.page.getByTestId('contact-message-error');
  }

  get success(): Locator {
    return this.page.getByTestId('contact-success');
  }

  // ── Flows ────────────────────────────────────────────────────────

  async fillAndSubmit(data: ContactFormSubmission): Promise<void> {
    await this.nameInput.fill(data.name);
    await this.emailInput.fill(data.email);
    await this.messageInput.fill(data.message);
    await this.submitButton.click();
  }

  async submitEmpty(): Promise<void> {
    await this.submitButton.click();
  }

  async expectNameError(): Promise<void> {
    await expect(this.nameError).toBeVisible();
  }

  async expectEmailError(): Promise<void> {
    await expect(this.emailError).toBeVisible();
  }

  async expectMessageError(): Promise<void> {
    await expect(this.messageError).toBeVisible();
  }

  async expectNameErrorAbsent(): Promise<void> {
    await expect(this.nameError).toHaveCount(0);
  }

  async expectSuccess(timeout = 10_000): Promise<void> {
    await expect(this.success).toBeVisible({ timeout });
  }

  /**
   * Asserts the honeypot is:
   *   - present in the DOM,
   *   - has tabindex="-1" (removed from keyboard tab order),
   *   - wrapped in an aria-hidden off-screen container at
   *     `left: -10000px`.
   */
  async expectHoneypotIsHidden(): Promise<void> {
    const honeypot = this.honeypotInput;
    await expect(honeypot).toBeAttached();
    await expect(honeypot).toHaveAttribute('tabindex', '-1');
    const wrapper = honeypot.locator('xpath=..');
    await expect(wrapper).toHaveAttribute('aria-hidden', 'true');
    const left = await wrapper.evaluate((el) => getComputedStyle(el).left);
    expect(left).toBe('-10000px');
  }

  async expectRendersWithAllFields(): Promise<void> {
    await expect(this.form).toBeVisible();
    await expect(this.nameInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.messageInput).toBeVisible();
  }
}
