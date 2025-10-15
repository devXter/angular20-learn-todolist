import { Component, computed, inject, signal, Signal, WritableSignal } from '@angular/core';
import { TaskManagement } from './services/task-management';
import { Task } from './models/task';
import { TaskFilter, TaskSortBy } from './models/task-filter';
import { TaskForm } from './components/task-form';
import { TaskStats } from './components/task-stats';
import { TaskFilters } from './components/task-filters';
import { TaskList } from './components/task-list';

@Component({
  selector: 'app-task-manager',
  providers: [TaskManagement],
  imports: [TaskForm, TaskStats, TaskFilters, TaskList],
  templateUrl: './task-manager.html',
  styleUrl: './task-manager.css',
})
export class TaskManager {
  readonly initialTab: TaskFilter = 'all';
  readonly initialSort: TaskSortBy = 'dueDate';

  // Inyección de dependencias
  private readonly taskManagementService: TaskManagement = inject(TaskManagement);

  protected readonly allTasks: Signal<Task[]> = this.taskManagementService.allTasks;
  protected readonly remaining: Signal<number> = this.taskManagementService.remaining;
  protected readonly editingTaskId: WritableSignal<number | null> = signal<number | null>(null);

  // Nuevas señales para filtros y ordenamiento
  protected readonly activeTab: WritableSignal<TaskFilter> = signal<TaskFilter>(this.initialTab);
  protected readonly sortBy: WritableSignal<TaskSortBy> = signal<TaskSortBy>(this.initialSort);

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

  // Event handlers for child components
  protected handleTaskAdded(event: { title: string; dueDate?: Date }): void {
    this.taskManagementService.addTask(event.title, event.dueDate);
  }

  protected toggleCompleted(id: number): void {
    this.taskManagementService.toggleCompleted(id);
  }

  protected deleteTask(id: number): void {
    this.taskManagementService.deleteTask(id);
  }

  protected startEditingTask(task: Task): void {
    this.editingTaskId.set(task.id);
  }

  protected saveEditedTask(event: { id: number; title: string }): void {
    this.taskManagementService.updateTask(event.id, event.title);
    this.cancelEditing();
  }

  protected cancelEditing(): void {
    this.editingTaskId.set(null);
  }

  protected setActiveTab(tab: TaskFilter): void {
    this.activeTab.set(tab);
  }

  protected setSortBy(sortBy: TaskSortBy): void {
    this.sortBy.set(sortBy);
  }
}
