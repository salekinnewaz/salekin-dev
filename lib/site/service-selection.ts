'use client';

import { useEffect, useState } from 'react';

/**
 * Shared "selected service" channel.
 *
 * The Services section and the Contact form live in different parts of
 * the tree, and the Contact form itself may be rendered on the server.
 * Rather than thread a callback through several layers, this module
 * owns a tiny pub/sub channel: any component can publish a service id
 * and the Contact form subscribes to it.
 *
 * This is what makes "Request This Service →" work end to end — the
 * service card publishes its id, the contact form preselects the
 * matching pill, and the page scrolls to #contact.
 */

const EVENT = 'salekin-dev:select-service';

/** Publish a service id so the contact form can preselect it. */
export function selectService(serviceId: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<string>(EVENT, { detail: serviceId }),
  );
}

/**
 * Scroll to the contact section. The scroll is delegated to the
 * browser's native smooth-scroll so it respects
 * `scroll-padding-top` and lands the section heading below the
 * floating navbar rather than under it.
 */
export function scrollToContact(): void {
  if (typeof document === 'undefined') return;
  const target = document.getElementById('contact');
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * The combined "request this service" action: preselect the service
 * pill in the contact form and scroll to the contact section.
 */
export function requestService(serviceId: string): void {
  selectService(serviceId);
  // Wait a frame so the contact form has applied the selection before
  // the browser starts the smooth scroll — otherwise the user can
  // arrive before the pill highlight has landed.
  if (typeof window === 'undefined') return;
  window.requestAnimationFrame(() => {
    scrollToContact();
  });
}

/**
 * Subscribe to service selections. Returns the current value and
 * updates it when a new selection is published.
 */
export function useSelectedService(): [string, (id: string) => void] {
  const [selected, setSelected] = useState('');

  useEffect(() => {
    function onSelect(e: Event) {
      const detail = (e as CustomEvent<string>).detail;
      if (typeof detail === 'string' && detail) {
        setSelected(detail);
      }
    }
    window.addEventListener(EVENT, onSelect);
    return () => window.removeEventListener(EVENT, onSelect);
  }, []);

  return [selected, setSelected];
}
