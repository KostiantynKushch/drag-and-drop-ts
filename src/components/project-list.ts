import { Droppable } from "../models/dnd";
import { Project, ProjectStatus } from "../models/project";
import { projectState } from "../state/project-state";
import { capitalizeFirstLetter } from "../util/capitalize";
import { Component } from "./base";
import { ProjectItem } from "./project-item";

export class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements Droppable
{
  assignedProjects: Project[] = [];
  listId: string;
  listEl: HTMLUListElement;

  constructor(private type: ProjectStatus) {
    super("project-list", "app", false, `${type}-projects`);
    this.listId = `${this.type}-projects-list`;
    this.listEl = this.element.querySelector("ul")!;
    this.configure();
    this.renderContent();
  }

  dragOverHandler(e: DragEvent): void {
    if (e.dataTransfer && e.dataTransfer.types[0] === "text/plain") {
      e.preventDefault();
      this.listEl.classList.add("droppable");
    }
  }

  dragLeaveHandler(_: DragEvent): void {
    this.listEl.classList.remove("droppable");
  }

  dropHandler(e: DragEvent): void {
    const draggedProjectId = e.dataTransfer!.getData("text/plain");
    projectState.updateStatus(draggedProjectId, this.type);
  }

  configure(): void {
    this.element.addEventListener("dragover", (e) => this.dragOverHandler(e));
    this.element.addEventListener("dragleave", (e) => this.dragLeaveHandler(e));
    this.element.addEventListener("drop", (e) => this.dropHandler(e));
    projectState.addListener((projects) => {
      const relevantProjects = projects.filter((pr) => pr.status === this.type);
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
  }

  renderContent() {
    this.listEl.id = this.listId;
    this.element.querySelector("h2")!.textContent =
      capitalizeFirstLetter(this.type) + " projects";
  }

  private renderProjects() {
    for (const pr of this.assignedProjects) {
      if (pr.comp) {
        continue;
      }
      pr.comp = new ProjectItem(this.listId, pr);
    }
  }
}
