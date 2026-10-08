'use client';

import { useActionState } from 'react';
import {
  markContactReadAction,
  type MarkContactReadState,
} from '@/lib/actions/contacts';

const INITIAL: MarkContactReadState = { ok: false, error: '' };

type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string; // serialized
  read: boolean;
};

type AdminMessagesProps = {
  messages: Message[];
};

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} · ${d
    .getHours()
    .toString()
    .padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export function AdminMessages({ messages }: AdminMessagesProps) {
  if (messages.length === 0) {
    return (
      <p className="text-sm text-muted">
        No contact submissions yet. They&apos;ll show up here when someone
        fills out the form.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {messages.map((m) => (
        <MessageRow key={m.id} message={m} />
      ))}
    </ul>
  );
}

function MessageRow({ message }: { message: Message }) {
  const [, formAction, isPending] = useActionState(
    markContactReadAction,
    INITIAL,
  );

  return (
    <li
      className={
        'glass-card p-5 transition-opacity ' +
        (message.read ? 'opacity-60' : '')
      }
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <div className="flex flex-col gap-0.5">
          <p className="font-mono text-sm font-semibold text-fg">
            {message.name}
            <span className="ml-2 text-xs text-muted">
              {message.email}
            </span>
          </p>
          <p className="text-xs text-muted">{formatDate(message.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          {message.read ? (
            <span className="font-mono text-xs uppercase tracking-widest text-muted">
              ✓ read
            </span>
          ) : (
            <form action={formAction}>
              <input type="hidden" name="id" value={message.id} />
              <button
                type="submit"
                disabled={isPending}
                aria-busy={isPending}
                className="font-mono text-xs uppercase tracking-widest text-accent hover:text-accent-2 disabled:opacity-50"
              >
                {isPending ? 'saving…' : 'mark as read'}
              </button>
            </form>
          )}
        </div>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-fg-2">
        {message.message}
      </p>
      <p className="mt-3 flex flex-wrap gap-3">
        <a
          href={`mailto:${message.email}`}
          className="btn-outline !py-1.5 !text-xs"
        >
          reply
        </a>
      </p>
    </li>
  );
}