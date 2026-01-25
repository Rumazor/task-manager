## 2026-01-25 - [Accessibility Gaps in Form & Lists]
**Learning:** Initial components relied heavily on placeholders and lacked semantic labels or ARIA descriptions for icon-only actions, which prevents screen readers from effectively navigating the task management interface.
**Action:** Always wrap form inputs in a div with a semantic <Label> and provide aria-label/title attributes to all icon-only buttons to ensure a baseline of accessibility and improved hover UX.
