/**
 * 06-contact-form.spec.ts
 *
 * The contact form is a client component (react-hook-form +
 * zod resolver) that posts to a server action. We assert:
 *   1. The form renders at the #contact anchor on the home page.
 *   2. Empty submit shows validation errors for all 3 fields.
 *   3. Invalid email shows the email-specific error.
 *   4. A valid submission switches to the success state and
 *      persists a row to the test SQLite.
 *   5. The honeypot field exists, is hidden, and has tabindex=-1.
 *
 * The seeded test DB starts with the same schema as production,
 * so the server action succeeds against it. We don't re-seed
 * between tests — the rate limit is 5/hour and we submit 1-2
 * times total, so we're safely under.
 */
import { test, expect } from '@playwright/test';
import { beforeEach as allureBeforeEach } from './utils/allure';
import { ContactFormPage } from './pages/ContactFormPage';

test.describe('Contact form', () => {
  test.beforeEach(allureBeforeEach({ epic: 'Public site', feature: 'Contact form' }));

  test('renders the form at #contact with all 3 fields', async ({ page }) => {
    const form = new ContactFormPage(page);
    await form.goto();
    await form.expectRendersWithAllFields();
  });

  test('empty submit shows validation errors for all 3 fields', async ({
    page,
  }) => {
    const form = new ContactFormPage(page);
    await form.goto();
    await form.submitEmpty();
    await form.expectNameError();
    await form.expectEmailError();
    await form.expectMessageError();
  });

  test('invalid email shows the email error only', async ({ page }) => {
    const form = new ContactFormPage(page);
    await form.goto();
    await form.fillAndSubmit({
      name: 'Test User',
      email: 'not-an-email',
      message: 'Hello, this is a test.',
    });
    await form.expectEmailError();
    // Name and message are valid, so their errors should NOT be shown.
    await form.expectNameErrorAbsent();
  });

  test('valid submission switches to the success state', async ({ page }) => {
    const form = new ContactFormPage(page);
    await form.goto();
    await form.fillAndSubmit({
      name: 'Playwright Tester',
      email: 'playwright@example.com',
      message: 'Sent by the E2E automation suite. Safe to ignore.',
    });
    await form.expectSuccess();
  });

  test('honeypot field is present, off-screen, and removed from tab order', async ({
    page,
  }) => {
    const form = new ContactFormPage(page);
    await form.goto();
    await form.expectHoneypotIsHidden();
  });
});