import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { vi } from 'vitest';
import { TaskForm } from './task-form';
import { DateFormatter } from '../../../../core/utils/date-formatter';
import { signal } from '@angular/core';

describe('TaskForm', () => {
  let component: TaskForm;
  let fixture: ComponentFixture<TaskForm>;
  let dateFormatter: DateFormatter;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskForm],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskForm);
    component = fixture.componentInstance;
    dateFormatter = TestBed.inject(DateFormatter);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('isFormValid', () => {
    it('should return false when title is empty', () => {
      component.title.set('');
      expect(component['isFormValid']()).toBe(false);
    });

    it('should return false when title contains only whitespace', () => {
      component.title.set('   ');
      expect(component['isFormValid']()).toBe(false);
    });

    it('should return true when title has non-empty value', () => {
      component.title.set('New Task');
      expect(component['isFormValid']()).toBe(true);
    });
  });

  describe('onSubmit', () => {
    it('should not emit taskAdded when form is invalid', () => {
      const emitSpy = vi.spyOn(component.taskAdded, 'emit');
      component.title.set('');

      component['onSubmit']();

      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should emit taskAdded with title only when dueDate is empty', () => {
      const emitSpy = vi.spyOn(component.taskAdded, 'emit');
      component.title.set('My new task');
      component.dueDate.set('');

      component['onSubmit']();

      expect(emitSpy).toHaveBeenCalledWith({
        title: 'My new task',
        dueDate: undefined,
      });
    });

    it('should emit taskAdded with title and parsed dueDate', () => {
      const emitSpy = vi.spyOn(component.taskAdded, 'emit');
      const testDate = '2025-12-31';
      component.title.set('Task with due date');
      component.dueDate.set(testDate);

      component['onSubmit']();

      expect(emitSpy).toHaveBeenCalledWith({
        title: 'Task with due date',
        dueDate: new Date('2025-12-31T00:00:00'),
      });
    });

    it('should trim whitespace from title before emitting', () => {
      const emitSpy = vi.spyOn(component.taskAdded, 'emit');
      component.title.set('  Task with spaces  ');

      component['onSubmit']();

      expect(emitSpy).toHaveBeenCalledWith({
        title: 'Task with spaces',
        dueDate: undefined,
      });
    });

    it('should reset form after successful submission', () => {
      component.title.set('Task to submit');
      component.dueDate.set('2025-12-31');

      component['onSubmit']();

      expect(component.title()).toBe('');
      expect(component.dueDate()).toBe('');
    });
  });

  describe('template bindings', () => {
    it('should disable submit button when form is invalid', () => {
      component.title.set('');
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button');
      expect(button.disabled).toBe(true);
    });

    it('should enable submit button when form is valid', () => {
      component.title.set('Valid task');
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button');
      expect(button.disabled).toBe(false);
    });

    it('should update title signal on input change', () => {
      const input = fixture.nativeElement.querySelector('input[type="text"]');
      input.value = 'New task title';
      input.dispatchEvent(new Event('input'));

      expect(component.title()).toBe('New task title');
    });

    it('should update dueDate signal on date input change', () => {
      const dateInput = fixture.nativeElement.querySelector('input[type="date"]');
      dateInput.value = '2025-12-31';
      dateInput.dispatchEvent(new Event('input'));

      expect(component.dueDate()).toBe('2025-12-31');
    });

    it('should call onSubmit when submit button is clicked', () => {
      const onSubmitSpy = vi.spyOn(component as any, 'onSubmit');
      component.title.set('Task');
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button');
      button.click();

      expect(onSubmitSpy).toHaveBeenCalled();
    });

    it('should call onSubmit when Enter key is pressed in title input', () => {
      const onSubmitSpy = vi.spyOn(component as any, 'onSubmit');
      component.title.set('Task');
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input[type="text"]');
      const event = new KeyboardEvent('keyup', { key: 'Enter' });
      input.dispatchEvent(event);

      expect(onSubmitSpy).toHaveBeenCalled();
    });

    it('should call onSubmit when Enter key is pressed in date input', () => {
      const onSubmitSpy = vi.spyOn(component as any, 'onSubmit');
      component.title.set('Task');
      fixture.detectChanges();

      const dateInput = fixture.nativeElement.querySelector('input[type="date"]');
      const event = new KeyboardEvent('keyup', { key: 'Enter' });
      dateInput.dispatchEvent(event);

      expect(onSubmitSpy).toHaveBeenCalled();
    });
  });

  describe('DateFormatter integration', () => {
    it('should use DateFormatter to parse date input', () => {
      const parseSpy = vi.spyOn(dateFormatter, 'parseDateInput');
      component.title.set('Task');
      component.dueDate.set('2025-12-31');

      component['onSubmit']();

      expect(parseSpy).toHaveBeenCalledWith('2025-12-31');
    });

    it('should not call DateFormatter.parseDateInput when dueDate is empty', () => {
      const parseSpy = vi.spyOn(dateFormatter, 'parseDateInput');
      component.title.set('Task');
      component.dueDate.set('');

      component['onSubmit']();

      expect(parseSpy).not.toHaveBeenCalled();
    });
  });
});
