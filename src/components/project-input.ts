import { projectState } from "../state/project-state";
import { validate } from "../util/validation";
import { Component } from "./base";

export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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
