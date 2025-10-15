import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement, provideZonelessChangeDetection, signal } from '@angular/core';
import { vi } from 'vitest';
import { TaskManager } from './task-manager';
import { TaskManagement } from './services/task-management';
import { Task } from './models/task';
import { TaskFilter, TaskSortBy } from './models/task-filter';
import { By } from '@angular/platform-browser';

describe('TaskManager', () => {
  let component: TaskManager;
  let fixture: ComponentFixture<TaskManager>;
  let mockTaskManagementService: jasmine.SpyObj<TaskManagement>;

  const mockTasks: Task[] = [
    {
      id: 1,
      title: 'Task 1',
      completed: false,
      createdAt: new Date('2025-01-01'),
      dueDate: new Date('2025-12-31'),
    },
    {
      id: 2,
      title: 'Task 2',
      completed: true,
      createdAt: new Date('2025-01-02'),
    },
    {
      id: 3,
      title: 'Task 3',
      completed: false,
      createdAt: new Date('2025-01-03'),
      dueDate: new Date('2025-10-15'),
    },
  ];

  beforeEach(async () => {
    // Create mock signals
    const allTasksSignal = signal<Task[]>(mockTasks);
    const activeTasksSignal = signal<Task[]>(mockTasks.filter((t) => !t.completed));
    const completedTasksSignal = signal<Task[]>(mockTasks.filter((t) => t.completed));
    const remainingSignal = signal<number>(2);
    const overdueTasksSignal = signal<Task[]>([]);

    // Create a mock service
    mockTaskManagementService = {
      allTasks: allTasksSignal.asReadonly(),
      activeTasks: activeTasksSignal.asReadonly(),
      completedTasks: completedTasksSignal.asReadonly(),
      overdueTasks: overdueTasksSignal.asReadonly(),
      remaining: remainingSignal.asReadonly(),
      addTask: vi.fn(),
      toggleCompleted: vi.fn(),
      deleteTask: vi.fn(),
      updateTask: vi.fn(),
      getSortedTasks: vi.fn((tasks: Task[], _sortBy: TaskSortBy) => [...tasks]),
    } as any;

    await TestBed.configureTestingModule({
      imports: [TaskManager],
      providers: [provideZonelessChangeDetection()],
    })
      .overrideComponent(TaskManager, {
        set: {
          providers: [{ provide: TaskManagement, useValue: mockTaskManagementService }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(TaskManager);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization & Configuration', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should inject TaskManagement service', () => {
      expect(component['taskManagementService']).toBeTruthy();
      expect(component['taskManagementService']).toBe(mockTaskManagementService);
    });

    it('should initialize with correct default values', () => {
      expect(component.initialTab).toBe('all');
      expect(component.initialSort).toBe('dueDate');
    });
  });

  describe('Signals & State Management', () => {
    it('should initialize activeTab with default value', () => {
      expect(component['activeTab']()).toBe('all');
    });

    it('should initialize sortBy with default value', () => {
      expect(component['sortBy']()).toBe('dueDate');
    });

    it('should initialize editingTaskId as null', () => {
      expect(component['editingTaskId']()).toBeNull();
    });

    it('should expose allTasks from service', () => {
      expect(component['allTasks']()).toEqual(mockTasks);
    });

    it('should expose remaining count from service', () => {
      expect(component['remaining']()).toBe(2);
    });
  });

  describe('Filter & Sort Logic', () => {
    it('should compute filteredAndSortedTasks correctly for "all" filter', () => {
      component['setActiveTab']('all');
      fixture.detectChanges();

      const filteredTasks = component['filteredAndSortedTasks']();
      expect(filteredTasks.length).toBe(mockTasks.length);
    });

    it('should compute filteredAndSortedTasks correctly for "active" filter', () => {
      component['setActiveTab']('active');
      fixture.detectChanges();

      const filteredTasks = component['filteredAndSortedTasks']();
      expect(filteredTasks.length).toBe(2);
      expect(filteredTasks.every((t) => !t.completed)).toBe(true);
    });

    it('should compute filteredAndSortedTasks correctly for "completed" filter', () => {
      component['setActiveTab']('completed');
      fixture.detectChanges();

      const filteredTasks = component['filteredAndSortedTasks']();
      expect(filteredTasks.length).toBe(1);
      expect(filteredTasks.every((t) => t.completed)).toBe(true);
    });

    it('should call getSortedTasks when computing filteredAndSortedTasks', () => {
      component['setActiveTab']('all');
      component['setSortBy']('title');
      fixture.detectChanges();

      // Access computed signal to trigger computation
      component['filteredAndSortedTasks']();

      expect(mockTaskManagementService.getSortedTasks).toHaveBeenCalled();
    });

    it('should update filteredAndSortedTasks when sortBy changes', () => {
      const initialTasks = component['filteredAndSortedTasks']();

      component['setSortBy']('title');
      fixture.detectChanges();

      const updatedTasks = component['filteredAndSortedTasks']();
      // Both should exist (computed signal should update)
      expect(initialTasks).toBeTruthy();
      expect(updatedTasks).toBeTruthy();
    });
  });

  describe('Event Handlers - Add Task', () => {
    it('should call service.addTask when handleTaskAdded is called', () => {
      const event = { title: 'New Task', dueDate: new Date('2025-12-31') };

      component['handleTaskAdded'](event);

      expect(mockTaskManagementService.addTask).toHaveBeenCalledWith('New Task', event.dueDate);
    });

    it('should call service.addTask without dueDate when not provided', () => {
      const event = { title: 'New Task Without Date' };

      component['handleTaskAdded'](event);

      expect(mockTaskManagementService.addTask).toHaveBeenCalledWith(
        'New Task Without Date',
        undefined,
      );
    });
  });

  describe('Event Handlers - Toggle/Delete/Update', () => {
    it('should call service.toggleCompleted when toggleCompleted is called', () => {
      component['toggleCompleted'](1);

      expect(mockTaskManagementService.toggleCompleted).toHaveBeenCalledWith(1);
    });

    it('should call service.deleteTask when deleteTask is called', () => {
      component['deleteTask'](2);

      expect(mockTaskManagementService.deleteTask).toHaveBeenCalledWith(2);
    });

    it('should call service.updateTask when saveEditedTask is called', () => {
      const event = { id: 1, title: 'Updated Title' };

      component['saveEditedTask'](event);

      expect(mockTaskManagementService.updateTask).toHaveBeenCalledWith(1, 'Updated Title');
    });
  });

  describe('Editing State Management', () => {
    it('should set editingTaskId when startEditingTask is called', () => {
      const task: Task = mockTasks[0];

      component['startEditingTask'](task);

      expect(component['editingTaskId']()).toBe(task.id);
    });

    it('should clear editingTaskId when cancelEditing is called', () => {
      component['startEditingTask'](mockTasks[0]);
      expect(component['editingTaskId']()).toBe(1);

      component['cancelEditing']();

      expect(component['editingTaskId']()).toBeNull();
    });

    it('should clear editingTaskId after saveEditedTask is called', () => {
      component['startEditingTask'](mockTasks[0]);
      expect(component['editingTaskId']()).toBe(1);

      component['saveEditedTask']({ id: 1, title: 'Updated' });

      expect(component['editingTaskId']()).toBeNull();
    });
  });

  describe('Tab & Sort Changes', () => {
    it('should update activeTab when setActiveTab is called', () => {
      component['setActiveTab']('active');

      expect(component['activeTab']()).toBe('active');
    });

    it('should update activeTab for all valid filters', () => {
      const filters: TaskFilter[] = ['all', 'active', 'completed'];

      filters.forEach((filter) => {
        component['setActiveTab'](filter);
        expect(component['activeTab']()).toBe(filter);
      });
    });

    it('should update sortBy when setSortBy is called', () => {
      component['setSortBy']('title');

      expect(component['sortBy']()).toBe('title');
    });

    it('should update sortBy for all valid sort options', () => {
      const sortOptions: TaskSortBy[] = ['dueDate', 'createdAt', 'title'];

      sortOptions.forEach((sortOption) => {
        component['setSortBy'](sortOption);
        expect(component['sortBy']()).toBe(sortOption);
      });
    });
  });

  describe('Child Component Integration', () => {
    it('should render app-task-form component', () => {
      const taskForm: DebugElement | null = fixture.debugElement.query(By.css('app-task-form'));
      expect(taskForm).toBeTruthy();
    });

    it('should render app-task-stats component', () => {
      const taskStats: DebugElement | null = fixture.debugElement.query(By.css('app-task-stats'));
      expect(taskStats).toBeTruthy();
    });

    it('should render app-task-filters component', () => {
      const taskFilters: DebugElement | null = fixture.debugElement.query(
        By.css('app-task-filters'),
      );
      expect(taskFilters).toBeTruthy();
    });

    it('should render app-task-list component', () => {
      const taskList: DebugElement | null = fixture.debugElement.query(By.css('app-task-list'));
      expect(taskList).toBeTruthy();
    });

    it('should pass correct props to task-stats', () => {
      const taskStats: DebugElement = fixture.debugElement.query(By.css('app-task-stats'));

      expect(taskStats.componentInstance.remaining()).toBe(2);
      expect(taskStats.componentInstance.total()).toBe(3);
    });

    it('should pass correct props to task-filters', () => {
      const taskFilters: DebugElement = fixture.debugElement.query(By.css('app-task-filters'));

      expect(taskFilters.componentInstance.activeTab()).toBe('all');
      expect(taskFilters.componentInstance.sortBy()).toBe('dueDate');
    });

    it('should pass correct props to task-list', () => {
      const taskList: DebugElement = fixture.debugElement.query(By.css('app-task-list'));

      expect(taskList.componentInstance.tasks()).toBeTruthy();
      expect(taskList.componentInstance.editingTaskId()).toBeNull();
    });

    it('should handle taskAdded event from task-form', () => {
      const taskForm: DebugElement = fixture.debugElement.query(By.css('app-task-form'));
      const spy = vi.spyOn(component as any, 'handleTaskAdded');

      const event = { title: 'Test Task', dueDate: new Date() };
      taskForm.componentInstance.taskAdded.emit(event);

      expect(spy).toHaveBeenCalledWith(event);
    });

    it('should handle tabChanged event from task-filters', () => {
      const taskFilters: DebugElement = fixture.debugElement.query(By.css('app-task-filters'));
      const spy = vi.spyOn(component as any, 'setActiveTab');

      taskFilters.componentInstance.tabChanged.emit('active');

      expect(spy).toHaveBeenCalledWith('active');
    });

    it('should handle sortChanged event from task-filters', () => {
      const taskFilters: DebugElement = fixture.debugElement.query(By.css('app-task-filters'));
      const spy = vi.spyOn(component as any, 'setSortBy');

      taskFilters.componentInstance.sortChanged.emit('title');

      expect(spy).toHaveBeenCalledWith('title');
    });

    it('should handle taskToggled event from task-list', () => {
      const taskList: DebugElement = fixture.debugElement.query(By.css('app-task-list'));
      const spy = vi.spyOn(component as any, 'toggleCompleted');

      taskList.componentInstance.taskToggled.emit(1);

      expect(spy).toHaveBeenCalledWith(1);
    });

    it('should handle taskDeleted event from task-list', () => {
      const taskList: DebugElement = fixture.debugElement.query(By.css('app-task-list'));
      const spy = vi.spyOn(component as any, 'deleteTask');

      taskList.componentInstance.taskDeleted.emit(2);

      expect(spy).toHaveBeenCalledWith(2);
    });

    it('should handle taskEditStarted event from task-list', () => {
      const taskList: DebugElement = fixture.debugElement.query(By.css('app-task-list'));
      const spy = vi.spyOn(component as any, 'startEditingTask');

      taskList.componentInstance.taskEditStarted.emit(mockTasks[0]);

      expect(spy).toHaveBeenCalledWith(mockTasks[0]);
    });

    it('should handle taskSaved event from task-list', () => {
      const taskList: DebugElement = fixture.debugElement.query(By.css('app-task-list'));
      const spy = vi.spyOn(component as any, 'saveEditedTask');

      const event = { id: 1, title: 'Updated' };
      taskList.componentInstance.taskSaved.emit(event);

      expect(spy).toHaveBeenCalledWith(event);
    });

    it('should handle editCancelled event from task-list', () => {
      const taskList: DebugElement = fixture.debugElement.query(By.css('app-task-list'));
      const spy = vi.spyOn(component as any, 'cancelEditing');

      taskList.componentInstance.editCancelled.emit();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('TaskFilterStrategies', () => {
    it('should have strategy for "all" filter', () => {
      expect(component['taskFilterStrategies']['all']).toBeTruthy();
      expect(component['taskFilterStrategies']['all']()).toEqual(mockTasks);
    });

    it('should have strategy for "active" filter', () => {
      expect(component['taskFilterStrategies']['active']).toBeTruthy();
      const activeTasks = component['taskFilterStrategies']['active']();
      expect(activeTasks.every((t) => !t.completed)).toBe(true);
    });

    it('should have strategy for "completed" filter', () => {
      expect(component['taskFilterStrategies']['completed']).toBeTruthy();
      const completedTasks = component['taskFilterStrategies']['completed']();
      expect(completedTasks.every((t) => t.completed)).toBe(true);
    });
  });
});
