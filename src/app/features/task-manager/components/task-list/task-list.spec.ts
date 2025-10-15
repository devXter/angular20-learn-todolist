import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { vi } from 'vitest';
import { TaskList } from './task-list';
import { Task } from '../../models/task';
import { DateFormatter } from '../../../../core/utils/date-formatter';
import { ComponentRef, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('TaskList', () => {
  let component: TaskList;
  let componentRef: ComponentRef<TaskList>;
  let fixture: ComponentFixture<TaskList>;
  let dateFormatter: DateFormatter;

  const mockTasks: Task[] = [
    {
      id: 1,
      title: 'Test Task 1',
      completed: false,
      createdAt: new Date('2025-01-01'),
      dueDate: new Date('2025-12-31'),
    },
    {
      id: 2,
      title: 'Test Task 2',
      completed: true,
      createdAt: new Date('2025-01-02'),
    },
    {
      id: 3,
      title: 'Overdue Task',
      completed: false,
      createdAt: new Date('2025-01-03'),
      dueDate: new Date('2020-01-01'), // Past date - overdue
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskList],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskList);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    dateFormatter = TestBed.inject(DateFormatter);

    // Set required inputs
    componentRef.setInput('tasks', []);
    componentRef.setInput('editingTaskId', null);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Empty State', () => {
    it('should display empty state when tasks array is empty', () => {
      componentRef.setInput('tasks', []);
      fixture.detectChanges();

      const emptyState: DebugElement | null = fixture.debugElement.query(
        By.css('.rounded-2xl.bg-white.p-12.text-center'),
      );
      expect(emptyState).toBeTruthy();
      expect(emptyState?.nativeElement.textContent).toContain('No hay tareas');
    });

    it('should not display empty state when tasks exist', () => {
      componentRef.setInput('tasks', mockTasks);
      fixture.detectChanges();

      const emptyState: DebugElement | null = fixture.debugElement.query(
        By.css('.rounded-2xl.bg-white.p-12.text-center'),
      );
      expect(emptyState).toBeNull();
    });
  });

  describe('Task Rendering', () => {
    it('should render all tasks', () => {
      componentRef.setInput('tasks', mockTasks);
      fixture.detectChanges();

      const taskItems: DebugElement[] = fixture.debugElement.queryAll(By.css('app-task-item'));
      expect(taskItems.length).toBe(mockTasks.length);
    });

    it('should pass task data to task-item component', () => {
      componentRef.setInput('tasks', mockTasks);
      fixture.detectChanges();

      const taskItems: DebugElement[] = fixture.debugElement.queryAll(By.css('app-task-item'));
      const firstTaskItem = taskItems[0];

      expect(firstTaskItem.componentInstance.task()).toEqual(mockTasks[0]);
    });

    it('should pass isEditing correctly when task is being edited', () => {
      componentRef.setInput('tasks', mockTasks);
      componentRef.setInput('editingTaskId', 1);
      fixture.detectChanges();

      const taskItems: DebugElement[] = fixture.debugElement.queryAll(By.css('app-task-item'));
      const firstTaskItem = taskItems[0];
      const secondTaskItem = taskItems[1];

      expect(firstTaskItem.componentInstance.isEditing()).toBe(true);
      expect(secondTaskItem.componentInstance.isEditing()).toBe(false);
    });

    it('should pass isOverdue flag to task-item component', () => {
      componentRef.setInput('tasks', mockTasks);
      fixture.detectChanges();

      const taskItems: DebugElement[] = fixture.debugElement.queryAll(By.css('app-task-item'));
      const overdueTaskItem = taskItems[2]; // Third task is overdue

      expect(overdueTaskItem.componentInstance.isOverdue()).toBe(true);
    });
  });

  describe('Conditional Styling', () => {
    it('should apply completed gradient classes to completed tasks', () => {
      componentRef.setInput('tasks', mockTasks);
      fixture.detectChanges();

      const taskWrappers: DebugElement[] = fixture.debugElement.queryAll(
        By.css('.mb-2.rounded-2xl'),
      );
      const completedWrapper = taskWrappers[1].nativeElement; // Second task is completed

      expect(completedWrapper.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(completedWrapper.classList.contains('from-emerald-50')).toBe(true);
      expect(completedWrapper.classList.contains('to-teal-50')).toBe(true);
    });

    it('should apply overdue border classes to overdue tasks', () => {
      componentRef.setInput('tasks', mockTasks);
      fixture.detectChanges();

      const taskWrappers: DebugElement[] = fixture.debugElement.queryAll(
        By.css('.mb-2.rounded-2xl'),
      );
      const overdueWrapper = taskWrappers[2].nativeElement; // Third task is overdue

      expect(overdueWrapper.classList.contains('border-l-8')).toBe(true);
      expect(overdueWrapper.classList.contains('border-red-500')).toBe(true);
      expect(overdueWrapper.classList.contains('!bg-red-50')).toBe(true);
    });

    it('should not apply overdue classes to completed tasks even if past due date', () => {
      const completedOverdueTasks: Task[] = [
        {
          id: 1,
          title: 'Completed Overdue Task',
          completed: true,
          createdAt: new Date('2025-01-01'),
          dueDate: new Date('2020-01-01'), // Past date but completed
        },
      ];

      componentRef.setInput('tasks', completedOverdueTasks);
      fixture.detectChanges();

      const taskWrappers: DebugElement[] = fixture.debugElement.queryAll(
        By.css('.mb-2.rounded-2xl'),
      );
      const taskWrapper = taskWrappers[0].nativeElement;

      // Should have completed styles
      expect(taskWrapper.classList.contains('bg-gradient-to-r')).toBe(true);
      // Should NOT have overdue styles
      expect(taskWrapper.classList.contains('border-l-8')).toBe(false);
    });
  });

  describe('Event Delegation', () => {
    it('should emit taskToggled when task-item toggle event fires', async () => {
      const promise = new Promise<number>((resolve) => {
        component.taskToggled.subscribe((id: number) => resolve(id));
      });

      componentRef.setInput('tasks', mockTasks);
      fixture.detectChanges();

      const taskItems: DebugElement[] = fixture.debugElement.queryAll(By.css('app-task-item'));
      const firstTaskItem = taskItems[0];

      firstTaskItem.componentInstance.toggle.emit(1);

      const id = await promise;
      expect(id).toBe(1);
    });

    it('should emit taskDeleted when task-item delete event fires', async () => {
      const promise = new Promise<number>((resolve) => {
        component.taskDeleted.subscribe((id: number) => resolve(id));
      });

      componentRef.setInput('tasks', mockTasks);
      fixture.detectChanges();

      const taskItems: DebugElement[] = fixture.debugElement.queryAll(By.css('app-task-item'));
      const firstTaskItem = taskItems[0];

      firstTaskItem.componentInstance.delete.emit(1);

      const id = await promise;
      expect(id).toBe(1);
    });

    it('should emit taskEditStarted when task-item edit event fires', async () => {
      const promise = new Promise<Task>((resolve) => {
        component.taskEditStarted.subscribe((task: Task) => resolve(task));
      });

      componentRef.setInput('tasks', mockTasks);
      fixture.detectChanges();

      const taskItems: DebugElement[] = fixture.debugElement.queryAll(By.css('app-task-item'));
      const firstTaskItem = taskItems[0];

      firstTaskItem.componentInstance.edit.emit(mockTasks[0]);

      const task = await promise;
      expect(task).toEqual(mockTasks[0]);
    });

    it('should emit taskSaved when task-item save event fires', async () => {
      const promise = new Promise<{ id: number; title: string }>((resolve) => {
        component.taskSaved.subscribe((data: { id: number; title: string }) => resolve(data));
      });

      componentRef.setInput('tasks', mockTasks);
      fixture.detectChanges();

      const taskItems: DebugElement[] = fixture.debugElement.queryAll(By.css('app-task-item'));
      const firstTaskItem = taskItems[0];

      const savePayload = { id: 1, title: 'Updated Title' };
      firstTaskItem.componentInstance.save.emit(savePayload);

      const data = await promise;
      expect(data.id).toBe(1);
      expect(data.title).toBe('Updated Title');
    });

    it('should emit editCancelled when task-item cancel event fires', async () => {
      const promise = new Promise<void>((resolve) => {
        component.editCancelled.subscribe(() => resolve());
      });

      componentRef.setInput('tasks', mockTasks);
      fixture.detectChanges();

      const taskItems: DebugElement[] = fixture.debugElement.queryAll(By.css('app-task-item'));
      const firstTaskItem = taskItems[0];

      firstTaskItem.componentInstance.cancel.emit();

      await promise;
      expect(true).toBe(true); // Assert that promise resolved
    });
  });

  describe('isTaskOverdue method', () => {
    it('should delegate to DateFormatter service', () => {
      const spy = vi.spyOn(dateFormatter, 'isOverdue');

      component['isTaskOverdue'](mockTasks[0]);

      expect(spy).toHaveBeenCalledWith(mockTasks[0]);
    });

    it('should return true for overdue tasks', () => {
      const overdueTask: Task = {
        id: 1,
        title: 'Overdue',
        completed: false,
        createdAt: new Date(),
        dueDate: new Date('2020-01-01'),
      };

      const result = component['isTaskOverdue'](overdueTask);

      expect(result).toBe(true);
    });

    it('should return false for completed tasks', () => {
      const completedTask: Task = {
        id: 1,
        title: 'Completed',
        completed: true,
        createdAt: new Date(),
        dueDate: new Date('2020-01-01'),
      };

      const result = component['isTaskOverdue'](completedTask);

      expect(result).toBe(false);
    });

    it('should return false for tasks without due date', () => {
      const taskWithoutDueDate: Task = {
        id: 1,
        title: 'No Due Date',
        completed: false,
        createdAt: new Date(),
      };

      const result = component['isTaskOverdue'](taskWithoutDueDate);

      expect(result).toBe(false);
    });
  });

  describe('Track By', () => {
    it('should track tasks by id', () => {
      componentRef.setInput('tasks', mockTasks);
      fixture.detectChanges();

      const taskItems: DebugElement[] = fixture.debugElement.queryAll(By.css('app-task-item'));
      const initialLength = taskItems.length;

      // Modify tasks array but keep same IDs
      const modifiedTasks: Task[] = mockTasks.map((task) => ({
        ...task,
        title: 'Modified ' + task.title,
      }));

      componentRef.setInput('tasks', modifiedTasks);
      fixture.detectChanges();

      const newTaskItems: DebugElement[] = fixture.debugElement.queryAll(
        By.css('app-task-item'),
      );

      // Should still render same number of items with same IDs
      expect(newTaskItems.length).toBe(initialLength);
    });
  });
});
