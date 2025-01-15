type Listener<T> = (items: T[]) => void;
type Data<T> = T;

export abstract class State<T> {
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
