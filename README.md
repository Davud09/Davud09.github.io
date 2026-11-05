# Davud Idrisov — Portfolio

> **Current stage:** shared navigation, theme control, and footer are in place. Replace remaining `[TODO: ...]` items as content and media are ready.

## Live site

[TODO: Add the GitHub Pages URL after choosing a GitHub username and deploying.]

## About

[TODO: Add a short description of the portfolio.]

## Features so far

- Four linked page shells with shared responsive navigation and footer
- Keyboard-operable mobile menu with current-page highlighting
- Dark/light theme toggle that remembers the selection
- Inline SVG links to the portfolio repository and LinkedIn
- Reduced-motion support and visible keyboard focus styles
- Home page with an accessible profile image and missing-image fallback
- Scroll reveals that turn off for visitors who prefer reduced motion
- About page with education, clearly labeled skill levels, activities, languages, and interests
- JSON-driven project cards with planned/completed status, media TODOs, and an accessible lightbox
- Field Workshop game engine with keyboard/touch controls, XP, achievements, and a plain-resume path

## Tech stack

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)

## Folder structure

```text
.
├── assets/
│   ├── css/
│   │   ├── about.css
│   │   ├── base.css
│   │   ├── home.css
│   │   ├── layout.css
│   │   └── projects.css
│   ├── data/
│   │   └── projects.json
│   ├── images/
│   │   ├── davud-idrisov.jpeg
│   │   └── favicon.svg
│   └── js/
│       ├── home.js
│       ├── nav.js
│       ├── projects.js
│       ├── reveal.js
│       ├── quest/
│       │   ├── achievements.js
│       │   ├── content.js
│       │   ├── input.js
│       │   ├── main.js
│       │   ├── render.js
│       │   └── state.js
│       ├── site.js
│       └── theme.js
├── about.html
├── content.md
├── index.html
├── projects.html
├── quest.html
├── .gitignore
└── .nojekyll
```

## Run locally

Open `index.html` in a browser, or use the VS Code Live Server extension.

## Deployment

[TODO: Document the GitHub Pages repository and deployment settings.]

## Screenshots

[TODO: Add a screenshot after the visual design is complete.]

## What I learned

[TODO: Reflect on what you learned while building the site.]

## Generative AI

[TODO: Describe how GenAI was used and how its output was reviewed and edited.]
