import "./app.css";

interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface Droppable {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

enum ProjectStatus {
  Active,
  Finished,
}

function validate({
  value,
  required,
  minLength,
  maxLength,
  min,
  max,
}: Validatable) {
  let isValid = true;

  if (required) {
    isValid = value.toString().trim().length !== 0;
  }

  if (typeof value === "string") {
    const inputString = value.trim();

    if (minLength != null && isValid) {
      isValid = inputString.length >= minLength;
    }
    if (maxLength != null && isValid) {
      isValid = inputString.length <= maxLength;
    }
  }

  if (typeof value === "number") {
    if (min != null && isValid) {
      isValid = value >= min;
    }
    if (max != null && isValid) {
      isValid = value <= max;
    }
  }

  return isValid;
}

function capitalizeFirstLetter(val: string) {
  return val.charAt(0).toUpperCase() + val.slice(1);
}

class Project {
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
    console.log("destroy", this.component);

    if (this.component) {
      this.component.element.remove();
      this.component = null;
    }
  }
}

type Listener<T> = (items: T[]) => void;
type Data<T> = T;

abstract class State<T> {
  protected listeners: Listener<T>[] = [];
  protected data: Data<T>[] = [];

  get state() {
    return [...this.data];
  }

  set state(state: Data<T>[]) {
    this.data = [...state];
  }

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }

  triggerListeners() {
    for (const listenerFn of this.listeners) {
      listenerFn([...this.data]);
    }
  }
}

class ProjectState extends State<Project> {
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

  updateStatus(prId: string, type: string): void {
    const project = this.data.find((pr) => pr.id === prId);
    if (!project) return;
    const { status } = project;

    if (type === "active" && status !== ProjectStatus.Active) {
      project.status = ProjectStatus.Active;
    } else if (type === "finished" && status !== ProjectStatus.Finished) {
      project.status = ProjectStatus.Finished;
    }

    if (status !== project.status) {
      project.componentDestroy();
      this.triggerListeners();
    }
  }
}

const projectState = ProjectState.getInstance();

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string
  ) {
    this.templateElement = document.getElementById(
      templateId
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId)! as T;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );

    this.element = importedNode.firstElementChild as U;
    if (newElementId) {
      this.element.id = newElementId;
    }

    this.attach(insertAtStart);
  }

  private attach(insertAtStart: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtStart ? "afterbegin" : "beforeend",
      this.element
    );
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

class ProjectItem
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

  dragEndHandler(_: DragEvent): void {
    console.log("DragEnd");
  }

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

class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements Droppable
{
  assignedProjects: Project[] = [];
  listId: string;
  listEl: HTMLUListElement;

  constructor(private type: "active" | "finished") {
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
      const relevantProjects = projects.filter((pr) => {
        if (this.type === "active") {
          return pr.status === ProjectStatus.Active;
        }
        return pr.status === ProjectStatus.Finished;
      });

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

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, "user-input");

    this.titleInputElement = this.element.querySelector("#title")!;
    this.descriptionInputElement = this.element.querySelector("#description")!;
    this.peopleInputElement = this.element.querySelector("#people")!;

    this.configure();
  }

  configure() {
    this.element.addEventListener("submit", (e: Event) =>
      this.submitHandler(e)
    );
  }
  renderContent(): void {}

  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value.trim();
    const enteredDescription = this.descriptionInputElement.value.trim();
    const enteredPeople = this.peopleInputElement.value.trim();

    if (
      !validate({ value: enteredTitle, required: true, minLength: 3 }) ||
      !validate({ value: enteredDescription, required: true, minLength: 3 }) ||
      !validate({ value: enteredPeople, required: true, min: 1, max: 5 })
    ) {
      alert("Invalid input! Please, try again.");
      return;
    }
    return [enteredTitle, enteredDescription, +enteredPeople];
  }

  private clearInputs() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  }

  private submitHandler(e: Event) {
    e.preventDefault();
    const userInput = this.gatherUserInput();
    if (Array.isArray(userInput)) {
      const [title, desk, people] = userInput;
      projectState.addProject(title, desk, people);
      this.clearInputs();
    }
  }
}

new ProjectInput();
new ProjectList("active");
new ProjectList("finished");
