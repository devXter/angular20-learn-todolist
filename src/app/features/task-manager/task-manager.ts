import { Component, computed, inject, signal, Signal, WritableSignal } from '@angular/core';
import { TaskManagement } from './services/task-management';
import { Task } from './models/task';
import { TaskFilter, TaskSortBy } from './models/task-filter';

@Component({
  selector: 'app-task-manager',
  providers: [TaskManagement],
  imports: [],
  templateUrl: './task-manager.html',
  styleUrl: './task-manager.css',
})
export class TaskManager {
  private readonly taskManagementService: TaskManagement = inject(TaskManagement);

  protected readonly allTasks: Signal<Task[]> = this.taskManagementService.allTasks;
  protected readonly remaining: Signal<number> = this.taskManagementService.remaining;
  protected readonly newTaskTitle: WritableSignal<string> = signal('');
  protected readonly newTaskDueDate: WritableSignal<string> = signal('');
  protected readonly editingTaskId: WritableSignal<number | null> = signal<number | null>(null);
  protected readonly editingTaskTitle: WritableSignal<string> = signal<string>('');

  // Nuevas señales para filtros y ordenamiento
  protected readonly activeTab: WritableSignal<TaskFilter> = signal<TaskFilter>('all');
  protected readonly sortBy: WritableSignal<TaskSortBy> = signal<TaskSortBy>('dueDate');

  protected readonly isEditing: Signal<(id: number) => boolean> = computed(
    (): ((id: number) => boolean) => {
      const editingId: number | null = this.editingTaskId();
      return (id: number): boolean => editingId === id;
    },
  );

  // Strategy map para filtros de tareas
  private readonly taskFilterStrategies: Record<TaskFilter, Signal<Task[]>> = {
    all: this.taskManagementService.allTasks,
    active: this.taskManagementService.activeTasks,
    completed: this.taskManagementService.completedTasks,
  };

  // Señal computada para tareas filtradas y ordenadas
  protected readonly filteredAndSortedTasks: Signal<Task[]> = computed((): Task[] => {
    const activeFilter: TaskFilter = this.activeTab();
    const filteredTasks: Task[] = this.taskFilterStrategies[activeFilter]();

    return this.taskManagementService.getSortedTasks(filteredTasks, this.sortBy());
  });

  // Función para verificar si una tarea está vencida
  protected readonly isOverdue = computed((): ((task: Task) => boolean) => {
    const today: Date = new Date();
    today.setHours(0, 0, 0, 0);

    return (task: Task): boolean => {
      if (task.completed || !task.dueDate) return false;
      const dueDate: Date = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    };
  });

  protected addTask(): void {
    const dueDate: Date | undefined = this.newTaskDueDate()
      ? new Date(this.newTaskDueDate())
      : undefined;

    this.taskManagementService.addTask(this.newTaskTitle(), dueDate);
    this.newTaskTitle.set('');
    this.newTaskDueDate.set('');
  }

  protected toggleCompleted(id: number): void {
    this.taskManagementService.toggleCompleted(id);
  }

  protected deleteTask(id: number): void {
    this.taskManagementService.deleteTask(id);
  }

  startEditingTask(task: Task): void {
    const { id, title } = task;

    this.editingTaskId.set(id);
    this.editingTaskTitle.set(title);
  }

  saveEditedTask(): void {
    const id: number | null = this.editingTaskId();
    if (id === null) return;

    this.taskManagementService.updateTask(id, this.editingTaskTitle());
    this.cancelEditing();
  }

  cancelEditing(): void {
    this.editingTaskId.set(null);
    this.editingTaskTitle.set('');
  }

  protected setActiveTab(tab: TaskFilter): void {
    this.activeTab.set(tab);
  }

  protected setSortBy(sortBy: TaskSortBy): void {
    this.sortBy.set(sortBy);
  }

  protected formatDate(date: Date | undefined): string {
    if (!date) return '';
    const d: Date = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    };
    return d.toLocaleDateString('es-ES', options);
  }

  protected formatDateShort(date: Date | undefined): string {
    if (!date) return '';
    const d: Date = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
    };
    return d.toLocaleDateString('es-ES', options);
  }
}
