# Davud Idrisov — Portfolio

A personal portfolio for my SITE 1101: Principles of Information Systems course.
I’m a first-year Electrical and Electronics Engineering student at ADA University.
This site brings together my background, coursework, projects, and an interactive
resume game.

**Live site:** [davud09.github.io](https://davud09.github.io/) ·
**Source:** [github.com/Davud09/Davud09.github.io](https://github.com/Davud09/Davud09.github.io)

## What’s on the site

### Home and Signal Lab

The homepage has an ambient navy background with electric-blue and teal lighting,
a subtle grid and grain, PCB-inspired traces, and liquid-glass controls. Typography,
colors, radii, blur, shadows, and motion settings are centralized in CSS custom
properties. The design includes solid fallbacks, visible keyboard focus, light/dark
themes, and reduced-motion and reduced-transparency accommodations.

The **Signal Lab** is a six-stage interactive puzzle:

1. Series switches
2. Parallel switches
3. NOT gate
4. AND gate
5. OR gate
6. Timed NAND input sequence

It includes a live truth table, optional sound (off by default), reset controls, and
a virtual multimeter fault-finding exercise for open circuit, dead bulb, or reversed
LED. Clicking the lamp ten times quickly triggers the “Check your resistor value”
Easter egg.

The page-interactive readout uses the browser Navigation Timing API; its result
depends on the visitor’s device and browser.

### About

The About page includes engineering skills with visual meters, a Python → C++ →
Assembly learning sequence, education and experience, an illustrative (not to scale)
hiking map, weighted calisthenics records, languages, and a contact section with
GitHub and LinkedIn links. The resume can be printed or saved as PDF through the
browser print dialog. A hidden squirrel-house button awards a one-time 50 XP bonus
to the workshop.

### Projects and project notebooks

Project cards are loaded from [`assets/data/projects.json`](assets/data/projects.json).
The SITE 1101 breadboard project is complete; Hour of Code and Robotics are listed as
upcoming. The breadboard team project video is linked from its card. Project detail
pages show the problem, parts, schematic status, debugging notes, and lessons learned.
Details not present in the source notes are explicitly marked as undocumented rather
than guessed.

The portfolio also includes a **Repair Log** landing page. It describes the kinds of
repair work recorded in my background, but does not invent a specific failure or
repair story: individual case notes have not yet been documented.

### Field Workshop

The Field Workshop is a keyboard- and touch-operable interactive resume with map
stations, saved XP, achievements, practice exercises, best times, and an accessibility
mode. Practice activities include:

- Choosing a screwdriver and reconnecting a ribbon cable (practice simulation)
- Ordering the intake, compression, power, and exhaust strokes
- A swimming-start reaction exercise
- An eight-segment illustrative hiking elevation sampler

The game supports keyboard, on-screen touch controls, swipe movement, and gamepads
where supported by the browser. Accessibility mode removes reaction timing and
enlarges controls/text. Workshop progress and personal-best exercise times are saved
locally in the browser. At 100 XP, a bonus contact panel is revealed.

### Navigation and extra pages

- Press `/` or `Ctrl+K` (or `Command+K` on macOS) to open the keyboard destination
  palette.
- [`404.html`](404.html) is the GitHub Pages not-found page.
- [`secret.html`](secret.html) is an unlisted Easter-egg page with the Workshop
  full-tour hint; its route is mentioned in a source comment.

## Easter eggs

- Type `VOLT` on your keyboard on any page for a brief workshop power-up.
- Toggle the theme switch five times quickly for a voltage surprise.
- Click the site name five times quickly for a resistor color-code quiz.
- Click the Signal Lab lamp ten times quickly for a burnout animation and
  “Check your resistor value” message.
- Enter the Konami code (`↑ ↑ ↓ ↓ ← → ← → B A`) to toggle the green oscilloscope theme.
- Type `sudo hire davud` for a resume/contact shortcut.
- Open DevTools for a short console greeting.
- Find the squirrel-house button on the About page for a one-time 50 XP bonus.

The visual effects respect reduced-motion preferences.

## Wishlist items not implemented yet

These are not included in the current version:

- A complete AZ / EN / TR / RU language switcher and translated page content.
- A downloadable, pre-generated resume PDF. The current resume action opens the
  browser print dialog, where it can be saved as PDF.
- An email address or contact form. The contact section links to GitHub and LinkedIn;
  no email address has been supplied for publication.
- Specific personal repair/debug stories. The Repair Log and project notebooks call
  out missing facts instead of making them up.
- Personal hiking memories or a geographically accurate map. The map is illustrative
  and not to scale.
- A birthday/date-specific Easter egg. No special date was provided.

## Built with

- HTML, CSS, and vanilla JavaScript
- JSON project data
- Google Fonts: DM Sans, Instrument Serif, and IBM Plex Mono
- GitHub Pages

There is no build step, framework, or package installation.

## Run locally

The projects and project detail pages load JSON data, so run the site through a local
HTTP server rather than opening HTML files directly. From the repository folder:

```powershell
python -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000) and stop the server with
`Ctrl+C`.

## Project files

```text
.
├── about.html
├── 404.html
├── index.html
├── project.html
├── projects.html
├── quest.html
├── repair-log.html
├── secret.html
├── content.md
└── assets/
    ├── css/       # Shared and page-specific styles
    ├── data/      # Project-card and project-detail data
    ├── images/    # Profile photo, favicon, grain, and screenshots
    └── js/        # Navigation, theme, page behavior, and workshop game
```

## Contact

- [GitHub profile](https://github.com/Davud09)
- [LinkedIn](https://www.linkedin.com/in/davud-idrisov-333a382b0/)
