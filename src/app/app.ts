import { Component, computed, effect, Signal, signal, WritableSignal } from '@angular/core';
import { NgClass } from '@angular/common';

// 1. La "forma" de una tarea
export interface Task {
  id: number;
  title: string;
  completed: boolean;
}

@Component({
  selector: 'app-root',
  imports: [
    NgClass
  ],
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

  /**
   * Alterna el estado de completado de una tarea específica.
   *
   * Busca la tarea por su ID y cambia su propiedad `completed` al valor opuesto.
   * Si la tarea no existe, no realiza ninguna modificación.
   *
   * @param id - El identificador único de la tarea a modificar
   * @returns void
   *
   * @example
   * ```typescript
   * // Marca como completada (o no completada) la tarea con ID 2
   * this.toggleCompleted(2);
   * ```
   */
  toggleCompleted(id: number): void {
    this.tasks.update((tasks: Task[]): Task[] => {
      const index: number = tasks.findIndex((task: Task): boolean => task.id === id );
      if (index === -1) return tasks;

      const updatedTasks: Task[] = [...tasks];
      updatedTasks[index] = {...tasks[index], completed: !tasks[index].completed};
      return updatedTasks;
    });
  }

  constructor() {

  }

  deleteTask(id: number): void {

  }
}
