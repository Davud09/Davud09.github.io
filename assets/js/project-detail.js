const projectId = new URLSearchParams(window.location.search).get("id");
const projectDetailStatus = document.querySelector("#project-detail-status");

function setProjectText(selector, value) {
  const target = document.querySelector(selector);
  if (target) {
    target.textContent = value;
  }
}

async function loadProjectDetail() {
  if (!projectId) {
    setProjectText("#project-title", "Project not found");
    setProjectText("#project-summary", "Choose a project from the projects page.");
    projectDetailStatus.textContent = "No project was selected.";
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

    const project = projects.find((item) => item.id === projectId);
    if (!project) {
      setProjectText("#project-title", "Project not found");
      setProjectText("#project-summary", "Choose a project from the projects page.");
      projectDetailStatus.textContent = "That project is not in the portfolio data.";
      return;
    }

    document.title = `${project.title} — Davud Idrisov`;
    setProjectText("#project-status", project.status);
    setProjectText("#project-title", project.title);
    setProjectText("#project-summary", project.description.join(" "));
    setProjectText("#project-problem", project.problem);
    setProjectText("#project-wiring", project.wiring);
    setProjectText("#project-debug", project.whatWentWrong);
    setProjectText("#project-learned", project.whatLearned);

    const parts = document.querySelector("#project-parts");
    const fragment = document.createDocumentFragment();
    for (const part of project.tools) {
      const item = document.createElement("li");
      item.textContent = part;
      fragment.append(item);
    }
    parts.replaceChildren(fragment);
    projectDetailStatus.textContent = project.status === "Completed"
      ? "Completed project notes. Undocumented details are marked rather than guessed."
      : "Planned project notes. These details will be updated when the work is complete.";
  } catch (error) {
    setProjectText("#project-title", "Project notes unavailable");
    setProjectText("#project-summary", "The project data could not be loaded.");
    projectDetailStatus.textContent = "Try again later or return to the projects page.";
    console.error("Unable to load project details.", error);
  }
}

loadProjectDetail();
