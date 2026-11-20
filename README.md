# Davud Idrisov — Portfolio

A personal portfolio for my SITE 1101: Principles of Information Systems course.
I’m a first-year Electrical and Electronics Engineering student at ADA University.
This site brings together my background, coursework, projects, and an interactive
resume game.

**Live site:** [davud09.github.io](https://davud09.github.io/) ·
**Source:** [github.com/Davud09/Davud09.github.io](https://github.com/Davud09/Davud09.github.io)

## The site

### Home

![Desktop screenshot of the homepage, showing my introduction, profile photo, engineering focus, and four-stage Signal Lab circuit challenge](assets/images/homepage.png)

The homepage includes the **Signal Lab**, a four-stage circuit puzzle. Its
accessible voltage controls adjust the circuit from 1 to 12 volts, and the final
stage adds a countdown and a switch sequence. A live readout reports the circuit
state, supply voltage, and whether current is flowing.

### Projects

![Desktop screenshot of the projects page with the completed breadboard project, upcoming Hour of Code and Robotics projects, and portfolio project](assets/images/projects.png)

Project cards are present in the HTML first, so the page still has content when
JavaScript is unavailable. JavaScript enhances them with
[`assets/data/projects.json`](assets/data/projects.json); if that data cannot be
loaded, the static cards remain visible with a retry option. The page includes
the SITE 1101 breadboard project and photos, Hour of Code and Robotics cards
marked **In Progress**, and a project entry for this portfolio. The breadboard
team project video is linked from its card. Project cards show their focus, tools
or components, and status; planned projects use original inline SVG illustrations.
The SITE 1101 carousel starts with the breadboard photo and includes previous/next
controls and pagination dots. Project photos open in a keyboard-operable image
viewer.

## What’s here

- **Home:** introduction, profile photo, engineering focus, and the four-stage
  Signal Lab challenge with circuit telemetry
- **About:** education, practical repair experience, programming skills, activities,
  visible skill-level indicators, animated test scores, languages, interests, and
  contact information
- **Projects:** static project cards enhanced from JSON, in-progress project cards,
  photo gallery, and a retry message if project data cannot be loaded
- **Field Workshop:** a keyboard- and touch-operable interactive resume with map
  stations, arrow-key or WASD movement, clickable station tiles, automatic note
  opening and XP, visited markers, a Re-read control, consolidated live feedback,
  achievements, and a link to the plain resume
- **Contact actions:** a shared Copy email control with a compatibility fallback
  and a Resume (PDF) link on every page
- Hidden keyboard, logo-click, and theme-toggle easter eggs

## Design, accessibility, and performance

- Shared CSS custom properties keep the color palette, spacing, radii, shadows,
  glass effects, and motion timing consistent.
- A reusable liquid-glass treatment is used for navigation, cards, buttons,
  dialogs, the Signal Lab, and Workshop panels. It combines translucent fills,
  blur, borders, highlights, layered shadows, and pointer-following specular
  sheen.
- The glass system has opaque fallbacks for browsers without `backdrop-filter`,
  reduced-transparency support, and forced-colors styling. Blur is reduced on
  narrow screens.
- One button system provides primary, secondary, ghost, and icon variants with
  hover, pressed, focus-visible, disabled, and loading states.
- Page-load and scroll reveals, card interactions, skill indicators, score
  count-ups, circuit stages, Workshop movement, XP, and achievement notices use
  restrained transform/opacity motion. Page navigation uses the View Transitions
  API when available, with a CSS fallback. Motion preferences are respected, and
  pointer sheen updates are scheduled with `requestAnimationFrame`.
- Semantic landmarks, a skip link, visible keyboard focus, labeled controls, and
  keyboard-operable dialogs support accessible navigation. The project image
  dialog restores focus and is hidden from assistive technology while closed.
- Dark and light themes, responsive layouts, canonical and theme-color metadata,
  Open Graph and Twitter cards, a favicon, and an Apple touch icon are included.
- The default theme uses a restrained warm hardware palette; the light theme uses
  warm alabaster surfaces. The palette stays intact when the optional oscilloscope
  easter egg is active.
- The added project photos and portfolio screenshot are compressed. Page images
  have dimensions to reduce layout shifts, below-the-fold images are lazy loaded,
  and the homepage portrait is preloaded.

The easter eggs are optional and do not change the site's pages or core features.

## Built with

- HTML, CSS, and vanilla JavaScript
- JSON project data
- GitHub Pages

There is no build step, framework, or package installation.

## Validation

JavaScript syntax and project JSON were checked. All four pages were checked in
Chromium at 360, 768, 1280, and 1920 pixels for horizontal overflow and one main
heading. The project-data retry fallback, carousel, email-copy feedback, circuit
telemetry, Workshop station selection, XP, and visited state were exercised.
Safari and Firefox have not yet been tested.

## Run locally

The projects page loads its content from JSON, so run the site through a local HTTP
server rather than opening the HTML files directly. From the repository folder:

```powershell
python -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000) and stop the server with
`Ctrl+C`.

## Project files

```text
.
├── about.html
├── index.html
├── projects.html
├── quest.html
├── content.md
└── assets/
    ├── css/       # Shared and page-specific styles
    ├── data/      # Project-card data
    ├── images/    # Profile photo, favicon, and page screenshots
    └── js/        # Navigation, theme, page behavior, and workshop game
```

## Contact

- [GitHub profile](https://github.com/Davud09)
- [LinkedIn](https://www.linkedin.com/in/davud-idrisov-333a382b0/)
- Email: [didrisov28062@ada.edu.az](mailto:didrisov28062@ada.edu.az)

To enable the Resume (PDF) links, add `assets/Davud_Idrisov_CV.pdf`.
