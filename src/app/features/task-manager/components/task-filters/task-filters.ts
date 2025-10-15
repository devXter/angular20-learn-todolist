import { ChangeDetectionStrategy, Component, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { TaskFilter, TaskSortBy } from '../../models/task-filter';

@Component({
  selector: 'app-task-filters',
  templateUrl: './task-filters.html',
  styleUrl: './task-filters.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskFilters {
  // Inputs
  readonly activeTab: InputSignal<TaskFilter> = input.required<TaskFilter>();
  readonly sortBy: InputSignal<TaskSortBy> = input.required<TaskSortBy>();

  // Outputs
  readonly tabChanged: OutputEmitterRef<TaskFilter> = output<TaskFilter>();
  readonly sortChanged: OutputEmitterRef<TaskSortBy> = output<TaskSortBy>();

  /**
   * Handles tab click events
   * @param tab - The selected filter tab
   */
  protected onTabClick(tab: TaskFilter): void {
    this.tabChanged.emit(tab);
  }

  /**
   * Handles sort change events
   * @param event - The change event from the select element
   */
  protected onSortChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.sortChanged.emit(target.value as TaskSortBy);
  }
}
