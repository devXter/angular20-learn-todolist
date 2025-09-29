import { Component, computed, effect, Signal, signal, WritableSignal } from '@angular/core';

// 1. La "forma" de una tarea
export interface Task {
  id: number;
  title: string;
  completed: boolean;
}

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  // 2. La lista de tareas como una signal
  protected readonly tasks: WritableSignal<Task[]> = signal<Task[]>([
    { id: 1, title: 'Aprende Signals', completed: true },
    { id: 2, title: 'Crear To-Do App', completed: false },
    { id: 3, title: 'Dominar Angular', completed: false },
  ]);

  // 3. Un estado derivado para las tareas restantes
  public readonly remaining: Signal<number> = computed((): number => {
    return this.tasks().filter((task: Task): boolean => !task.completed).length;
  });

  protected readonly newTaskTitle: WritableSignal<string> = signal('');

  protected addTask(event: HTMLInputElement): void {
    const title: string = this.newTaskTitle().trim();
    if (!title) return;

    this.tasks.update((task: Task[]): Task[] => {
      return [...task, {
        id: Math.max(0, ...this.tasks().map((task: Task): number => task.id)) + 1,
        title,
        completed: false
      }];
    });

    event.value = '';
    this.newTaskTitle.set('');
  }

  constructor() {
    effect(() => {
      console.log(this.newTaskTitle())
    });
  }
}
