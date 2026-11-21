/**
 * The shipped default portrait.
 *
 * A cut-out PNG with a real alpha channel — the studio backdrop of the
 * original photo is removed at build time by
 * `scripts/cutout-portrait.swift`, so the hero can show the subject
 * standing on the tilted frame rather than a rectangular photo.
 *
 * Every fallback path points here: the public route's redirect, the
 * hero's default `src`, and the admin panel's preview.
 */
export const DEFAULT_PROFILE_IMAGE = '/images/profile-cutout.png';

/** The crop applied when nothing has been saved by an admin. */
export const DEFAULT_PROFILE_POSITION = '50% 30%';
