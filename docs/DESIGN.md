# Design system

The look is a magazine with Gen-Z energy: a black "darkroom" masthead with black-and-white photo prints, tape, handwritten notes and doodles, over clean editorial sections. Each of the six teams has its own color, and yellow is the single accent for marks and actions.

Interactive reference: [docs/design/demo.html](design/demo.html) (open it in a browser). All tokens live at the top of `src/app/globals.css`.

## Type

| Role | Font | Use |
| --- | --- | --- |
| Display | Instrument Serif | Masthead, section headings, names. Italic for emphasis |
| Body and UI | Bricolage Grotesque | Running text, buttons, labels |
| Notes | Caveat | Handwritten notes on photos only, never for information |
| Meta | JetBrains Mono | Dates, counts, statuses, small labels |
| Hindi | Tiro Devanagari Hindi | विविध and any Hindi text |

All are loaded with `next/font`, so they're self-hosted with no request to Google at runtime.

Scale: masthead `clamp(96px, 16vw, 210px)`, section heading `clamp(48px, 6.6vw, 80px)`, card title 20–30 px, body 17/1.6, labels 12–13 px uppercase with letter-spacing.

## Color

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--paper` | `#FFFFFF` | `#0B0B0C` | Page background |
| `--ink` | `#0B0B0C` | `#F4F4F1` | Text, borders, primary buttons |
| `--muted` | `#66666E` | `#9B9BA3` | Secondary text |
| `--rule` | `#E3E3E6` | `#26262B` | Dividers |
| `--raise` | `#F3F3F4` | `#151517` | Raised bands |
| `--accent` | `#FFD400` | same | Doodles, underlines, focus ring, hover shadow |

The masthead (`.darkroom`) is always dark in both themes.

Team colors are used on team cards, chips and stickers, always with the text color listed:

| Team | Color | Text on it |
| --- | --- | --- |
| Leadership | `#2F4BFF` | white |
| Ideation | `#FFD400` | black |
| Content Writing | `#2BD98F` | black |
| Creative Making | `#FF7A1A` | black |
| Videography & Photography | `#38BDF8` | black |
| Editing | `#8B5CF6` | white |

Status colors in the admin console are separate from these: pending amber, approved green, rejected red, each paired with a text label so color is never the only signal.

## Motion

Rich, but every animation stops under `prefers-reduced-motion`.

| Motion | Timing |
| --- | --- |
| Masthead letters rise; the swoosh draws under them | 0.9 s, then 1.2 s |
| Hero prints drift on scroll (parallax) | continuous |
| Star wobbles, sparkle twinkles | 3–4 s loops |
| Team ticker | 36 s loop |
| Circles and underlines draw in when scrolled into view | 1.3 s |
| Stat numbers count up when scrolled into view | 1.2 s |
| Cards lift and tilt on hover | 0.3 s |

Content is always visible at rest. Scroll reveals start from a visible but offset state and only apply to things below the first screen.

## Components

Plain CSS classes in `globals.css`: `.pill` (buttons), `.print` (taped photo), `.note` (handwritten card), `.tcard` (team card), `.chip`, `.tile` (photo grid), `.status`, `.form`, `.table`. Shared client components are limited to `Motion` (reveals, parallax, count-up), `ThemeToggle`, `Lightbox` and `Uploader`.

## Photos

The home page collage (`public/home/`) and team cards (`public/teams/`) currently use stand-in crops from the design mockup. Replace them with real club photos at the same file names: black-and-white works best for the collage, and the team cards are tinted by their team color.

## Accessibility

- Contrast 4.5:1 or more for text; team colors always use the text color from the table.
- Visible focus ring (accent outline) on every interactive element.
- Every public image needs alt text; the upload form asks for it.
- Every form works without JavaScript, except the uploader and lightbox.
- Usable at 360 px wide; nothing scrolls sideways.
