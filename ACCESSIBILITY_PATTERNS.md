# Accessibility patterns used in this codebase

Purpose: Keep interactive components keyboard- and screen-reader-friendly by default.

1) Use semantic elements
- Prefer <button> for clickable actions; avoid clickable <div>.
- Provide type="button" on buttons inside forms.

2) Keyboard focus visibility
- Add focus-visible styles:
  - focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--bb-focus-ring)]
- Brand alignment: a11y.css defines --bb-focus-ring (defaults to blue-500). Override per theme to match brand.
- High contrast: forced-colors media query switches to system Highlight.

3) Labels and roles
- Use aria-label or aria-labelledby to describe icon-only controls.
- For status/indicators (e.g., affiliate-supported), include aria-label and title.

4) Disabled states
- Disable buttons when not actionable; ensure styles reflect disabled state.

5) Click handling
- Keep onClick lightweight and pure; avoid key handling on <button> since it is native.

6) Performance
- Memoize derived data (useMemo) and component (React.memo) when props are stable.

7) Testing
- Keyboard-only: Tab/Shift+Tab through UI, verify visible focus.
- Screen readers: NVDA/VoiceOver readouts include labels and state.
- Automated linting: enable eslint-plugin-jsx-a11y to catch regressions early.
- High contrast: test with Windows High Contrast / macOS increase contrast.
- Virtualization: if lists are long, consider react-virtualized/react-window to keep focus management performant.

8) Repository hygiene
- Run an audit for clickable <div>/<span> and migrate to <button>/<a> where appropriate.
- Prefer role="link" with <a> for navigation; role="button" should be avoided when native elements are available.

9) Design tokens and theming
- Sync --bb-focus-ring with your design tokens (Tailwind config or CSS variables) during branding updates.
- Centralize token definitions so components inherit consistent focus styles.

10) Release checklist (a11y)
- Automated: run eslint-plugin-jsx-a11y and the clickable div audit script.
- Manual: keyboard-only walkthrough (focus order, traps, visible focus), screen reader smoke test (NVDA/VoiceOver), high-contrast check.
- Regression watch: verify key interactive surfaces (nav, modals, lists/cards, forms) each release.

Example: StreamingPlatformsDisplay
- Semantic buttons for platforms
- ARIA labels on buttons and icon
- Focus-visible ring for keyboard users
- Memoized slice of platforms and component export
