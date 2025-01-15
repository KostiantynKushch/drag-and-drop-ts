import { ProjectItem } from "../components/project-item";

export enum ProjectStatus {
  Active = 'active',
  Finished = 'finished',
}

export class Project {
  private component: ProjectItem | null = null;

  set comp(comp) {
    if (this.component) {
      return;
    }
    this.component = comp;
  }

  get comp() {
    return this.component;
  }

  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}

  componentDestroy() {
    if (this.component) {
      this.component.element.remove();
      this.component = null;
    }
  }
}
