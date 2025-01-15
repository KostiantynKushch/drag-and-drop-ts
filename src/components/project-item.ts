import { Draggable } from "../models/dnd";
import { Project } from "../models/project";
import { Component } from "./base";

export class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  get persons() {
    if (this.project.people === 1) {
      return "1 person";
    } else {
      return `${this.project.people} persons`;
    }
  }

  constructor(hostId: string, private project: Project) {
    super("single-project", hostId, false, project.id);

    this.configure();
    this.renderContent();
  }

  dragStartHandler(e: DragEvent): void {
    e.dataTransfer!.setData("text/plain", this.project.id);
    e.dataTransfer!.effectAllowed = "move";
  }

  dragEndHandler(_: DragEvent): void {}

  configure(): void {
    this.element.addEventListener("dragstart", (e) => this.dragStartHandler(e));
    this.element.addEventListener("dragend", (e) => this.dragEndHandler(e));
  }

  renderContent(): void {
    this.element.querySelector(".title")!.textContent = this.project.title;
    this.element.querySelector(".description")!.textContent =
      this.project.description;
    this.element.querySelector(".people")!.textContent = this.persons;
  }
}
