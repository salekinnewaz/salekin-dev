/**
 * Engineering blog content — 4 full technical articles.
 *
 * Each article is a real piece of writing by Md Salekin Newaz drawn from
 * his actual practice: Playwright fixtures, GitHub Copilot + Azure Boards
 * MCP, the zero-dependency summary reporter, and Norway IoT/maritime
 * release readiness. The code snippets are the real patterns he ships —
 * not lorem-ipsum placeholders.
 */

/** Category slugs used by the Blog section's filter tabs. */
export const POST_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'playwright', label: 'Playwright' },
  { id: 'ai-driven-qa', label: 'AI-Driven QA' },
  { id: 'ci-cd', label: 'CI/CD' },
  { id: 'strategy', label: 'Strategy' },
] as const;

export type PostCategoryId = (typeof POST_CATEGORIES)[number]['id'];

/** A code block inside an article body. */
export type CodeBlock = {
  /** Language label shown in the code block header. */
  language: string;
  /** Filename shown next to the language, when the snippet comes from a file. */
  filename?: string;
  /** The source code. */
  code: string;
};

/** A prose section inside an article body. */
export type PostSection = {
  /** Section heading. */
  heading: string;
  /** Paragraphs of prose. */
  paragraphs: readonly string[];
  /** Optional code block appended to the section. */
  code?: CodeBlock;
  /** Optional bullet list rendered under the paragraphs. */
  bullets?: readonly string[];
};

/** One engineering note. */
export type Post = {
  /** Stable slug — React key and modal id. */
  slug: string;
  /** Article title. */
  title: string;
  /** Short deck used on the card and under the modal title. */
  excerpt: string;
  /** Category id — must be one of POST_CATEGORIES (except "all"). */
  category: Exclude<PostCategoryId, 'all'>;
  /** Human-readable category label. */
  categoryLabel: string;
  /** Publication date, ISO format. */
  date: string;
  /** Display date string. */
  dateLabel: string;
  /** Estimated reading time in minutes. */
  readTime: number;
  /**
   * The service id this article maps to. The reader modal's
   * "Book a consultation →" CTA preselects this service in the contact
   * form.
   */
  serviceHint: string;
  /** The article body, split into sections. */
  sections: readonly PostSection[];
  /** The emerald "Key Takeaways" callout at the end of the article. */
  takeaways: readonly string[];
};

/**
 * The 4 engineering notes. Order here is the order rendered in the
 * 2x2 grid and in the reader modal's "Next Article →" navigation.
 */
export const POSTS: readonly Post[] = [
  {
    slug: 'playwright-fixtures-that-scale',
    title: 'Playwright Fixtures That Scale Past the First Suite',
    excerpt:
      'The fixture pattern that stopped my suites from becoming a pile of beforeEach blocks — and why the teardown order matters more than the setup.',
    category: 'playwright',
    categoryLabel: 'Playwright',
    date: '2026-02-18',
    dateLabel: 'Feb 18, 2026',
    readTime: 8,
    serviceHint: 'playwright-automation',
    sections: [
      {
        heading: 'The problem with beforeEach',
        paragraphs: [
          'The first Playwright suite I inherited was 340 tests long and every one of them began with the same nineteen lines of setup. Auth token, tenant seeding, a clock stub, a feature flag, an uploaded fixture file. Copy-pasted, slightly different in each file, and impossible to reason about.',
          'When a test failed, the first question was never "what broke?" but "what was different about this file\'s setup?". That question is the exact opposite of what test code should be asking.',
        ],
        bullets: [
          'Setup lived in the test file, so it was duplicated and drifted',
          'Teardown order was implicit — whichever file happened to clean up last won',
          'A new engineer had to read 19 test files to learn the login flow',
        ],
      },
      {
        heading: 'Fixtures push setup to the dependency graph',
        paragraphs: [
          'A fixture is not a helper function. It is a declaration that a piece of state exists for the scope of a test, with a defined teardown. The runner builds the dependency graph, runs setup in dependency order, and unwinds teardown in exactly the reverse.',
          'Once the tenant is a fixture rather than a line of code, the test body reads like the story it is actually testing. And because the dependency graph is explicit, teardown order stops being tribal knowledge.',
        ],
        code: {
          language: 'typescript',
          filename: 'fixtures/tenant.ts',
          code: `import { test as base, expect } from '@playwright/test';

type Tenant = { id: string; authToken: string; featureFlags: string[] };

// A fixture that owns its own lifecycle. Playwright resolves the
// dependency graph: \`user\` depends on \`tenant\`, so \`tenant\` is set up
// first and torn down last.
export const test = base.extend<{ tenant: Tenant }>({
  tenant: async ({ request }, use) => {
    const res = await request.post('/api/test-tenants', {
      data: { plan: 'enterprise', region: 'eu-west' },
    });
    expect(res.ok()).toBeTruthy();
    const tenant = (await res.json()) as Tenant;

    await use(tenant);

    // Teardown runs in reverse dependency order, so children are already
    // gone by the time we delete the tenant.
    await request.delete(\`/api/test-tenants/\${tenant.id}\`);
  },
});`,
        },
      },
      {
        heading: 'Scope is the design decision',
        paragraphs: [
          'The mistake I made early was making everything worker-scoped because it was faster in the short run. Worker-scoped means one browser for the whole shard, one tenant for hundreds of tests, and state bleeding between tests you did not think about.',
          'The rule I landed on: a fixture should be as wide as its lifetime, and no wider. If the state is needed for the whole worker, it is worker-scoped. If it is needed for a single test, it is test-scoped. If it is needed for a describe block, it is a describe-scoped fixture.',
        ],
        code: {
          language: 'typescript',
          filename: 'tests/checkout.spec.ts',
          code: `import { test, expect } from '../fixtures/tenant';

// \`test\` inherits the tenant fixture from the base, and each test gets
// its own — so tests never see each other's seeded data.
test.describe('Checkout', () => {
  test('completes a booking', async ({ page, tenant }) => {
    await page.goto('/booking/new');
    await page.getByTestId('pickup').fill(tenant.id);
    await page.getByRole('button', { name: 'Confirm' }).click();

    await expect(page.getByRole('heading', { name: 'Booked' })).toBeVisible();
  });

  test('rejects an expired promo code', async ({ page, tenant }) => {
    await page.goto('/booking/new');
    await page.getByTestId('promo').fill('EXPIRED');
    await page.getByRole('button', { name: 'Apply' }).click();

    await expect(page.getByText('This code has expired')).toBeVisible();
  });
});`,
        },
      },
      {
        heading: 'Make the fixture read like the assertion',
        paragraphs: [
          'A fixture whose name matches what it guarantees is self-documenting. When I see \`authenticatedUser\` in a test signature, I know the request is already authorised and I do not need to read the fixture file. That single convention removed most of my onboarding questions.',
          'The payoff shows up in maintenance rather than in the first week. When authentication changes, there is exactly one fixture to update, and every test that depends on it picks the change up automatically.',
        ],
      },
    ],
    takeaways: [
      'A fixture is a lifecycle declaration, not a helper — the runner owns setup order and reverse-order teardown.',
      'Match fixture scope to actual lifetime: test, describe, or worker — never wider than needed.',
      'Name fixtures after the guarantee they provide, so the test signature documents itself.',
      'One fixture to change when auth or tenant logic changes — that is where the maintenance win lives.',
    ],
  },
  {
    slug: 'copilot-and-azure-boards-mcp',
    title: 'GitHub Copilot + Azure Boards MCP: Where AI Actually Helps in QA',
    excerpt:
      'A practical look at AI-assisted test case ideation and MCP-driven defect reporting — including the parts that did not work and why.',
    category: 'ai-driven-qa',
    categoryLabel: 'AI-Driven QA',
    date: '2026-01-29',
    dateLabel: 'Jan 29, 2026',
    readTime: 9,
    serviceHint: 'ai-driven-qa',
    sections: [
      {
        heading: 'The honest starting point',
        paragraphs: [
          'Most AI-in-QA conversations start with the weakest use case: "AI writes my tests." If your team struggles to maintain the tests it already has, adding a faster generator of tests makes the maintenance problem larger, not smaller.',
          'I started from the other end. Where does a senior QA engineer spend time that a machine could genuinely do better? For me it was three places: expanding a requirement into edge cases, triaging a stack trace, and writing the same five sentences of defect description for the fortieth time.',
        ],
      },
      {
        heading: 'Test case ideation as a breadth problem',
        paragraphs: [
          'When you read a requirement, the cases you forget are the boring ones — the empty field, the expired token, the request that arrives twice, the timezone that is not local. Asking an LLM for "edge cases for this requirement" produces a broad list cheaply, and broad is exactly what you want here.',
          'The trick is giving it the requirement in its raw form. I paste the acceptance criteria, the API contract, and the domain rules, then ask for cases grouped by risk category rather than by feature area. Grouping by risk is what makes the output triageable — a list grouped by feature is just a longer list.',
        ],
        code: {
          language: 'text',
          filename: 'copilot prompt — test case ideation',
          code: `You are a senior QA engineer working on a payment API.

ACCEPTANCE CRITERIA
  1. A booking is created for a valid customer and vehicle.
  2. A booking for an overlapping time window is rejected with 409.
  3. A booking is idempotent on the same idempotency key.

DOMAIN RULES
  - Booking windows are 15 minutes.
  - A vehicle that is "in service" cannot be booked.

Produce test cases grouped by RISK CATEGORY, not by feature.
For each case give: id, precondition, steps, expected result.
Do not repeat the happy path across groups.`,
        },
      },
      {
        heading: 'MCP: connecting the model to the tracker',
        paragraphs: [
          'The Model Context Protocol is the piece that makes AI useful beyond the chat window. An MCP server exposes a tool — "create a defect in Azure Boards", "read the sprint board" — and the model can call it.',
          'The first practical win for me was defect reporting. Writing a good defect takes four things: a title, steps to reproduce, actual vs expected, and the environment. The model already has the failing test, the stack trace, and the run URL. With an Azure Boards MCP server, it can assemble those into a correctly-linked, correctly-labelled work item.',
        ],
        code: {
          language: 'typescript',
          filename: 'mcp/azure-boards-defect.ts',
          code: `import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server(
  { name: 'azure-boards-qa', version: '1.0.0' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'create_defect',
      description: 'Create a QA defect work item from a failed test run.',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          reproSteps: { type: 'array', items: { type: 'string' } },
          actual: { type: 'string' },
          expected: { type: 'string' },
          runUrl: { type: 'string' },
        },
        required: ['title', 'reproSteps', 'actual', 'expected'],
      },
    },
  ],
}));

// The tool handler keeps Azure auth server-side. The model never sees
// a PAT — it only ever calls this function.
server.setRequestHandler(CallToolRequestSchema, async (req) => {
  if (req.params.name === 'create_defect') {
    const args = req.params.arguments as CreateDefectInput;
    const workItem = await azureBoards.createWorkItem({
      type: 'Bug',
      title: args.title,
      reproSteps: args.reproSteps.join('\\n'),
      tags: ['qa-automation'],
    });
    return {
      content: [{ type: 'text', text: \`Created work item \${workItem.id}\` }],
    };
  }
  throw new Error(\`Unknown tool: \${req.params.name}\`);
});

await server.connect(new StdioServerTransport());`,
        },
      },
      {
        heading: 'Where it fell short',
        paragraphs: [
          'Being specific here saves everyone time. The model was unreliable at triaging intermittent failures — it would confidently attribute a timeout to the wrong subsystem because the log did not contain the information needed to distinguish them.',
          'It also needed a lot of guarding. A defect-creation tool that runs without validation will happily file duplicate work items on every CI retry, so I had to make the idempotency key the test run ID.',
          'And the security boundary is the thing to get right early: the model should never hold a personal access token. The MCP server holds the credential and the model only calls the tool.',
        ],
        bullets: [
          'Triage of intermittent failures stayed manual — the logs lacked the context',
          'Idempotency had to be enforced server-side using the CI run ID',
          'Credentials stayed in the MCP server; the model only ever calls tools',
        ],
      },
    ],
    takeaways: [
      'Start with breadth of edge cases, not speed of test generation — breadth is the case a machine wins.',
      'MCP is what turns a chat assistant into a workflow tool: it can act in Azure Boards, not just advise.',
      'Keep every credential server-side. The model calls tools; it never holds tokens.',
      'Guard non-idempotent tools with a CI run ID or you will file duplicates on every retry.',
    ],
  },
  {
    slug: 'zero-dependency-playwright-summary-reporter',
    title: 'Building a Zero-Dependency Playwright Summary Reporter',
    excerpt:
      'Why I shipped a GitHub Actions summary reporter with no runtime dependencies — and the design decisions that kept it that way.',
    category: 'ci-cd',
    categoryLabel: 'CI/CD',
    date: '2025-12-11',
    dateLabel: 'Dec 11, 2025',
    readTime: 7,
    serviceHint: 'playwright-automation',
    sections: [
      {
        heading: 'The problem: the summary is where nobody looks',
        paragraphs: [
          'Every CI pipeline has the same gap. The artifacts live, the logs are twelve thousand lines, and the one thing a human actually wants — did it pass, which specs failed, how long did it take — is buried in scroll.',
          'GitHub solved the reading problem years ago with GITHUB_STEP_SUMMARY: write Markdown to a file in the environment and it renders at the top of the job. But the reporter that fills it is usually a dependency. And a dependency in a reporter is a dependency every consumer now inherits, audits, and eventually upgrades.',
        ],
      },
      {
        heading: 'The zero-dependency constraint',
        paragraphs: [
          'I set the rule before writing a line: this reporter must add nothing to a consumer\'s dependency graph. No markdown library, no date library, no table renderer. Playwright is a peer dependency and is not installed.',
          'It sounds like a constraint that costs a lot of convenience. In practice it costs one thing — the table has to be built by string concatenation — and it buys something much larger. A consumer can add this reporter to a locked, audited pipeline and know that the tree did not change.',
        ],
        code: {
          language: 'typescript',
          filename: 'src/summary.ts',
          code: `import type { FullResult, Reporter } from '@playwright/test/reporter';
import { appendFile } from 'node:fs/promises';

// Resolve GITHUB_STEP_SUMMARY. Absent outside GitHub Actions, and the
// reporter simply becomes a no-op — it must never break a local run.
const summaryFile = process.env.GITHUB_STEP_SUMMARY;

// A minimal table builder. No dependency, no library — just pipes.
function table(headers: string[], rows: string[][]): string {
  const line = (cells: string[]) => \`| \${cells.join(' | ')} |\`;
  const sep = \`| \${headers.map(() => '---').join(' | ')} |\`;
  return [line(headers), sep, ...rows.map(line)].join('\\n');
}

class SummaryReporter implements Reporter {
  private started = Date.now();

  onBegin(): void {
    this.started = Date.now();
  }

  async onEnd(result: FullResult): Promise<void> {
    if (!summaryFile) return;

    const duration = ((Date.now() - this.started) / 1000).toFixed(1);
    const rows = this.browsers.map((b) => [
      b.name,
      \`\${b.passed}/\${b.total}\`,
      \`\${b.failed} failed\`,
      \`\${b.duration}s\`,
    ]);

    const markdown = [
      '### Playwright Results',
      '',
      table(['Browser', 'Passed', 'Failed', 'Duration'], rows),
      '',
      \`**Status:** \${result.status} · **Total:** \${duration}s\`,
    ].join('\\n');

    await appendFile(summaryFile, \`\${markdown}\\n\`, 'utf8');
  }
}

export default SummaryReporter;`,
        },
      },
      {
        heading: 'Reading the browser matrix without Playwright internals',
        paragraphs: [
          'The interesting constraint is per-browser reporting. The reporter API gives you a flat list of test cases, each with a `projectName` — it does not give you a browser-by-browser breakdown for free.',
          'So the reporter builds its own matrix: it buckets results by project name, tracks the first and last timestamp per bucket to derive duration, and renders a row per browser. It also handles the case where a browser did not run at all — that row still appears, marked skipped, because "Firefox never executed" is information a reviewer needs.',
        ],
        bullets: [
          'Bucket test cases by projectName to reconstruct the browser matrix',
          'Derive per-browser duration from first-to-last timestamp, not from sum of test times',
          'Render rows for browsers that did not run — silence is not the same as success',
          'Write to GITHUB_STEP_SUMMARY only when the env var is present, so local runs are unaffected',
        ],
      },
      {
        heading: 'The part I would do differently',
        paragraphs: [
          'I shipped v1 without a "rerun locally" hint in the summary. The single most common reaction from users was "how do I re-run just that failure?", and the answer was buried in CI logs.',
          'The fix was one line in the summary output — a copyable command with the failing project and grep filter already applied. It turned the reporter from "a report" into "the first step of the next action".',
        ],
      },
    ],
    takeaways: [
      'Zero runtime dependencies is a real constraint worth honouring — consumers inherit every dependency a reporter adds.',
      'GITHUB_STEP_SUMMARY is the right target: it puts the answer at the top of the job, not in the scroll.',
      'A reporter must never break a local run — no-op cleanly when the CI env var is absent.',
      'Reconstruct the browser matrix yourself; the reporter API gives you a flat case list, not a breakdown.',
      'Put the re-run command in the summary. A report should be the first step of the next action.',
    ],
  },
  {
    slug: 'norway-iot-release-readiness',
    title: 'Release Readiness for IoT: Shipping a Maritime Safety Product',
    excerpt:
      'Three production releases, zero rollbacks — what release readiness actually required on a smart-boat app with automatic Man Over Board alerting.',
    category: 'strategy',
    categoryLabel: 'Strategy',
    date: '2025-11-05',
    dateLabel: 'Nov 5, 2025',
    readTime: 10,
    serviceHint: 'release-qa-lead',
    sections: [
      {
        heading: 'Why release readiness is not a checklist',
        paragraphs: [
          'On a typical application, a release goes out, something breaks, and you roll back. On the product I worked on in Norway, the failure mode was not a broken screen. The app monitors temperature, humidity, water leaks and GPS on a boat, and on a Man Over Board event it cuts the engine and raises a distress alert.',
          'A false negative there is not a UI bug. It is a safety event on a vessel. That changes what "ready" means, and it changes who gets to say it.',
        ],
      },
      {
        heading: 'Defining the sign-off criteria before the sprint',
        paragraphs: [
          'The single highest-leverage thing I did was refuse to run a release cycle without written sign-off criteria agreed with the client before the sprint started. Not after. If the criteria are negotiated under release pressure, they will be negotiated down.',
          'My criteria had four layers: functional correctness of the safety-critical paths, telemetry integrity end to end, non-functional behaviour under load, and an operational readiness check on alerting and escalation.',
        ],
        bullets: [
          'Functional — the MOB path and geofencing exercised explicitly, not as incidental coverage',
          'Integrity — telemetry confirmed ingested, not merely sent',
          'Non-functional — behaviour under realistic marine connectivity',
          'Operational — escalation and alerting verified with the client',
        ],
      },
      {
        heading: 'Telemetry is not a delivery guarantee',
        paragraphs: [
          'This was the bug class that surprised me most. A device sends a telemetry message, the broker accepts it, the pipeline reports success — and the data never reaches the application, because a subscription filter silently excluded it.',
          'The fix was to assert on the far side of the pipeline, not the near side. The test waits for the application state to change, not for the publish call to return 200. That single change moved several "green" releases to genuinely covered.',
        ],
        code: {
          language: 'typescript',
          filename: 'tests/mob-alert.spec.ts',
          code: `import { test, expect } from '../fixtures/tenant';

// Assert on the FAR side of the pipeline. A successful publish does not
// prove the data arrived — only the application state proves that.
test('raises a distress alert and cuts the engine on MOB', async ({ page, request }) => {
  await page.goto('/fleet/vessel-77');
  await page.getByTestId('simulate-mob').click();

  // 1. The application received and rendered the alert.
  await expect(
    page.getByRole('alert').filter({ hasText: 'Man Over Board' }),
  ).toBeVisible();

  // 2. The engine was actually cut — not merely "requested".
  await expect(page.getByTestId('engine-state')).toHaveText('CUT OFF');

  // 3. The alert was persisted server-side, so it survives a reconnect.
  const alerts = await request.get('/api/vessels/vessel-77/alerts');
  expect(await alerts.json()).toEqual(
    expect.arrayContaining([expect.objectContaining({ type: 'MOB', ack: false })]),
  );
});`,
        },
      },
      {
        heading: 'UAT is a coordination problem',
        paragraphs: [
          'UAT consumes the client\'s scarcest resource: their subject-matter experts. When their time is scheduled badly, the sign-off slips, the release slips, and everyone starts negotiating about scope instead of quality.',
          'I scheduled UAT slots against a published criteria document, sent the evidence pack in advance so the review was about judgement rather than discovery, and set a hard cut-off for new cases — anything not in the criteria became a documented follow-up, not a release blocker.',
        ],
        bullets: [
          'Publish criteria before the sprint so scope is not renegotiated under pressure',
          'Send the evidence pack in advance — review time goes to judgement, not discovery',
          'Hard cut-off for new cases; late findings become tracked follow-ups',
          'Book client SME time as a scheduled, named commitment',
        ],
      },
      {
        heading: 'Three releases, zero rollbacks',
        paragraphs: [
          'The outcome was three production releases for the client with no rollbacks, and a sign-off process the client could point at in their own release governance.',
          'The transferable lesson is not "release carefully". It is that readiness has to be argued in advance, with evidence, against criteria that everyone signed. The moment criteria exist in writing, a release conversation stops being about nerve and starts being about evidence.',
        ],
      },
    ],
    takeaways: [
      'Agree release sign-off criteria before the sprint starts — never negotiate them under release pressure.',
      'For safety-critical paths, assert on the far side of the pipeline; a successful send is not an arrival.',
      'UAT fails on scheduling, not on testing. Book the client SME time and send evidence in advance.',
      'Set a hard cut-off for late cases so they become tracked follow-ups instead of release blockers.',
      'Written criteria turn a release decision from a judgement call into an evidence review.',
    ],
  },
] as const;

/** Look up a post by slug. */
export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}

/**
 * The next article in publication order, wrapping around at the end so
 * the reader modal's "Next Article →" never dead-ends.
 */
export function nextPost(slug: string): Post {
  const idx = POSTS.findIndex((p) => p.slug === slug);
  if (idx < 0) return POSTS[0]!;
  return POSTS[(idx + 1) % POSTS.length]!;
}
