import { computed, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { Task } from '../models/task';

@Injectable({
  providedIn: 'root',
})
export class TaskManager {
  private readonly tasks: WritableSignal<Task[]> = signal<Task[]>([
    { id: 1, title: 'Hacer mis tareas', completed: true },
    { id: 2, title: 'Leer el libro', completed: false },
    { id: 3, title: 'Estudiar para las pruebas', completed: false },
  ]);

  readonly allTasks: Signal<Task[]> = this.tasks.asReadonly();

  readonly remaining: Signal<number> = computed((): number => {
    return this.tasks().filter((task: Task): boolean => !task.completed).length;
  });

  addTask(newTitle: string): void {
    const title: string = newTitle.trim();
    if (!title) return;

    this.tasks.update((tasks: Task[]): Task[] => {
      return [
        ...tasks,
        {
          id: Math.max(0, ...this.tasks().map((task: Task): number => task.id)) + 1,
          title,
          completed: false,
        },
      ];
    });
  }

  toggleCompleted(id: number) {
    this.tasks.update((tasks: Task[]): Task[] => {
      const index: number = tasks.findIndex((task: Task): boolean => task.id === id);
      if (index === -1) return tasks;

      const updatedTasks: Task[] = [...tasks];
      updatedTasks[index] = { ...tasks[index], completed: !tasks[index].completed };
      return updatedTasks;
    });
  }

  deleteTask(id: number): void {
    this.tasks.update((tasks: Task[]): Task[] => {
      return tasks.filter((task: Task): boolean => task.id !== id);
    });
  }

  updateTask(id: number, newTitle: string): void {
    const title: string = newTitle.trim();
    if (!title) return;
    this.tasks.update((tasks: Task[]) => {
      return tasks.map((task: Task) => (task.id === id ? { ...task, title } : task));
    });
  }
}
