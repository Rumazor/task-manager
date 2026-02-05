## 2025-05-22 - Spanish Tildes and ARIA labels in icon-only buttons

**Learning:** In this application, many Spanish UI strings were missing proper accentuation (tildes), especially in common words like "Día", "más", "Mañana", "descripción", and "Búsqueda". Additionally, several icon-only buttons (notification bell, calendar navigation, filter toggle) lacked ARIA labels, making them inaccessible to screen readers.

**Action:** Always check for proper Spanish accentuation in UI text and ensure every icon-only button has an `aria-label` or a screen-reader-only span.
