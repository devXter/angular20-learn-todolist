import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
  OutputEmitterRef,
  signal,
  WritableSignal
} from '@angular/core';
import { DateFormatter } from '../../../../core/utils/date-formatter';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.html',
  styleUrl: './task-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskForm {
  // Dependency injection
  private readonly dateFormatter: DateFormatter = inject(DateFormatter);

  // Outputs
  readonly taskAdded: OutputEmitterRef<{ title: string; dueDate?: Date }> = output<{
    title: string;
    dueDate?: Date;
  }>();

  // Local state signals
  readonly title: WritableSignal<string> = signal<string>('');
  readonly dueDate: WritableSignal<string> = signal<string>('');

  /**
   * Validates that the form has a non-empty title
   */
  protected isFormValid(): boolean {
    return this.title().trim() !== '';
  }

  /**
   * Handles form submission
   * Validates, emits taskAdded event, and resets the form
   */
  protected onSubmit(): void {
    if (!this.isFormValid()) {
      return;
    }

    const taskTitle: string = this.title().trim();
    const taskDueDate: Date | undefined = this.dueDate()
      ? this.dateFormatter.parseDateInput(this.dueDate())
      : undefined;

    this.taskAdded.emit({
      title: taskTitle,
      dueDate: taskDueDate,
    });

    // Reset form
    this.title.set('');
    this.dueDate.set('');
  }
}
