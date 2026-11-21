'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import {
  restoreDefaultProfileImageAction,
  saveProfileImageAction,
  saveProfilePositionAction,
  type ProfileImageState,
} from '@/lib/actions/profile-image';

const INITIAL: ProfileImageState = { ok: false, error: '' };

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = 'image/jpeg,image/png,image/webp';

type Props = {
  /** Whether a custom portrait is currently stored. */
  hasCustomImage: boolean;
  /** The current CSS object-position, e.g. "50% 30%". */
  position: string;
  /** Version token used to bust the hero image cache. */
  version: string;
};

export function ProfileImageManager({
  hasCustomImage,
  position,
  version,
}: Props) {
  const [state, formAction, isPending] = useActionState(
    saveProfileImageAction,
    INITIAL,
  );
  const [cropState, cropAction, cropPending] = useActionState(
    saveProfilePositionAction,
    INITIAL,
  );
  const [restoreState, restoreAction, restorePending] = useActionState(
    restoreDefaultProfileImageAction,
    INITIAL,
  );

  const [preview, setPreview] = useState<string | null>(null);
  const [previewPosition, setPreviewPosition] = useState(position);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Revoke the last object URL so we don't leak blob URLs.
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  // A successful upload means the stored image changed — drop the local
  // preview so the hero preview falls back to the freshly served file.
  useEffect(() => {
    if (state.ok && pendingFile) {
      setPreview(null);
      setPendingFile(null);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      if (inputRef.current) inputRef.current.value = '';
    }
  }, [state, pendingFile]);

  // A successful restore also invalidates the preview.
  useEffect(() => {
    if (restoreState.ok) {
      setPreview(null);
      setPendingFile(null);
      setPreviewPosition('50% 30%');
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      if (inputRef.current) inputRef.current.value = '';
    }
  }, [restoreState]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0];
    setLocalError(null);
    if (!file) {
      setPendingFile(null);
      return;
    }

    // Client-side validation for fast feedback. The server re-validates
    // authoritatively — this is only a courtesy check.
    if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) {
      setLocalError('Unsupported file type. Use JPG, PNG or WebP.');
      setPendingFile(null);
      e.currentTarget.value = '';
      return;
    }
    if (file.size > MAX_BYTES) {
      setLocalError('Image is too large. The maximum is 5 MB.');
      setPendingFile(null);
      e.currentTarget.value = '';
      return;
    }

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setPreview(url);
    setPendingFile(file);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    setLocalError(null);
    if (!pendingFile) {
      e.preventDefault();
      setLocalError('Choose an image to upload.');
      return;
    }
    // Simulated upload progress. A real percentage is not observable
    // for a multipart fetch without XHR progress events, so we show an
    // indeterminate-ish 0 → 90 → 100 ramp around the submit.
    setProgress(10);
    const timer = setInterval(() => {
      setProgress((p) => (p === null ? p : Math.min(90, p + 18)));
    }, 120);
    e.currentTarget.addEventListener(
      'submit',
      () => {
        clearInterval(timer);
        setProgress(100);
      },
      { once: true },
    );
  }

  function handleCancel() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setPreview(null);
    setPendingFile(null);
    setLocalError(null);
    setProgress(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  const previewSrc = preview ?? `/profile-image?v=${version}`;
  const busy = isPending || cropPending || restorePending;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between">
        <h2 className="heading-display text-2xl">
          <span className="text-fg">Profile image</span>
        </h2>
        <span className="font-mono text-xs text-accent">08</span>
      </div>

      <p className="text-sm text-muted">
        Upload the portrait that appears in the hero. It is stored in the
        database, so it survives refreshes, sign-out/sign-in and redeploys —
        and the live site updates without a code change.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* A — current image + hero preview */}
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
          <h3 className="font-mono text-xs uppercase tracking-widest text-muted">
            Current image
          </h3>
          <div className="flex items-center gap-4">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-accent/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewSrc}
                alt="Current profile portrait"
                className="h-full w-full object-cover"
                style={{ objectPosition: previewPosition }}
              />
            </div>
            <div className="flex flex-col gap-1 text-sm">
              <span className={hasCustomImage ? 'text-accent' : 'text-muted'}>
                {hasCustomImage ? 'Custom portrait active' : 'Using the default portrait'}
              </span>
              <span className="font-mono text-xs text-muted">
                /images/profile.jpg
              </span>
            </div>
          </div>

          <div className="mt-2 flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-muted">
              Hero preview
            </span>
            <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-full border-2 border-accent/50 shadow-[0_0_30px_var(--color-accent-glow)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewSrc}
                alt="Hero preview of the profile portrait"
                className="h-full w-full object-cover"
                style={{ objectPosition: previewPosition }}
              />
            </div>
          </div>
        </div>

        {/* B/C — upload, preview, crop */}
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
          <form
            ref={formRef}
            action={formAction}
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-xs uppercase tracking-widest text-muted">
                Upload new image
              </span>
              <input
                ref={inputRef}
                type="file"
                name="profileImage"
                accept={ACCEPT}
                onChange={handleFileChange}
                className="block w-full text-sm text-fg-2 file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-bg hover:file:opacity-90"
              />
              <span className="text-xs text-muted">
                JPG, PNG or WebP · max 5 MB · a square image works best
              </span>
            </div>

            <input
              type="hidden"
              name="position"
              value={previewPosition}
            />

            {progress !== null ? (
              <div
                className="flex flex-col gap-1.5"
                role="status"
                aria-live="polite"
              >
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-accent transition-[width] duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="font-mono text-xs text-muted">
                  uploading… {progress}%
                </span>
              </div>
            ) : null}

            {localError ? (
              <p className="text-sm text-[color:var(--color-danger)]">
                {localError}
              </p>
            ) : null}
            {state.ok === false && state.error ? (
              <p className="text-sm text-[color:var(--color-danger)]">
                {state.error}
              </p>
            ) : null}
            {state.ok === true && state.message ? (
              <p className="text-sm text-accent">✓ {state.message}</p>
            ) : null}

            {/* D — actions */}
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={busy || !pendingFile}
                aria-busy={isPending}
                className="btn-primary"
              >
                {isPending ? 'uploading…' : 'upload & save'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={busy || !pendingFile}
                className="btn-outline"
              >
                cancel
              </button>
            </div>
          </form>

          {/* Crop / reposition */}
          <form action={cropAction} className="flex flex-col gap-3 border-t border-border pt-4">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-xs uppercase tracking-widest text-muted">
                Reposition crop
              </span>
              <span className="font-mono text-xs text-fg-2">
                {previewPosition}
              </span>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-muted">Horizontal</span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={parsePositionPart(previewPosition, 0)}
                onChange={(e) =>
                  setPreviewPosition(
                    `${e.currentTarget.value}% ${parsePositionPart(previewPosition, 1)}%`,
                  )
                }
                className="accent-[color:var(--color-accent)]"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-muted">Vertical</span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={parsePositionPart(previewPosition, 1)}
                onChange={(e) =>
                  setPreviewPosition(
                    `${parsePositionPart(previewPosition, 0)}% ${e.currentTarget.value}%`,
                  )
                }
                className="accent-[color:var(--color-accent)]"
              />
            </label>
            <input type="hidden" name="position" value={previewPosition} />
            {cropState.ok === false && cropState.error ? (
              <p className="text-sm text-[color:var(--color-danger)]">
                {cropState.error}
              </p>
            ) : null}
            {cropState.ok === true && cropState.message ? (
              <p className="text-sm text-accent">✓ {cropState.message}</p>
            ) : null}
            <button
              type="submit"
              disabled={cropPending}
              aria-busy={cropPending}
              className="btn-outline self-start"
            >
              {cropPending ? 'saving…' : 'save crop'}
            </button>
          </form>

          {/* Restore default */}
          <form action={restoreAction} className="border-t border-border pt-4">
            {restoreState.ok === false && restoreState.error ? (
              <p className="mb-2 text-sm text-[color:var(--color-danger)]">
                {restoreState.error}
              </p>
            ) : null}
            {restoreState.ok === true && restoreState.message ? (
              <p className="mb-2 text-sm text-accent">✓ {restoreState.message}</p>
            ) : null}
            <button
              type="submit"
              disabled={restorePending}
              aria-busy={restorePending}
              className="btn-outline"
            >
              {restorePending ? 'restoring…' : 'restore default image'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function parsePositionPart(position: string, index: 0 | 1): number {
  const parts = position.split(/\s+/);
  const raw = Number.parseInt(parts[index] ?? '50', 10);
  return Number.isFinite(raw) ? raw : 50;
}
