import { describe, it, expect } from 'vitest';
import { runCommand } from './commands';

describe('runCommand', () => {
  it('returns empty output for empty input', () => {
    expect(runCommand('').output).toBe('');
    expect(runCommand('   ').output).toBe('');
  });

  it('rejects unknown commands with a hint', () => {
    const r = runCommand('banana');
    expect(r.output).toMatch(/command not found/);
    expect(r.effect).toBeUndefined();
  });

  it('help prints the available commands', () => {
    const r = runCommand('help');
    expect(r.output).toContain('available commands');
    expect(r.output).toContain('resume');
    expect(r.output).toContain('contact');
  });

  it('about returns a scroll effect', () => {
    const r = runCommand('about');
    expect(r.effect).toEqual({ kind: 'scroll', target: 'about' });
  });

  it('resume returns an open effect pointing at the cv download', () => {
    const r = runCommand('resume');
    expect(r.effect).toEqual({ kind: 'open', href: '/cv-download' });
  });

  it('work and projects are aliases and both open the projects page', () => {
    expect(runCommand('work').effect).toEqual({
      kind: 'open',
      href: '/projects',
    });
    expect(runCommand('projects').effect).toEqual({
      kind: 'open',
      href: '/projects',
    });
  });

  it('theme returns a toggle-theme effect', () => {
    const r = runCommand('theme');
    expect(r.effect).toEqual({ kind: 'toggle-theme' });
  });

  it('clear returns the special clear marker', () => {
    expect(runCommand('clear').output).toBe('__CLEAR__');
  });
});
