# Davud Idrisov — Portfolio

Personal portfolio for my SITE 1101: Principles of Information Systems course.
It brings together my engineering background, course projects, and an interactive
resume called **Field Workshop**.

## Live site and repository

- **Website:** [https://davud09.github.io/](https://davud09.github.io/)
- **Public GitHub repository:** [github.com/Davud09/Davud09.github.io](https://github.com/Davud09/Davud09.github.io)

## Screenshots

### Home

![Portfolio home page showing the introduction, profile photo, and currently section](assets/images/homepage.png)

### Projects

![Projects page showing the project cards and their current media placeholders](assets/images/projects.png)

Photos for the breadboard, Hour of Code, and Robotics projects are still to be added;
those cards clearly identify their missing media. The portfolio card uses a screenshot
from the site.

## Features

- Four responsive pages: Home, About, Projects, and Field Workshop
- Keyboard-operable mobile navigation with current-page highlighting
- Dark and light themes with a saved preference
- Four-stage interactive circuit challenge with a timed final round
- Home-page performance readout measured with the browser Navigation Timing API
- Accessible profile image fallback, visible focus styles, and reduced-motion support
- About page covering my education, skills, activities, languages, and interests
- Project cards loaded from JSON, including upcoming course work and the portfolio build
- Keyboard-accessible project image lightbox
- Field Workshop interactive resume with keyboard and touch controls, XP, achievements,
  and a plain-resume option
- Shared footer with a generated copyright year and distinct GitHub profile, repository,
  and LinkedIn links

## Technology

- HTML5
- CSS3 (custom properties; responsive and theme-aware styles)
- Vanilla JavaScript (ES6+)
- JSON project data

No framework, build step, backend, or npm package is required.

## Project structure

```text
.
├── assets/
│   ├── css/
│   │   ├── about.css
│   │   ├── base.css
│   │   ├── home.css
│   │   ├── layout.css
│   │   ├── projects.css
│   │   └── quest.css
│   ├── data/
│   │   └── projects.json
│   ├── images/
│   │   ├── davud-idrisov.jpeg
│   │   ├── favicon.svg
│   │   ├── homepage.png
│   │   └── projects.png
│   └── js/
│       ├── home.js
│       ├── nav.js
│       ├── projects.js
│       ├── reveal.js
│       ├── site.js
│       ├── theme.js
│       └── quest/
│           ├── achievements.js
│           ├── content.js
│           ├── input.js
│           ├── main.js
│           ├── render.js
│           └── state.js
├── about.html
├── content.md
├── index.html
├── projects.html
├── quest.html
├── README.md
├── .gitignore
└── .nojekyll
```

## Run locally

The project-card data and Field Workshop game use browser features that require a
local web server. The simplest option is to open the project folder in VS Code and
start **Live Server** from `index.html`.

Alternatively, with Python installed, run this command from the project root:

```powershell
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000). Stop the server with
`Ctrl+C` in the terminal.

## Deployment with GitHub Pages

This repository is named `Davud09.github.io`, which serves as the account's
GitHub Pages site.

1. Push the `main` branch to the public repository.
2. In GitHub, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select branch **main** and folder **/(root)**, then save.
5. Wait for the Pages deployment to finish. Open
   [https://davud09.github.io/](https://davud09.github.io/) and check the Home,
   About, Projects, and Field Workshop pages.

## What I learned

While building this portfolio, I practiced separating a static site into
page-specific and shared styles, using JavaScript modules for interactive features,
loading project content from JSON, and checking keyboard access and small-screen
layouts. I also used Git commits to keep the work organized by stage.

## Generative AI

I used a generative AI assistant as a pair-programming and review tool while
planning the site, drafting and adjusting HTML/CSS/JavaScript, and checking the
result. I supplied the personal details and project facts; AI-generated wording
and code were reviewed and revised during development. The assistant did not
provide personal facts about me.
