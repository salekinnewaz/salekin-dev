'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import {
  restoreDefaultProfileImageAction,
  saveProfileImageAction,
  saveProfilePositionAction,
  type ProfileImageState,
} from '@/lib/actions/profile-image';
import { DEFAULT_PROFILE_IMAGE, type ProfileImageMode } from '@/lib/constants';

const INITIAL: ProfileImageState = { ok: false, error: '' };

/**
 * 3 MB of raw binary.
 *
 * The hosting platform rejects request bodies over about 4.5 MB with a
 * bare HTTP 413, before the server action ever runs. A 5 MB limit
 * would therefore be unreachable in production — the admin would see a
 * platform error instead of a readable message — so the limit is set
 * below that ceiling and kept in step with the server-side check in
 * `lib/actions/profile-image.ts`.
 */
const MAX_BYTES = 3 * 1024 * 1024;
const ACCEPT = 'image/jpeg,image/png,image/webp';

/**
 * The size of the hero preview box, and the scale applied to the real
 * hero composition inside it. The composition is the *actual* hero
 * markup — the same `.hero-portrait-stage` / `.hero-portrait-frame` /
 * `.hero-portrait` classes the public page uses — scaled down, so the
 * admin judges the crop against exactly what visitors will see.
 */
const PREVIEW_WIDTH = 260;
const PREVIEW_HEIGHT = 260;
const PREVIEW_SCALE = 0.42;

type Props = {
  /** Whether a custom portrait is currently stored. */
  hasCustomImage: boolean;
  /** The current CSS object-position, e.g. "50% 30%". */
  position: string;
  /** Version token used to bust the hero image cache. */
  version: string;
  /** How the portrait is currently rendered in the hero. */
  mode: ProfileImageMode;
};

export function ProfileImageManager({
  hasCustomImage,
  position,
  version,
  mode,
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
  const [localError, setLocalError] = useState<string | null>(null);
  /**
   * The render mode for the *preview*. It follows the stored mode
   * until the admin picks a different one for the pending upload.
   */
  const [previewMode, setPreviewMode] = useState<ProfileImageMode>(mode);

  const inputRef = useRef<HTMLInputElement>(null);
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
      setPreviewMode('cutout');
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
      setLocalError('Image is too large. The maximum is 3 MB.');
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

  function handleCancel() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setPreview(null);
    setPendingFile(null);
    setLocalError(null);
    setPreviewMode(mode);
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* A — current image + hero preview */}
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
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
                {hasCustomImage
                  ? 'Custom portrait active'
                  : 'Using the default portrait'}
              </span>
              <span className="font-mono text-xs text-muted">
                {hasCustomImage ? '/profile-image' : DEFAULT_PROFILE_IMAGE}
              </span>
              <span className="font-mono text-xs text-muted">
                rendering: {previewMode}
              </span>
            </div>
          </div>

          {/*
            The hero preview.

            This is the *actual* hero composition — the same
            `.hero-portrait-stage` / `.hero-portrait-frame` /
            `.hero-portrait` classes the public page renders — scaled
            down and clipped. Reusing the real classes is the point: a
            generic square preview box would not show the admin how the
            crop interacts with the tilted frame, which is the thing
            they are actually adjusting.
          */}
          <div className="mt-1 flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-muted">
              Hero preview
            </span>
            <div
              className="relative overflow-hidden rounded-xl border border-border bg-[var(--color-bg)]"
              style={{ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT }}
            >
              <div
                className="hero-portrait-stage"
                style={{
                  width: PREVIEW_WIDTH / PREVIEW_SCALE,
                  height: PREVIEW_HEIGHT / PREVIEW_SCALE,
                  transform: `scale(${PREVIEW_SCALE})`,
                  transformOrigin: 'top left',
                  minHeight: 0,
                }}
              >
                <div
                  aria-hidden="true"
                  className="hero-portrait-frame pointer-events-none absolute inset-0"
                />
                <div className="hero-portrait" data-mode={previewMode}>
                  {previewMode === 'photo' ? (
                    <div className="hero-portrait-photo-clip">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewSrc}
                        alt="Hero preview of the profile portrait"
                        className="relative h-full w-full object-cover"
                        style={{ objectPosition: previewPosition }}
                      />
                    </div>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={previewSrc}
                      alt="Hero preview of the profile portrait"
                      className="relative h-full w-full object-contain object-bottom"
                      style={{ objectPosition: previewPosition }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* B/C — upload, preview, crop */}
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
          <form action={formAction} className="flex flex-col gap-4">
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
                JPG, PNG or WebP · max 3 MB (the hosting platform caps
                request bodies at 4.5 MB) · a square image works best
              </span>
            </div>

            <input type="hidden" name="position" value={previewPosition} />
            <input type="hidden" name="mode" value={previewMode} />

            {/*
              An honest progress indicator.

              A real byte-level percentage is not observable for a
              server-action upload — React owns the request, so the
              component has no handle on it. The old UI faked a 10 → 90
              → 100 ramp, which misrepresented what was happening. An
              indeterminate bar driven by the action's own `isPending`
              flag says exactly what is true: work is in flight.
            */}
            {isPending ? (
              <div
                className="flex flex-col gap-1.5"
                role="status"
                aria-live="polite"
              >
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                  <div className="h-full w-1/3 animate-pulse rounded-full bg-accent" />
                </div>
                <span className="font-mono text-xs text-muted">
                  uploading…
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

          {/* Render mode */}
          <fieldset className="flex flex-col gap-2 border-t border-border pt-4">
            <legend className="font-mono text-xs uppercase tracking-widest text-muted">
              Render as
            </legend>
            <div className="flex flex-col gap-2">
              <label className="flex items-baseline gap-2 text-sm">
                <input
                  type="radio"
                  name="previewMode"
                  value="cutout"
                  checked={previewMode === 'cutout'}
                  onChange={() => setPreviewMode('cutout')}
                  className="accent-[color:var(--color-accent)]"
                />
                <span className="shrink-0 text-fg-2">Cut-out</span>
                <span className="text-xs text-muted">
                  — a transparent subject standing on the tilted frame
                </span>
              </label>
              <label className="flex items-baseline gap-2 text-sm">
                <input
                  type="radio"
                  name="previewMode"
                  value="photo"
                  checked={previewMode === 'photo'}
                  onChange={() => setPreviewMode('photo')}
                  className="accent-[color:var(--color-accent)]"
                />
                <span className="shrink-0 text-fg-2">Photo</span>
                <span className="text-xs text-muted">
                  — an opaque image filling the tilted frame
                </span>
              </label>
            </div>
            <p className="text-xs text-muted">
              The uploaded image is used exactly as it is — the background
              is never removed automatically. Upload a transparent PNG for
              a cut-out, or a JPG for a photo.
            </p>
          </fieldset>

          {/* Crop / reposition */}
          <form
            action={cropAction}
            className="flex flex-col gap-3 border-t border-border pt-4"
          >
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
