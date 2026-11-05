const projectGrid = document.querySelector("#project-grid");
const projectStatus = document.querySelector("#projects-status");
const lightbox = document.querySelector("#project-lightbox");
const lightboxTitle = document.querySelector("#lightbox-title");
const lightboxImage = document.querySelector(".lightbox__image");
const lightboxCaption = document.querySelector(".lightbox__caption");
const lightboxClose = document.querySelector(".lightbox__close");
let lastImageTrigger = null;

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

  if (project.image) {
    const imageButton = document.createElement("button");
    imageButton.className = "project-card__image-button";
    imageButton.type = "button";
    imageButton.setAttribute("aria-label", `Enlarge image: ${project.title}`);

    const image = document.createElement("img");
    image.src = project.image;
    image.alt = project.imageAlt || `${project.title} project image`;
    image.loading = "lazy";
    image.width = 1200;
    image.height = 675;

    image.addEventListener("error", () => {
      console.error(`Unable to load project image for "${project.title}".`);
      imageButton.remove();
      media.append(createTextElement(
        "p",
        "project-card__media-label",
        project.mediaTodo || "[TODO: Replace the unavailable project image.]"
      ));
    }, { once: true });

    imageButton.append(image, createTextElement("span", "project-card__zoom-hint", "View image"));
    imageButton.addEventListener("click", () => openLightbox(project, imageButton));
    media.append(imageButton);
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
  tools.append(createTextElement("p", "project-card__tools-label", "Tools & materials"));
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
      anchor.className = "project-card__link";
      anchor.href = link.url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.textContent = `${link.label} ↗`;
      links.append(anchor);
    }
    body.append(links);
  }

  card.append(media, body);
  return card;
}

function openLightbox(project, trigger) {
  if (!lightbox || !lightboxTitle || !lightboxImage || !lightboxCaption) {
    return;
  }

  lastImageTrigger = trigger;
  lightboxTitle.textContent = project.title;
  lightboxImage.src = project.image;
  lightboxImage.alt = project.imageAlt || `${project.title} project image`;
  lightboxCaption.textContent = project.imageAlt || project.title;
  lightbox.showModal();
  lightboxClose?.focus();
}

function closeLightbox() {
  if (!lightbox?.open) {
    return;
  }

  lightbox.close();
}

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
  lightboxImage?.removeAttribute("src");
  lastImageTrigger?.focus();
});

async function loadProjects() {
  if (!projectGrid || !projectStatus) {
    return;
  }

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
    projectStatus.textContent = "Project cards couldn’t be loaded. Please try again later.";
    console.error("Unable to load project data.", error);
  }
}

loadProjects();
