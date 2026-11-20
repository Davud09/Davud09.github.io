const projectGrid = document.querySelector("#project-grid");
const projectStatus = document.querySelector("#projects-status");
const projectsReducedMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const svgNamespace = "http://www.w3.org/2000/svg";
const staticCards = projectGrid
  ? [...projectGrid.children].map((node) => node.cloneNode(true))
  : [];

const projectIllustrations = {
  "code-workshop": [
    ["rect", { x: 94, y: 58, width: 214, height: 244, rx: 18, class: "illustration-frame" }],
    ["path", { d: "M94 104h214M130 82h82M130 145h142M130 179h102M130 213h126M130 247h76", class: "illustration-line" }],
    ["rect", { x: 358, y: 92, width: 164, height: 58, rx: 12, class: "illustration-block" }],
    ["rect", { x: 404, y: 185, width: 164, height: 58, rx: 12, class: "illustration-block" }],
    ["path", { d: "M308 173h40v-52h10M348 173v41h56", class: "illustration-wire" }],
    ["circle", { cx: 348, cy: 173, r: 7, class: "illustration-node" }],
    ["path", { d: "m532 120 18 18-18 18", class: "illustration-arrow" }]
  ],
  robotics: [
    ["path", { d: "M156 264h356M196 264V132h288v132M230 132V92h220v40", class: "illustration-frame" }],
    ["circle", { cx: 235, cy: 278, r: 28, class: "illustration-wheel" }],
    ["circle", { cx: 434, cy: 278, r: 28, class: "illustration-wheel" }],
    ["rect", { x: 265, y: 160, width: 154, height: 72, rx: 12, class: "illustration-block" }],
    ["circle", { cx: 304, cy: 194, r: 12, class: "illustration-node" }],
    ["path", { d: "M338 194h52M340 92V62h82v30M360 160v-24M385 160v-24", class: "illustration-wire" }],
    ["path", { d: "M186 112h-30M494 112h30M340 296v20M386 296v20", class: "illustration-line" }]
  ]
};

function createTextElement(tagName, className, text) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
}

function createProjectPlaceholder(type, status) {
  const media = document.createElement("div");
  media.className = "project-card__media project-card__media--placeholder";
  const illustration = document.createElementNS(svgNamespace, "svg");
  illustration.setAttribute("class", "project-card__illustration");
  illustration.setAttribute("viewBox", "0 0 680 380");
  illustration.setAttribute("aria-hidden", "true");
  illustration.setAttribute("focusable", "false");

  for (const [tagName, attributes] of projectIllustrations[type] ?? []) {
    const shape = document.createElementNS(svgNamespace, tagName);
    for (const [name, value] of Object.entries(attributes)) {
      shape.setAttribute(name, String(value));
    }
    illustration.append(shape);
  }

  const statusPill = createTextElement("span", "project-card__placeholder-status", status);
  media.append(illustration, statusPill);
  return media;
}

function createCarouselControls(gallery, count) {
  if (count < 2) {
    return;
  }

  const controls = document.createElement("div");
  controls.className = "project-card__carousel-controls";
  controls.setAttribute("aria-label", "Project photos");

  const previous = createTextElement("button", "project-card__carousel-arrow", "←");
  previous.type = "button";
  previous.dataset.carouselPrev = "";
  previous.setAttribute("aria-label", "Previous photo");

  const dots = document.createElement("div");
  dots.className = "project-card__carousel-dots";
  dots.setAttribute("role", "group");
  dots.setAttribute("aria-label", "Choose a project photo");
  for (let index = 0; index < count; index += 1) {
    const dot = createTextElement(
      "button",
      "project-card__carousel-dot",
      index === 0 ? "●" : "○"
    );
    dot.type = "button";
    dot.dataset.carouselDot = String(index);
    dot.setAttribute("aria-label", `Show photo ${index + 1} of ${count}`);
    dot.setAttribute("aria-current", String(index === 0));
    dots.append(dot);
  }

  const next = createTextElement("button", "project-card__carousel-arrow", "→");
  next.type = "button";
  next.dataset.carouselNext = "";
  next.setAttribute("aria-label", "Next photo");
  controls.append(previous, dots, next);
  gallery.append(controls);
}

function setCarouselSlide(gallery, requestedIndex) {
  const slides = [...gallery.querySelectorAll("[data-project-image]")];
  if (slides.length === 0) {
    return;
  }

  const index = (requestedIndex + slides.length) % slides.length;
  const track = gallery.querySelector(".project-card__track");
  if (track) track.scrollTo({ left: slides[index].offsetLeft, behavior: projectsReducedMotionPreference.matches ? "auto" : "smooth" });
}

function renderProject(project, index) {
  const card = document.createElement("article");
  card.className = `project-card${project.id === "personal-portfolio" ? " project-card--portfolio" : ""}`;

  let media = document.createElement("div");
  media.className = `project-card__media${project.id === "personal-portfolio" ? " project-card__media--portfolio" : ""}`;

  const projectImages = Array.isArray(project.images)
    ? project.images
    : project.image
      ? [{ src: project.image, alt: project.imageAlt }]
      : [];

  if (projectImages.length > 0) {
    const gallery = document.createElement("div");
    gallery.className = "project-card__gallery";
    gallery.setAttribute("role", "group");
    gallery.setAttribute("aria-label", `${project.title} images`);

    for (const [imageIndex, projectImage] of projectImages.entries()) {
      const imageButton = document.createElement("button");
      imageButton.className = "project-card__image-button";
      imageButton.type = "button";
      imageButton.dataset.projectImage = "";
      imageButton.dataset.projectTitle = project.title;
      imageButton.dataset.imageSrc = projectImage.src;
      imageButton.dataset.carouselSlide = String(imageIndex);
      imageButton.hidden = imageIndex !== 0;
      imageButton.dataset.imageAlt = projectImage.alt || `${project.title} project image`;
      imageButton.setAttribute(
        "aria-label",
        `Enlarge image ${imageIndex + 1} of ${projectImages.length} for ${project.title}`
      );

      const image = document.createElement("img");
      image.src = projectImage.src;
      image.alt = projectImage.alt || `${project.title} project image`;
      image.loading = "lazy";
      image.width = projectImage.width || 1200;
      image.height = projectImage.height || 675;

      image.addEventListener("error", () => {
        console.error(`Unable to load project image for "${project.title}".`);
        imageButton.remove();
        const remainingSlides = gallery.querySelectorAll("[data-project-image]").length;
        if (remainingSlides === 0) {
          gallery.remove();
          media.append(createTextElement("p", "project-card__media-label", "Project image unavailable."));
        } else if (remainingSlides === 1) {
          gallery.querySelector("[data-project-image]").hidden = false;
          gallery.querySelector(".project-card__carousel-controls")?.remove();
        }
      }, { once: true });

      imageButton.append(
        image,
        createTextElement(
          "span",
          "project-card__zoom-hint",
          projectImages.length > 1 ? `View photo ${imageIndex + 1} of ${projectImages.length}` : "View image"
        )
      );
      gallery.append(imageButton);
    }

    createCarouselControls(gallery, projectImages.length);
    media.append(gallery);
  } else if (project.mediaPlaceholder) {
    media = createProjectPlaceholder(project.mediaPlaceholder, project.status);
  } else {
    media.append(createTextElement("p", "project-card__media-label", "Project preview coming soon."));
  }

  const body = document.createElement("div");
  body.className = "project-card__body";

  const topLine = document.createElement("div");
  topLine.className = "project-card__topline";
  topLine.append(
    createTextElement("p", "project-card__number", `Project ${String(index + 1).padStart(2, "0")}`)
  );

  const title = createTextElement("h3", "project-card__title", project.title);
  const description = document.createElement("div");
  description.className = "project-card__description";
  for (const sentence of project.description) {
    description.append(createTextElement("p", "", sentence));
  }

  const tools = document.createElement("dl");
  tools.className = "project-card__metadata";

  function addMetadataRow(label, value) {
    const row = document.createElement("div");
    row.append(
      createTextElement("dt", "", label),
      createTextElement("dd", "", value)
    );
    tools.append(row);
  }

  addMetadataRow("Focus", project.focus || "Project focus");
  const tags = document.createElement("ul");
  tags.className = "project-card__tags";

  const toolLabels = project.tools.length > 0 ? project.tools : ["Details coming soon"];
  for (const tool of toolLabels) {
    tags.append(createTextElement("li", "", tool));
  }
  const toolsRow = document.createElement("div");
  toolsRow.append(
    createTextElement("dt", "", "Tools / Components"),
    document.createElement("dd")
  );
  toolsRow.lastElementChild.append(tags);
  tools.append(toolsRow);
  addMetadataRow("Status", project.status);

  body.append(topLine, title, description, tools);

  if (project.links.length > 0) {
    const links = document.createElement("div");
    links.className = "project-card__links";
    for (const link of project.links) {
      const anchor = document.createElement("a");
      anchor.className = "project-card__link btn btn--ghost";
      anchor.href = link.url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.append(
        document.createTextNode(link.label),
        createTextElement("span", "btn__arrow", "↗")
      );
      anchor.lastElementChild.setAttribute("aria-hidden", "true");
      links.append(anchor);
    }
    body.append(links);
  }

  card.append(media, body);
  return card;
}

function renderProjectSkeletons() {
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < 2; index += 1) {
    const card = document.createElement("div");
    card.className = "project-skeleton";
    card.setAttribute("aria-hidden", "true");

    const media = document.createElement("div");
    media.className = "project-skeleton__media";

    const body = document.createElement("div");
    body.className = "project-skeleton__body";
    for (const className of [
      "project-skeleton__line project-skeleton__line--short",
      "project-skeleton__line project-skeleton__line--title",
      "project-skeleton__line",
      "project-skeleton__line"
    ]) {
      const line = document.createElement("span");
      line.className = className;
      body.append(line);
    }

    card.append(media, body);
    fragment.append(card);
  }

  projectGrid.replaceChildren(fragment);
}

function enhanceProjects() {
  for (const card of projectGrid.querySelectorAll(".project-card")) {
    const body = card.querySelector(".project-card__body");
    const button = createTextElement("button", "btn btn--secondary project-card__open", "Explore case study");
    button.type = "button";
    button.setAttribute("aria-label", `Explore case study: ${card.querySelector(".project-card__title").textContent}`);
    body.append(button);
    for (const gallery of card.querySelectorAll(".project-card__gallery")) {
      const slides = [...gallery.querySelectorAll("[data-project-image]")];
      const track = document.createElement("div");
      track.className = "project-card__track";
      for (const slide of slides) {
        slide.hidden = false;
        slide.setAttribute("aria-label", `Explore case study: ${card.querySelector(".project-card__title").textContent}`);
        track.append(slide);
      }
      gallery.prepend(track);
      const updateDots = () => {
        const index = Math.round(track.scrollLeft / Math.max(track.clientWidth, 1));
        gallery.querySelectorAll("[data-carousel-dot]").forEach((dot, i) => {
          dot.setAttribute("aria-current", String(i === index));
        });
      };
      track.addEventListener("scroll", updateDots, { passive: true });
      updateDots();
    }
  }
}

function openProject(card, trigger) {
  const content = document.createDocumentFragment();
  const description = card.querySelector(".project-card__description");
  const metadata = card.querySelector(".project-card__metadata");
  const links = card.querySelector(".project-card__links");
  if (description) {
    content.append(createTextElement("h3", "", "Build notes"), description.cloneNode(true));
  }
  if (metadata) content.append(metadata.cloneNode(true));
  for (const image of card.querySelectorAll("[data-project-image] img")) {
    const fullImage = image.cloneNode();
    fullImage.loading = "eager";
    content.append(fullImage);
  }
  if (links) content.append(links.cloneNode(true));
  window.liquidSheet.open(card, card.querySelector(".project-card__title").textContent, content, trigger);
}

projectGrid?.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const carouselControl = event.target.closest("[data-carousel-prev], [data-carousel-next], [data-carousel-dot]");
  if (carouselControl instanceof HTMLButtonElement) {
    const gallery = carouselControl.closest(".project-card__gallery");
    if (!gallery) {
      return;
    }

    const slides = [...gallery.querySelectorAll("[data-project-image]")];
    const track = gallery.querySelector(".project-card__track");
    const activeIndex = Math.round(track.scrollLeft / Math.max(track.clientWidth, 1));
    if (carouselControl.hasAttribute("data-carousel-dot")) {
      setCarouselSlide(gallery, Number(carouselControl.dataset.carouselDot));
    } else {
      const direction = carouselControl.hasAttribute("data-carousel-next") ? 1 : -1;
      setCarouselSlide(gallery, activeIndex + direction);
    }
    return;
  }

  const card = event.target.closest(".project-card");
  if (!card || event.target.closest("a")) return;
  const trigger = event.target.closest("button") || card.querySelector(".project-card__open");
  openProject(card, trigger);
});

async function loadProjects() {
  if (!projectGrid || !projectStatus) {
    return;
  }

  projectStatus.hidden = false;
  projectStatus.textContent = "Loading project cards…";
  renderProjectSkeletons();

  try {
    const response = await fetch("assets/data/projects.json");
    if (!response.ok) {
      throw new Error(`Project data request failed: ${response.status}`);
    }

    const projects = await response.json();
    if (!Array.isArray(projects)) {
      throw new TypeError("Project data must be an array.");
    }

    const fragment = document.createDocumentFragment();
    projects.forEach((project, index) => {
      fragment.append(renderProject(project, index));
    });

    projectGrid.replaceChildren(fragment);
    enhanceProjects();
    projectStatus.remove();
  } catch (error) {
    if (staticCards.length > 0) {
      projectGrid.replaceChildren(...staticCards.map((node) => node.cloneNode(true)));
      enhanceProjects();
    } else {
      projectGrid.replaceChildren();
    }

    projectStatus.hidden = false;
    projectStatus.replaceChildren(
      "Project cards couldn’t be refreshed from the data file. Showing the built-in list instead. "
    );
    const retryButton = document.createElement("button");
    retryButton.className = "btn btn--secondary projects-retry";
    retryButton.type = "button";
    retryButton.textContent = "Retry";
    retryButton.addEventListener("click", loadProjects);
    projectStatus.append(retryButton);
    console.error("Unable to load project data.", error);
  }
}

loadProjects();
