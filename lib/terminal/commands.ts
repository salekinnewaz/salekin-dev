/**
 * Tiny command parser for the terminal easter-egg overlay.
 *
 * Each command returns a one-line result that gets printed to the
 * terminal as the response. The "scroll" and "open" effects are
 * handled by the calling client component — this module is pure
 * logic so it's easy to unit-test and to extend.
 */

export type CommandResult = {
  /** Text to print in the terminal output pane. */
  output: string;
  /** Optional side-effect the caller should perform. */
  effect?: CommandEffect;
};

export type CommandEffect =
  | { kind: 'scroll'; target: string }
  | { kind: 'open'; href: string }
  | { kind: 'toggle-theme' };

const KNOWN_COMMANDS = [
  'help',
  'about',
  'experience',
  'work',
  'projects',
  'skills',
  'contact',
  'resume',
  'theme',
  'clear',
  'whoami',
] as const;
type Command = (typeof KNOWN_COMMANDS)[number];

function isCommand(s: string): s is Command {
  return (KNOWN_COMMANDS as readonly string[]).includes(s);
}

const HELP_LINES: string[] = [
  'available commands:',
  '  help         show this help',
  '  about        scroll to the about section',
  '  experience   scroll to the experience timeline',
  '  work         open the case studies page',
  '  projects     alias for work',
  '  skills       scroll to the stack section',
  '  contact      scroll to the contact form',
  '  resume       download the cv (pdf)',
  '  theme        toggle light / dark',
  '  whoami       print a one-line identity',
  '  clear        clear the scrollback',
];

export function runCommand(raw: string): CommandResult {
  const trimmed = raw.trim();
  if (!trimmed) return { output: '' };

  const [first, ...rest] = trimmed.split(/\s+/);
  const cmd = (first ?? '').toLowerCase();

  if (!isCommand(cmd)) {
    return {
      output: `command not found: ${first}. try \`help\`.`,
    };
  }

  switch (cmd) {
    case 'help':
      return { output: HELP_LINES.join('\n') };
    case 'whoami':
      return {
        output:
          'salekin · software engineer · full-stack · typescript · next.js',
      };
    case 'about':
      return {
        output: '→ scrolling to #about',
        effect: { kind: 'scroll', target: 'about' },
      };
    case 'experience':
      return {
        output: '→ scrolling to #experience',
        effect: { kind: 'scroll', target: 'experience' },
      };
    case 'work':
    case 'projects':
      return {
        output: '→ opening /projects',
        effect: { kind: 'open', href: '/projects' },
      };
    case 'skills':
      return {
        output: '→ scrolling to #skills',
        effect: { kind: 'scroll', target: 'skills' },
      };
    case 'contact':
      return {
        output: '→ scrolling to #contact',
        effect: { kind: 'scroll', target: 'contact' },
      };
    case 'resume':
      return {
        output: '→ downloading resume.pdf',
        effect: { kind: 'open', href: '/cv-download' },
      };
    case 'theme':
      return {
        output: '→ toggling theme',
        effect: { kind: 'toggle-theme' },
      };
    case 'clear':
      return { output: '__CLEAR__' };
  }
  // The `rest` is unused for now but kept for future flag handling.
  void rest;
  return { output: '' };
}

export { KNOWN_COMMANDS };
