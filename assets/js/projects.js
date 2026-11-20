const projectGrid = document.querySelector("#project-grid");
const projectStatus = document.querySelector("#projects-status");
const lightbox = document.querySelector("#project-lightbox");
const lightboxTitle = document.querySelector("#lightbox-title");
const lightboxImage = document.querySelector(".lightbox__image");
const lightboxCaption = document.querySelector(".lightbox__caption");
const lightboxClose = document.querySelector(".lightbox__close");
const reducedMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const staticCards = projectGrid
  ? [...projectGrid.children].map((node) => node.cloneNode(true))
  : [];
let lastImageTrigger = null;
let lightboxCloseTimeout;

function createTextElement(tagName, className, text) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
}

function renderProject(project, index) {
  const card = document.createElement("article");
  card.className = "project-card";

  const media = document.createElement("div");
  media.className = "project-card__media";

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
        if (gallery.childElementCount === 0) {
          gallery.remove();
          media.append(createTextElement(
            "p",
            "project-card__media-label",
            project.mediaTodo || "[TODO: Replace the unavailable project image.]"
          ));
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

    media.append(gallery);
  } else {
    media.append(createTextElement("p", "project-card__media-label", project.mediaTodo));
  }

  const body = document.createElement("div");
  body.className = "project-card__body";

  const topLine = document.createElement("div");
  topLine.className = "project-card__topline";
  topLine.append(
    createTextElement("p", "project-card__number", `Project ${String(index + 1).padStart(2, "0")}`),
    createTextElement("p", "project-card__status", project.status)
  );

  const title = createTextElement("h3", "project-card__title", project.title);
  const description = document.createElement("div");
  description.className = "project-card__description";
  for (const sentence of project.description) {
    description.append(createTextElement("p", "", sentence));
  }

  const tools = document.createElement("div");
  tools.className = "project-card__tools";
  tools.append(createTextElement("p", "project-card__tools-label", "Tools & focus"));
  const tags = document.createElement("ul");
  tags.className = "project-card__tags";

  const toolLabels = project.tools.length > 0
    ? project.tools
    : [project.toolsTodo || "[TODO: Add tools and materials.]"];
  for (const tool of toolLabels) {
    tags.append(createTextElement("li", "", tool));
  }
  tools.append(tags);

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

function openLightbox(project, trigger) {
  if (!project.image || !lightbox || !lightboxTitle || !lightboxImage || !lightboxCaption) {
    console.error("Unable to open the project image viewer: required image or dialog content is missing.");
    return;
  }

  window.clearTimeout(lightboxCloseTimeout);
  lastImageTrigger = trigger;
  lightboxTitle.textContent = project.title;
  lightboxImage.src = project.image;
  lightboxImage.alt = project.imageAlt || `${project.title} project image`;
  lightboxCaption.textContent = project.imageAlt || project.title;
  if (!lightbox.open) {
    lightbox.hidden = false;
    lightbox.inert = false;
    lightbox.showModal();
  }
  lightbox.classList.remove("is-visible");
  window.requestAnimationFrame(() => lightbox.classList.add("is-visible"));
  lightboxClose?.focus();
}

function closeLightbox() {
  if (!lightbox?.open) {
    return;
  }

  lightbox.classList.remove("is-visible");
  if (reducedMotionPreference.matches) {
    lightbox.close();
    return;
  }

  window.clearTimeout(lightboxCloseTimeout);
  lightboxCloseTimeout = window.setTimeout(() => lightbox.close(), 220);
}

projectGrid?.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const trigger = event.target.closest("[data-project-image]");
  if (!(trigger instanceof HTMLButtonElement)) {
    return;
  }

  openLightbox({
    title: trigger.dataset.projectTitle,
    image: trigger.dataset.imageSrc,
    imageAlt: trigger.dataset.imageAlt
  }, trigger);
});

lightboxClose?.addEventListener("click", closeLightbox);
lightbox?.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeLightbox();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox?.open) {
    event.preventDefault();
    closeLightbox();
  }
});
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});
lightbox?.addEventListener("close", () => {
  window.clearTimeout(lightboxCloseTimeout);
  lightbox.classList.remove("is-visible");
  lightboxImage?.removeAttribute("src");
  lightbox.hidden = true;
  lightbox.inert = true;
  lastImageTrigger?.focus();
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
    projectStatus.remove();
  } catch (error) {
    if (staticCards.length > 0) {
      projectGrid.replaceChildren(...staticCards.map((node) => node.cloneNode(true)));
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
