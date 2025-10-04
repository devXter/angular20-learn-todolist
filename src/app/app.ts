import { ChangeDetectionStrategy, Component, computed, Signal, signal, WritableSignal } from '@angular/core'; // 1. La "forma" de una tarea

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
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  // 2. La lista de tareas como una signal
  protected readonly tasks: WritableSignal<Task[]> = signal<Task[]>([
    { id: 1, title: 'Aprende Signals', completed: true },
    { id: 2, title: 'Crear To-Do App', completed: false },
    { id: 3, title: 'Dominar Angular', completed: false },
  ]);

  protected readonly editingTaskId: WritableSignal<number | null> = signal<number | null>(null);
  protected readonly editingTaskTitle: WritableSignal<string> = signal<string>('');

  protected readonly isEditing: Signal<(id: number) => boolean> = computed(
    (): ((id: number) => boolean) => {
      const editingId: number | null = this.editingTaskId();
      return (id: number): boolean => editingId === id;
    },
  );

  // 3. Un estado derivado para las tareas restantes
  protected readonly remaining: Signal<number> = computed((): number => {
    return this.tasks().filter((task: Task): boolean => !task.completed).length;
  });

  protected readonly newTaskTitle: WritableSignal<string> = signal('');

  protected addTask(): void {
    const title: string = this.newTaskTitle().trim();
    if (!title) return;

    this.tasks.update((task: Task[]): Task[] => {
      return [
        ...task,
        {
          id: Math.max(0, ...this.tasks().map((task: Task): number => task.id)) + 1,
          title,
          completed: false,
        },
      ];
    });

    this.newTaskTitle.set('');
  }

  startEditingTask(task: Task): void {
    const { id, title } = task;

    this.editingTaskId.set(id);
    this.editingTaskTitle.set(title);
  }

  saveEditedTask(): void {
    const id: number | null = this.editingTaskId();
    const newTitle: string = this.editingTaskTitle();

    if (id === null || !newTitle) return;

    this.tasks.update((tasks: Task[]): Task[] => {
      return tasks.map(
        (task: Task): Task => (task.id === id ? { ...task, title: newTitle } : task),
      );
    });

    this.cancelEditing();
  }

  cancelEditing(): void {
    this.editingTaskId.set(null);
    this.editingTaskTitle.set('');
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
}
