## 2026-01-25 - [Accessibility Gaps in Form & Lists]
**Learning:** Initial components relied heavily on placeholders and lacked semantic labels or ARIA descriptions for icon-only actions, which prevents screen readers from effectively navigating the task management interface.
**Action:** Always wrap form inputs in a div with a semantic <Label> and provide aria-label/title attributes to all icon-only buttons to ensure a baseline of accessibility and improved hover UX.

## 2025-05-15 - [Improving Feedback & Accessibility with Tooltips]
**Learning:** Icon-only buttons benefit greatly from tooltips that explain their state, especially when disabled. Native 'title' attributes are often insufficient for accessibility and styling.
**Action:** Use Radix UI Tooltip components with specific messages for disabled states (e.g., explaining WHY a button is disabled) to improve user understanding. Wrap disabled elements in a <span> to ensure the tooltip triggers correctly.
