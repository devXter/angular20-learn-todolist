import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef
} from '@angular/core';
import { Task } from '../../models/task';
import { TaskItem } from '../task-item';
import { DateFormatter } from '../../../../core/utils/date-formatter';

/**
 * Presentational component for displaying a list of tasks
 * Follows the smart/presentational component pattern
 *
 * This component is responsible only for rendering tasks and delegating
 * all user actions to the parent component through output events.
 */
@Component({
  selector: 'app-task-list',
  imports: [TaskItem],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskList {
  // Inject DateFormatter service to check if tasks are overdue
  private readonly dateFormatter: DateFormatter = inject(DateFormatter);

  // Input signals - required data from parent
  readonly tasks: InputSignal<Task[]> = input.required<Task[]>();
  readonly editingTaskId: InputSignal<number | null> = input.required<number | null>();

  // Output events - delegate all task-item events to parent
  readonly taskToggled: OutputEmitterRef<number> = output<number>();
  readonly taskDeleted: OutputEmitterRef<number> = output<number>();
  readonly taskEditStarted: OutputEmitterRef<Task> = output<Task>();
  readonly taskSaved: OutputEmitterRef<{ id: number; title: string }> = output<{
    id: number;
    title: string;
  }>();
  readonly editCancelled: OutputEmitterRef<void> = output<void>();

  /**
   * Check if a task is overdue
   * Delegates to DateFormatter service for consistent logic
   */
  protected isTaskOverdue(task: Task): boolean {
    return this.dateFormatter.isOverdue(task);
  }

  /**
   * Handle task toggle event - re-emit to parent
   */
  protected onTaskToggle(taskId: number): void {
    this.taskToggled.emit(taskId);
  }

  /**
   * Handle task deletes event - re-emit to parent
   */
  protected onTaskDelete(taskId: number): void {
    this.taskDeleted.emit(taskId);
  }

  /**
   * Handle task edit started event - re-emit to parent
   */
  protected onTaskEditStart(task: Task): void {
    this.taskEditStarted.emit(task);
  }

  /**
   * Handle a task save event - re-emit to parent
   */
  protected onTaskSave(payload: { id: number; title: string }): void {
    this.taskSaved.emit(payload);
  }

  /**
   * Handle edit cancel event - re-emit to parent
   */
  protected onEditCancel(): void {
    this.editCancelled.emit();
  }
}
