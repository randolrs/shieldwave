import posthog from 'posthog-js';

const POSTHOG_KEY =
  import.meta.env.VITE_POSTHOG_KEY ||
  'phc_vk1Z7aobzwGucaHIdvHPdI8RIat6JXkdAw6m2CJYshi';

const POSTHOG_HOST =
  import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

let initialized = false;

export function initAnalytics() {
  if (initialized || typeof window === 'undefined') return;
  if (!POSTHOG_KEY) return;
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: false,
  });
  initialized = true;
}

export function track(event, properties = {}) {
  if (!initialized) return;
  posthog.capture(event, properties);
}

export function identify(distinctId, properties = {}) {
  if (!initialized) return;
  posthog.identify(distinctId, properties);
}

export function setPersonProperties(properties = {}) {
  if (!initialized) return;
  posthog.setPersonProperties(properties);
}

export function getDistinctId() {
  if (!initialized) return null;
  return posthog.get_distinct_id();
}
