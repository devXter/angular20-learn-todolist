import { Component, computed, inject, signal, Signal, WritableSignal } from '@angular/core';
import { TaskManagement } from './services/task-management';
import { Task } from './models/task';

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
  protected readonly editingTaskId: WritableSignal<number | null> = signal<number | null>(null);
  protected readonly editingTaskTitle: WritableSignal<string> = signal<string>('');

  protected readonly isEditing: Signal<(id: number) => boolean> = computed(
    (): ((id: number) => boolean) => {
      const editingId: number | null = this.editingTaskId();
      return (id: number): boolean => editingId === id;
    },
  );

  protected addTask(): void {
    this.taskManagementService.addTask(this.newTaskTitle());
    this.newTaskTitle.set('');
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
}
