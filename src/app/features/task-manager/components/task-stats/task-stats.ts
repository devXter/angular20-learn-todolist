import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';

@Component({
  selector: 'app-task-stats',
  templateUrl: './task-stats.html',
  styleUrl: './task-stats.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskStats {
  /**
   * Number of pending (incomplete) tasks
   */
  remaining: InputSignal<number> = input.required<number>();

  /**
   * Total number of tasks
   */
  total: InputSignal<number> = input.required<number>();
}
