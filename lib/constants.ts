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

/**
 * How the hero renders the portrait.
 *
 * `cutout` — the image has an alpha channel, so the subject stands on
 *   the tilted frame with the page background showing through. The
 *   image is letterboxed into the frame (`object-fit: contain`).
 * `photo` — the image is opaque, so it fills the tilted frame and is
 *   cropped to the frame's shape (`object-fit: cover`).
 */
export type ProfileImageMode = 'cutout' | 'photo';

/** The mode the shipped default cut-out renders in. */
export const DEFAULT_PROFILE_MODE: ProfileImageMode = 'cutout';

/** The `Setting` keys the profile-image feature owns. */
export const PROFILE_IMAGE_SETTING_KEYS = {
  /** The base64 data URI of the stored portrait. Empty = use the default. */
  image: 'profile_image',
  /** The `object-position` crop, e.g. "50% 30%". */
  position: 'profile_image_position',
  /** "true" when the stored image carries an alpha channel. */
  hasAlpha: 'profile_image_has_alpha',
  /** "true" when a custom portrait is stored (the image row may be empty). */
  isSet: 'profile_image_set',
  /** An explicit admin override of the render mode, when set. */
  mode: 'profile_image_mode',
} as const;

/**
 * The Calendly scheduling page for the 30-minute discovery call.
 *
 * The booking CTA in the Services section links straight here, so a
 * visitor can take a slot without composing a message first. The
 * contact form stays available for people who would rather write
 * their brief out.
 */
export const DISCOVERY_CALL_URL =
  'https://calendly.com/salekinnewaz0/30min';
