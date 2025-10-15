import { Component, computed, inject, signal, Signal, WritableSignal } from '@angular/core';
import { TaskManagement } from './services/task-management';
import { Task } from './models/task';
import { TaskFilter, TaskSortBy } from './models/task-filter';
import { DateFormatter } from '../../core/utils/date-formatter';

@Component({
  selector: 'app-task-manager',
  providers: [TaskManagement],
  imports: [],
  templateUrl: './task-manager.html',
  styleUrl: './task-manager.css',
})
export class TaskManager {
  readonly initialTab: TaskFilter = 'all';
  readonly initialSort: TaskSortBy = 'dueDate';

  // Inyección de dependencias
  private readonly taskManagementService: TaskManagement = inject(TaskManagement);
  private readonly dateFormatter: DateFormatter = inject(DateFormatter);

  protected readonly allTasks: Signal<Task[]> = this.taskManagementService.allTasks;
  protected readonly remaining: Signal<number> = this.taskManagementService.remaining;
  protected readonly newTaskTitle: WritableSignal<string> = signal('');
  protected readonly newTaskDueDate: WritableSignal<string> = signal('');
  protected readonly editingTaskId: WritableSignal<number | null> = signal<number | null>(null);
  protected readonly editingTaskTitle: WritableSignal<string> = signal<string>('');

  // Nuevas señales para filtros y ordenamiento
  protected readonly activeTab: WritableSignal<TaskFilter> = signal<TaskFilter>(this.initialTab);
  protected readonly sortBy: WritableSignal<TaskSortBy> = signal<TaskSortBy>(this.initialSort);

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

  // Función para verificar si una tarea está vencida (delegada a DateFormatter)
  protected readonly isOverdue: (task: Task) => boolean = (task: Task): boolean => {
    return this.dateFormatter.isOverdue(task);
  };

  protected addTask(): void {
    const dueDate: Date | undefined = this.newTaskDueDate()
      ? this.dateFormatter.parseDateInput(this.newTaskDueDate())
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

  // Métodos de formateo delegados a DateFormatter
  protected formatDate(date: Date | undefined): string {
    return this.dateFormatter.formatLong(date);
  }

  protected formatDateShort(date: Date | undefined): string {
    return this.dateFormatter.formatShort(date);
  }
}
