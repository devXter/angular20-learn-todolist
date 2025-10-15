import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TaskItem } from './task-item';
import { Task } from '../../models/task';
import { DateFormatter } from '../../../../core/utils/date-formatter';

describe('TaskItem', () => {
  let component: TaskItem;
  let fixture: ComponentFixture<TaskItem>;
  let compiled: HTMLElement;

  const mockTask: Task = {
    id: 1,
    title: 'Test Task',
    completed: false,
    createdAt: new Date('2025-01-01'),
    dueDate: new Date('2025-12-31'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskItem],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskItem);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should inject DateFormatter service', () => {
      expect((component as any).dateFormatter).toBeTruthy();
      expect((component as any).dateFormatter).toBeInstanceOf(DateFormatter);
    });
  });

  describe('Input Signals', () => {
    it('should require task input signal', () => {
      fixture.componentRef.setInput('task', mockTask);
      fixture.componentRef.setInput('isEditing', false);
      fixture.componentRef.setInput('isOverdue', false);
      fixture.detectChanges();

      expect(component.task()).toEqual(mockTask);
    });

    it('should require isEditing input signal', () => {
      fixture.componentRef.setInput('task', mockTask);
      fixture.componentRef.setInput('isEditing', true);
      fixture.componentRef.setInput('isOverdue', false);
      fixture.detectChanges();

      expect(component.isEditing()).toBe(true);
    });

    it('should require isOverdue input signal', () => {
      fixture.componentRef.setInput('task', mockTask);
      fixture.componentRef.setInput('isEditing', false);
      fixture.componentRef.setInput('isOverdue', true);
      fixture.detectChanges();

      expect(component.isOverdue()).toBe(true);
    });
  });

  describe('Output Events', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('task', mockTask);
      fixture.componentRef.setInput('isEditing', false);
      fixture.componentRef.setInput('isOverdue', false);
      fixture.detectChanges();
    });

    it('should emit toggle event with task id when checkbox is toggled', async () => {
      const promise = new Promise<number>((resolve) => {
        component.toggle.subscribe((id: number) => resolve(id));
      });

      const checkbox = compiled.querySelector('input[type="checkbox"]') as HTMLInputElement;
      checkbox.click();

      const id = await promise;
      expect(id).toBe(mockTask.id);
    });

    it('should emit delete event with task id when delete button is clicked', async () => {
      const promise = new Promise<number>((resolve) => {
        component.delete.subscribe((id: number) => resolve(id));
      });

      const deleteButton = compiled.querySelectorAll('button')[1] as HTMLButtonElement;
      deleteButton.click();

      const id = await promise;
      expect(id).toBe(mockTask.id);
    });

    it('should emit edit event with task when edit button is clicked', async () => {
      const promise = new Promise<Task>((resolve) => {
        component.edit.subscribe((task: Task) => resolve(task));
      });

      const editButton = compiled.querySelector('button') as HTMLButtonElement;
      editButton.click();

      const task = await promise;
      expect(task).toEqual(mockTask);
    });

    it('should emit save event with id and title when save button is clicked in edit mode', async () => {
      fixture.componentRef.setInput('isEditing', true);
      fixture.detectChanges();

      const newTitle = 'Updated Task Title';
      component.editTitle.set(newTitle);

      const promise = new Promise<{ id: number; title: string }>((resolve) => {
        component.save.subscribe((data: { id: number; title: string }) => resolve(data));
      });

      const saveButton = compiled.querySelector('button') as HTMLButtonElement;
      saveButton.click();

      const data = await promise;
      expect(data.id).toBe(mockTask.id);
      expect(data.title).toBe(newTitle);
    });

    it('should emit cancel event when cancel button is clicked in edit mode', async () => {
      fixture.componentRef.setInput('isEditing', true);
      fixture.detectChanges();

      const promise = new Promise<void>((resolve) => {
        component.cancel.subscribe(() => resolve());
      });

      const cancelButton = compiled.querySelectorAll('button')[1] as HTMLButtonElement;
      cancelButton.click();

      await promise;
      expect(true).toBe(true); // Assert that promise resolved
    });
  });

  describe('Edit Mode Behavior', () => {
    it('should set editTitle to task title when entering edit mode', () => {
      fixture.componentRef.setInput('task', mockTask);
      fixture.componentRef.setInput('isEditing', false);
      fixture.componentRef.setInput('isOverdue', false);
      fixture.detectChanges();

      // editTitle should be empty before entering edit mode
      // Note: We don't check the initial value because the effect may run
      // at component initialization depending on timing

      fixture.componentRef.setInput('isEditing', true);
      fixture.detectChanges();

      // After entering edit mode, editTitle should sync with task title
      expect(component.editTitle()).toBe(mockTask.title);
    });

    it('should update editTitle when input changes', () => {
      fixture.componentRef.setInput('task', mockTask);
      fixture.componentRef.setInput('isEditing', true);
      fixture.componentRef.setInput('isOverdue', false);
      fixture.detectChanges();

      const newTitle = 'New Title';
      const input = compiled.querySelector('input[type="text"]') as HTMLInputElement;

      // Simulate user input
      input.value = newTitle;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      fixture.detectChanges();

      expect(component.editTitle()).toBe(newTitle);
    });

    it('should trim whitespace from editTitle on input', () => {
      fixture.componentRef.setInput('task', mockTask);
      fixture.componentRef.setInput('isEditing', true);
      fixture.componentRef.setInput('isOverdue', false);
      fixture.detectChanges();

      const input = compiled.querySelector('input[type="text"]') as HTMLInputElement;

      // Simulate user input with whitespace
      input.value = '  New Title  ';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      fixture.detectChanges();

      expect(component.editTitle()).toBe('New Title');
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('task', mockTask);
      fixture.componentRef.setInput('isEditing', false);
      fixture.componentRef.setInput('isOverdue', false);
      fixture.detectChanges();
    });

    it('should display task title in normal view', () => {
      const titleElement = compiled.querySelector('span.flex-1.text-lg');
      expect(titleElement?.textContent?.trim()).toContain(mockTask.title);
    });

    it('should display checkbox in normal view', () => {
      const checkbox = compiled.querySelector('input[type="checkbox"]');
      expect(checkbox).toBeTruthy();
    });

    it('should display edit and delete buttons in normal view', () => {
      const buttons = compiled.querySelectorAll('button');
      expect(buttons.length).toBe(2);
    });

    it('should display input field in edit mode', () => {
      fixture.componentRef.setInput('isEditing', true);
      fixture.detectChanges();

      const input = compiled.querySelector('input[type="text"]');
      expect(input).toBeTruthy();
    });

    it('should display save and cancel buttons in edit mode', () => {
      fixture.componentRef.setInput('isEditing', true);
      fixture.detectChanges();

      const buttons = compiled.querySelectorAll('button');
      expect(buttons.length).toBe(2);
    });

    it('should display overdue badge when task is overdue', () => {
      fixture.componentRef.setInput('isOverdue', true);
      fixture.detectChanges();

      const badge = compiled.querySelector('.bg-red-500');
      expect(badge?.textContent?.trim()).toContain('Vencida');
    });

    it('should not display overdue badge when task is not overdue', () => {
      const badge = compiled.querySelector('.bg-red-500');
      expect(badge).toBeFalsy();
    });

    it('should apply completed styles when task is completed', () => {
      const completedTask: Task = { ...mockTask, completed: true };
      fixture.componentRef.setInput('task', completedTask);
      fixture.detectChanges();

      const titleElement = compiled.querySelector('span.flex-1.text-lg');
      expect(titleElement?.classList.contains('line-through')).toBe(true);
      expect(titleElement?.classList.contains('text-emerald-700')).toBe(true);
    });

    it('should disable edit button when task is completed', () => {
      const completedTask: Task = { ...mockTask, completed: true };
      fixture.componentRef.setInput('task', completedTask);
      fixture.detectChanges();

      const editButton = compiled.querySelector('button') as HTMLButtonElement;
      expect(editButton.disabled).toBe(true);
    });

    it('should display created date', () => {
      const dateElement = compiled.querySelector('.flex.items-center.gap-1 > span');
      expect(dateElement?.textContent?.trim()).toContain('Creada:');
    });

    it('should display due date when present', () => {
      const dueDateElements = compiled.querySelectorAll('.flex.items-center.gap-1');
      const dueDateElement = Array.from(dueDateElements).find((el) =>
        el.textContent?.includes('Vence:'),
      );
      expect(dueDateElement).toBeTruthy();
    });

    it('should not display due date when not present', () => {
      const taskWithoutDueDate: Task = { ...mockTask, dueDate: undefined };
      fixture.componentRef.setInput('task', taskWithoutDueDate);
      fixture.detectChanges();

      const dueDateElements = compiled.querySelectorAll('.flex.items-center.gap-1');
      const dueDateElement = Array.from(dueDateElements).find((el) =>
        el.textContent?.includes('Vence:'),
      );
      expect(dueDateElement).toBeFalsy();
    });
  });

  describe('Date Formatting', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('task', mockTask);
      fixture.componentRef.setInput('isEditing', false);
      fixture.componentRef.setInput('isOverdue', false);
      fixture.detectChanges();
    });

    it('should format dates using DateFormatter service', () => {
      const dateFormatter = (component as any).dateFormatter;
      const formatted = dateFormatter.formatShort(mockTask.createdAt);
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });

    it('should return empty string for undefined dates', () => {
      const dateFormatter = (component as any).dateFormatter;
      const formatted = dateFormatter.formatShort(undefined);
      expect(formatted).toBe('');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('task', mockTask);
      fixture.componentRef.setInput('isEditing', false);
      fixture.componentRef.setInput('isOverdue', false);
      fixture.detectChanges();
    });

    it('should have proper ARIA attributes for SVG icons', () => {
      const svgs = compiled.querySelectorAll('svg[aria-hidden="true"]');
      expect(svgs.length).toBeGreaterThan(0);
    });

    it('should hide checkbox visually but keep it accessible', () => {
      const checkbox = compiled.querySelector('input[type="checkbox"]');
      expect(checkbox?.classList.contains('sr-only')).toBe(true);
    });

    it('should have proper label association for checkbox', () => {
      const label = compiled.querySelector('label');
      const checkbox = label?.querySelector('input[type="checkbox"]');
      expect(checkbox).toBeTruthy();
    });
  });

  describe('Keyboard Interactions', () => {
    it('should trigger save on Enter key in edit mode', async () => {
      fixture.componentRef.setInput('task', mockTask);
      fixture.componentRef.setInput('isEditing', true);
      fixture.componentRef.setInput('isOverdue', false);
      fixture.detectChanges();

      const promise = new Promise<void>((resolve) => {
        component.save.subscribe(() => resolve());
      });

      const input = compiled.querySelector('input[type="text"]') as HTMLInputElement;
      const enterEvent = new KeyboardEvent('keyup', { key: 'Enter', bubbles: true });
      input.dispatchEvent(enterEvent);
      fixture.detectChanges();

      await promise;
      expect(true).toBe(true); // Assert that promise resolved
    });
  });
});
