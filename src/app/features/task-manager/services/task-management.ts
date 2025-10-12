import {
  computed,
  effect,
  inject,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { Task } from '../models/task';
import { LocalStorage } from '../../../core/services/local-storage';

@Injectable()
export class TaskManagement {
  private readonly localStorageService = inject(LocalStorage);
  private readonly TASKS_STORAGE_KEY = 'tasks';

  private readonly tasks: WritableSignal<Task[]> = signal<Task[]>(
    this.migrateTasks(
      this.localStorageService.getItem<Task[]>(this.TASKS_STORAGE_KEY) ?? [
        {
          id: 1,
          title: 'Hacer mis tareas',
          completed: true,
          createdAt: new Date('2025-10-01'),
          dueDate: new Date('2025-10-05'),
        },
        {
          id: 2,
          title: 'Leer el libro',
          completed: false,
          createdAt: new Date('2025-10-08'),
          dueDate: new Date('2025-10-15'),
        },
        {
          id: 3,
          title: 'Estudiar para las pruebas',
          completed: false,
          createdAt: new Date('2025-10-10'),
          dueDate: new Date('2025-10-20'),
        },
      ],
    ),
  );

  readonly allTasks: Signal<Task[]> = this.tasks.asReadonly();

  readonly remaining: Signal<number> = computed((): number => {
    return this.tasks().filter((task: Task): boolean => !task.completed).length;
  });

  readonly activeTasks: Signal<Task[]> = computed((): Task[] => {
    return this.tasks().filter((task: Task): boolean => !task.completed);
  });

  readonly completedTasks: Signal<Task[]> = computed((): Task[] => {
    return this.tasks().filter((task: Task): boolean => task.completed);
  });

  readonly overdueTasks: Signal<Task[]> = computed((): Task[] => {
    const today: Date = new Date();
    today.setHours(0, 0, 0, 0);
    return this.tasks().filter((task: Task): boolean => {
      if (task.completed || !task.dueDate) return false;
      const dueDate: Date = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    });
  });

  constructor() {
    // Effect para guardar automáticamente en localStorage cuando cambien las tareas
    effect(() => {
      this.localStorageService.setItem(this.TASKS_STORAGE_KEY, this.tasks());
    });
  }

  private migrateTasks(tasks: Task[]): Task[] {
    return tasks.map((task: Task): Task => {
      const migratedTask: Task = { ...task };

      // Convertir strings de fecha a objetos Date si es necesario
      if (migratedTask.createdAt && typeof migratedTask.createdAt === 'string') {
        migratedTask.createdAt = new Date(migratedTask.createdAt);
      }
      if (migratedTask.dueDate && typeof migratedTask.dueDate === 'string') {
        migratedTask.dueDate = new Date(migratedTask.dueDate);
      }

      // Si no tiene createdAt, asignar fecha actual
      if (!migratedTask.createdAt) {
        migratedTask.createdAt = new Date();
      }

      return migratedTask;
    });
  }

  addTask(newTitle: string, dueDate?: Date): void {
    const title: string = newTitle.trim();
    if (!title) return;

    this.tasks.update((tasks: Task[]): Task[] => {
      return [
        ...tasks,
        {
          id: Math.max(0, ...this.tasks().map((task: Task): number => task.id)) + 1,
          title,
          completed: false,
          createdAt: new Date(),
          dueDate,
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

  getSortedTasks(tasks: Task[], sortBy: 'dueDate' | 'createdAt' | 'title'): Task[] {
    const tasksCopy: Task[] = [...tasks];

    switch (sortBy) {
      case 'dueDate':
        return tasksCopy.sort((a: Task, b: Task): number => {
          // Tareas sin fecha de vencimiento van al final
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;

          const dateA: Date = new Date(a.dueDate);
          const dateB: Date = new Date(b.dueDate);
          return dateA.getTime() - dateB.getTime();
        });

      case 'createdAt':
        return tasksCopy.sort((a: Task, b: Task): number => {
          const dateA: Date = new Date(a.createdAt);
          const dateB: Date = new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime(); // Más recientes primero
        });

      case 'title':
        return tasksCopy.sort((a: Task, b: Task): number => {
          return a.title.localeCompare(b.title, 'es');
        });

      default:
        return tasksCopy;
    }
  }
}
