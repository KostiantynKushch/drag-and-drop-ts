import { Project, ProjectStatus } from "../models/project";
import { State } from "./base";

export class ProjectState extends State<Project> {
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, numOfPeople: number) {
    this.data.push(
      new Project(
        Math.random().toString(),
        title,
        description,
        numOfPeople,
        ProjectStatus.Active
      )
    );

    this.triggerListeners();
  }

  updateStatus(prId: string, type: ProjectStatus): void {
    const project = this.data.find((pr) => pr.id === prId);

    if (!project || project.status === type) return;

    switch (type) {
      case ProjectStatus.Active:
        project.status = ProjectStatus.Active;
        break;

      case ProjectStatus.Finished:
        project.status = ProjectStatus.Finished;
        break;
    }

    project.componentDestroy();
    this.triggerListeners();
  }
}

export const projectState = ProjectState.getInstance();
