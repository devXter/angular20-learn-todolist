import { ChangeDetectionStrategy, Component, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { Task } from './models/task';
import { TaskManager } from './services/task-manager';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly taskManager: TaskManager = inject(TaskManager);

  protected readonly allTasks: Signal<Task[]> = this.taskManager.allTasks;
  protected readonly remaining: Signal<number> = this.taskManager.remaining;
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
    this.taskManager.addTask(this.newTaskTitle());
    this.newTaskTitle.set('');
  }

  protected toggleCompleted(id: number): void {
    this.taskManager.toggleCompleted(id);
  }

  protected deleteTask(id: number): void {
    this.taskManager.deleteTask(id);
  }

  startEditingTask(task: Task): void {
    const { id, title } = task;

    this.editingTaskId.set(id);
    this.editingTaskTitle.set(title);
  }

  saveEditedTask(): void {
    const id: number | null = this.editingTaskId();
    if (id === null) return;

    this.taskManager.updateTask(id, this.editingTaskTitle());
    this.cancelEditing();
  }

  cancelEditing(): void {
    this.editingTaskId.set(null);
    this.editingTaskTitle.set('');
  }
}
