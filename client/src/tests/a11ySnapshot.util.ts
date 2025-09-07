// a11ySnapshot.util.ts - utility to capture role/attribute snapshot for quick regression detection
import { screen } from '@testing-library/react';

export function getA11ySnapshot() {
  const snapshot: Record<string, any[]> = {};
  // Query for all known roles; fallback to generic scan if needed
  const root = document.body;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  while (walker.nextNode()) {
    const el = walker.currentNode as HTMLElement;
    const role = el.getAttribute('role');
    if (!role) continue;
    if (!snapshot[role]) snapshot[role] = [];
    snapshot[role].push({
      tag: el.tagName.toLowerCase(),
      id: el.id || undefined,
      label: el.getAttribute('aria-label') || undefined,
      expanded: el.getAttribute('aria-expanded') || undefined,
      activedescendant: el.getAttribute('aria-activedescendant') || undefined,
      autocomplete: el.getAttribute('aria-autocomplete') || undefined,
    });
  }
  return snapshot;
}

export function diffSnapshots(prev: Record<string, any[]>, next: Record<string, any[]>) {
  const diff: any = {};
  const roles = new Set([...Object.keys(prev), ...Object.keys(next)]);
  for (const r of Array.from(roles)) {
    const a = JSON.stringify(prev[r] || []);
    const b = JSON.stringify(next[r] || []);
    if (a !== b) diff[r] = { before: prev[r] || [], after: next[r] || [] };
  }
  return diff;
}
