import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  signal,
  WritableSignal
} from '@angular/core';
import { Task } from '../../models/task';
import { DateFormatter } from '../../../../core/utils/date-formatter';

/**
 * Presentational component for displaying a single task item
 * Follows the smart/presentational component pattern
 *
 * This component is responsible only for displaying task data and emitting events.
 * All business logic and state management is handled by the parent component.
 */
@Component({
  selector: 'app-task-item',
  templateUrl: './task-item.html',
  styleUrl: './task-item.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskItem {
  // Inject DateFormatter service for date formatting
  private readonly dateFormatter: DateFormatter = inject(DateFormatter);

  // Input signals - required data from parent
  readonly task: InputSignal<Task> = input.required<Task>();
  readonly isEditing: InputSignal<boolean> = input.required<boolean>();
  readonly isOverdue: InputSignal<boolean> = input.required<boolean>();

  // Output events - communicate user actions to parent
  readonly toggle: OutputEmitterRef<number> = output<number>();
  readonly delete: OutputEmitterRef<number> = output<number>();
  readonly edit: OutputEmitterRef<Task> = output<Task>();
  readonly save: OutputEmitterRef<{ id: number; title: string }> = output<{
    id: number;
    title: string;
  }>();
  readonly cancel: OutputEmitterRef<void> = output<void>();

  // Local state for editing mode
  readonly editTitle: WritableSignal<string> = signal<string>('');

  constructor() {
    // Effect to synchronize editTitle with task title when entering edit mode
    effect(() => {
      if (this.isEditing()) {
        this.editTitle.set(this.task().title);
      }
    });
  }

  /**
   * Format a date in short format (e.g., "01 oct")
   */
  protected formatDateShort(date: Date | undefined): string {
    return this.dateFormatter.formatShort(date);
  }

  /**
   * Handle checkbox toggle - emit task ID to parent
   */
  protected onToggle(): void {
    this.toggle.emit(this.task().id);
  }

  /**
   * Handle delete button click - emit task ID to parent
   */
  protected onDelete(): void {
    this.delete.emit(this.task().id);
  }

  /**
   * Handle edit button click - emit a complete task to parent
   */
  protected onEdit(): void {
    this.edit.emit(this.task());
  }

  /**
   * Handle save button click - emit task ID and new title
   */
  protected onSave(): void {
    this.save.emit({
      id: this.task().id,
      title: this.editTitle(),
    });
  }

  /**
   * Handle cancel button click - emit cancel event
   */
  protected onCancel(): void {
    this.cancel.emit();
  }

  /**
   * Update editTitle signal on input change
   */
  protected onEditTitleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.editTitle.set(target.value.trim());
  }
}
