# ADR-0008: UX polish improvements for product catalogue

## Status

Accepted

## Context

Lighthouse audit scores are strong (Accessibility: 100, Best Practices: 100), but the catalogue UI lacks visual polish for sighted users. Seven gaps were identified: invisible result count (sr-only), no search clear button, lowercase category names, static cards with no hover feedback, no image fallback, plain text ratings, and no active filter indicator.

## Decisions

### Visible result count

The result count was `srOnly` — useful for screen readers but invisible to sighted users. Changed to a visible `<Text>` element while keeping `aria-live="polite"` and `aria-atomic="true"` so both audiences benefit.

### Search clear button

Added an `×` (CloseButton) inside the search input via Chakra v3 `Group` + `InputElement`. Only appears when the input has a value. Added right padding to prevent text/button overlap.

### Capitalized category names

Added `textTransform="capitalize"` to the category select field and category badges. Changed the "all" option display text to "All categories" for clarity while keeping `value="all"` unchanged.

### Card hover/focus effects

Added `transition`, `_hover`, and `_focusWithin` props to `Card.Root` for a subtle lift effect (shadow + translateY). Both mouse and keyboard users get visual feedback.

### Image fallback

When an image fails to load, a placeholder `Flex` shows the product's initial letter on a gray background. The fallback is `aria-hidden` since the product name is already in the card body. Uses `useState` to track error state per card.

### Visual star rating

Replaced plain "Rating: 4.5/5" with unicode stars (★/☆) rounded to nearest integer, followed by the numeric value. Stars are `aria-hidden` and colored orange; the numeric "4.5/5" remains the accessible text.

### Active filter indicator

When any filter is active (search query, non-default category, or non-default sort), the Reset button switches from `variant="outline"` to `variant="solid" colorPalette="blue"` and shows the active count, e.g. "Reset (2)".

## Consequences

- **Positive:** Sighted users get immediate feedback on result count, active filters, card interactivity, and rating quality — without degrading the existing accessibility score.
- **Positive:** All changes are CSS/component-level with no new dependencies.
- **Negative:** Unicode stars (★/☆) render slightly differently across OS/browser combinations. Acceptable for a decorative element backed by numeric text.
