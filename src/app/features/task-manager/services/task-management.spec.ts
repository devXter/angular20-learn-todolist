import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { TaskManagement } from './task-management';
import { Task } from '../models/task';
import { LocalStorage } from '../../../core/services/local-storage';

describe('TaskManagement', () => {
  let service: TaskManagement;
  let localStorageSpy: {
    getItem: ReturnType<typeof vi.fn>;
    setItem: ReturnType<typeof vi.fn>;
    removeItem: ReturnType<typeof vi.fn>;
  };
  let storedTasks: Task[] | null;

  beforeEach(() => {
    // Mock de LocalStorage
    storedTasks = null;

    localStorageSpy = {
      getItem: vi.fn(() => storedTasks),
      setItem: vi.fn((key: string, value: Task[]) => {
        storedTasks = value;
      }),
      removeItem: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        TaskManagement,
        { provide: LocalStorage, useValue: localStorageSpy },
      ],
    });

    service = TestBed.inject(TaskManagement);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('AddTask', () => {
    it('should add a new task to the list', () => {
      // Arrange (preparar)
      const initialCount: number = service.allTasks().length;
      const newTaskTitle: string = 'Nueva tarea de prueba';

      // Act (actuar)
      service.addTask(newTaskTitle);

      // Assert (verificar)
      const tasks: Task[] = service.allTasks();
      expect(tasks.length).toBe(initialCount + 1);
      expect(tasks[tasks.length - 1].title).toBe(newTaskTitle);
      expect(tasks[tasks.length - 1].completed).toBe(false);
      expect(tasks[tasks.length - 1].createdAt).toBeDefined();
      expect(tasks[tasks.length - 1].createdAt).toBeInstanceOf(Date);
      expect(tasks[tasks.length - 1].dueDate).toBeUndefined();
    });

    it('should add a new task with due date', () => {
      // Arrange
      const initialCount: number = service.allTasks().length;
      const newTaskTitle: string = 'Nueva tarea con fecha';
      const dueDate: Date = new Date('2025-12-31');

      // Act
      service.addTask(newTaskTitle, dueDate);

      // Assert
      const tasks: Task[] = service.allTasks();
      const newTask: Task = tasks[tasks.length - 1];
      expect(tasks.length).toBe(initialCount + 1);
      expect(newTask.title).toBe(newTaskTitle);
      expect(newTask.dueDate).toEqual(dueDate);
      expect(newTask.createdAt).toBeDefined();
    });

    it('should not add new task with empty title', () => {
      // Arrange (preparar)
      const initialCount: number = service.allTasks().length;
      const beforeTasks: Task[] = service.allTasks();

      // Act (actuar)
      service.addTask('');

      // Assert (verificar)
      const tasksAfter: Task[] = service.allTasks();
      expect(tasksAfter.length).toBe(initialCount);
      expect(tasksAfter).toEqual(beforeTasks);
    });

    it('should not add new task with only spaces', () => {
      // Arrange (prepar)
      const initialCount: number = service.allTasks().length;

      // Act
      service.addTask('   ');

      // Assert
      expect(service.allTasks().length).toBe(initialCount);
    });
  });

  describe('toggleCompleted', () => {
    it('should toggle the completed status of a task', () => {
      // Arrange
      const taskToToggle: Task = service.allTasks()[0];
      const id: number = taskToToggle.id;
      const initialStatus: boolean = taskToToggle.completed;

      // Act
      service.toggleCompleted(id);

      // Assert
      const updatedTask: Task | undefined = service
        .allTasks()
        .find((t: Task): boolean => t.id === id);

      expect(updatedTask?.completed).not.toBe(initialStatus);
    });

    it('should not toggle if id task doesnt exist', () => {
      // Arrange
      const id: number = -1;
      const beforeTasks: Task[] = service.allTasks();

      // Act
      service.toggleCompleted(id);

      // Assert
      const afterTasks: Task[] = service.allTasks();
      expect(afterTasks).toEqual(beforeTasks);
    });

    it('should return to original state when toggled twice', () => {
      // Arrange
      const taskToToggle: Task = service.allTasks()[0];
      const id: number = taskToToggle.id;
      const initialStatus: boolean = taskToToggle.completed;

      // Act
      service.toggleCompleted(id);
      service.toggleCompleted(id);

      // Assert
      const updatedTask: Task | undefined = service
        .allTasks()
        .find((t: Task): boolean => t.id === id);

      expect(updatedTask?.completed).toBe(initialStatus);
    });

    it('should update remining count when toggling incomplete task', () => {
      // Arrange
      const incompleteTask: Task | undefined = service
        .allTasks()
        .find((t: Task): boolean => !t.completed);

      expect(incompleteTask).toBeDefined(); // Assertion que falla si es undefined

      const id: number = incompleteTask!.id;
      const initialCount: number = service.remaining();

      // Act
      service.toggleCompleted(id);

      // Assert
      const updatedCount: number = service.remaining();
      expect(updatedCount).toBe(initialCount - 1);
    });

    it('should update remining count when toggling complete task', () => {
      // Arrange
      const completeTask: Task | undefined = service
        .allTasks()
        .find((t: Task): boolean => t.completed);

      expect(completeTask).toBeDefined();

      const id: number = completeTask!.id;
      const initialCount: number = service.remaining();

      // Act
      service.toggleCompleted(id);

      // Assert
      const updatedCount: number = service.remaining();
      expect(updatedCount).toBe(initialCount + 1);
    });
  });

  describe('DeleteTask', () => {
    it('should delete a task from the list', () => {
      // Arrange
      const taskToDelete: Task = service.allTasks()[0];
      const id: number = taskToDelete.id;
      const initialCount: number = service.allTasks().length;

      // Act
      service.deleteTask(id);

      // Asssert
      const updatedCount: Task[] = service.allTasks();
      expect(updatedCount.length).toBe(initialCount - 1);
      expect(updatedCount.find((t: Task): boolean => t.id === id)).toBeUndefined();
    });

    it('should not delete if id task doesnt exist', () => {
      // Arrange
      const id: number = -1;
      const beforeTasks: Task[] = service.allTasks();

      // Act
      service.deleteTask(id);

      // Assert
      const afterTasks: Task[] = service.allTasks();
      expect(afterTasks).toEqual(beforeTasks);
    });

    it('should update remining count when deleting a task incomplete', () => {
      // Arrange
      const taskIncomplete: Task | undefined = service
        .allTasks()
        .find((t: Task): boolean => !t.completed);

      expect(taskIncomplete).toBeDefined(); // falla si no hay tareas incompletas

      const id: number = taskIncomplete!.id;
      const initialCount: number = service.remaining();

      // Act
      service.deleteTask(id);

      // Assert
      const updatedCount: number = service.remaining();
      expect(updatedCount).toBe(initialCount - 1);
    });
  });

  describe('UpdateTask', () => {
    it('should update the title of a task', () => {
      // Arrange
      const taskToUpdate: Task = service.allTasks()[0];
      const id: number = taskToUpdate.id;

      const newTitle: string = 'Nueva tarea de prueba';

      // Act
      service.updateTask(id, newTitle);

      // Assert
      const updatedTask: Task = service.allTasks().find((t: Task) => t.id === id)!;
      expect(updatedTask.title).toEqual(newTitle);
    });

    it('should not update a task with empty title', () => {
      // Arrange
      const taskToUpdate: Task = service.allTasks()[0];
      const id: number = taskToUpdate.id;
      const initalTitle: string = taskToUpdate.title;

      const newTitle: string = '';

      // Act
      service.updateTask(id, newTitle);

      // Assert
      const updatedTask: Task = service.allTasks().find((t: Task): boolean => t.id === id)!;

      expect(updatedTask.title).toEqual(initalTitle);
    });

    it('should not update a task with only spaces', () => {
      // Arrange
      const taskToUpdate: Task = service.allTasks()[0];
      const id: number = taskToUpdate.id;
      const beforeTasks: Task[] = service.allTasks();

      const newTitle: string = '   ';

      // Act
      service.updateTask(id, newTitle);

      // Assert
      const afterTasks: Task[] = service.allTasks();
      expect(afterTasks).toEqual(beforeTasks);
    });

    it('should not update if id task doesnt exist', () => {
      // Arrange
      const id: number = -1;
      const beforeTasks: Task[] = service.allTasks();

      const newTitle: string = 'Nueva tarea de prueba';

      // Act
      service.updateTask(id, newTitle);

      // Assert
      const afterTasks: Task[] = service.allTasks();
      expect(afterTasks).toEqual(beforeTasks);
    });
  });

  describe('LocalStorage Persistence', () => {
    it('should load tasks from localStorage on initialization', () => {
      // Assert
      expect(localStorageSpy.getItem).toHaveBeenCalledWith('tasks');
    });

    it('should persist tasks after adding a new task', () => {
      // Arrange
      const initialCallCount = localStorageSpy.setItem.mock.calls.length;
      const newTaskTitle = 'Nueva tarea para persistir';

      // Act
      service.addTask(newTaskTitle);
      TestBed.flushEffects();

      // Assert
      expect(localStorageSpy.setItem).toHaveBeenCalledWith('tasks', service.allTasks());
      expect(localStorageSpy.setItem.mock.calls.length).toBe(initialCallCount + 1);
    });

    it('should persist tasks after toggling completion status', () => {
      // Arrange
      const taskToToggle: Task = service.allTasks()[0];
      const initialCallCount = localStorageSpy.setItem.mock.calls.length;

      // Act
      service.toggleCompleted(taskToToggle.id);
      TestBed.flushEffects();

      // Assert
      expect(localStorageSpy.setItem).toHaveBeenCalledWith('tasks', service.allTasks());
      expect(localStorageSpy.setItem.mock.calls.length).toBe(initialCallCount + 1);
    });

    it('should persist tasks after deleting a task', () => {
      // Arrange
      const taskToDelete: Task = service.allTasks()[0];
      const initialCallCount = localStorageSpy.setItem.mock.calls.length;

      // Act
      service.deleteTask(taskToDelete.id);
      TestBed.flushEffects();

      // Assert
      expect(localStorageSpy.setItem).toHaveBeenCalledWith('tasks', service.allTasks());
      expect(localStorageSpy.setItem.mock.calls.length).toBe(initialCallCount + 1);
    });

    it('should persist tasks after updating a task', () => {
      // Arrange
      const taskToUpdate: Task = service.allTasks()[0];
      const initialCallCount = localStorageSpy.setItem.mock.calls.length;
      const newTitle = 'Título actualizado';

      // Act
      service.updateTask(taskToUpdate.id, newTitle);
      TestBed.flushEffects();

      // Assert
      expect(localStorageSpy.setItem).toHaveBeenCalledWith('tasks', service.allTasks());
      expect(localStorageSpy.setItem.mock.calls.length).toBe(initialCallCount + 1);
    });

    it('should not persist when add task fails due to empty title', () => {
      // Arrange
      const initialCallCount = localStorageSpy.setItem.mock.calls.length;

      // Act
      service.addTask('');

      // Assert
      expect(localStorageSpy.setItem.mock.calls.length).toBe(initialCallCount);
    });

    it('should not persist when update task fails due to empty title', () => {
      // Arrange
      const taskToUpdate: Task = service.allTasks()[0];
      const initialCallCount = localStorageSpy.setItem.mock.calls.length;

      // Act
      service.updateTask(taskToUpdate.id, '');

      // Assert
      expect(localStorageSpy.setItem.mock.calls.length).toBe(initialCallCount);
    });
  });

  describe('Computed Signals', () => {
    describe('activeTasks', () => {
      it('should return only incomplete tasks', () => {
        // Act
        const activeTasks: Task[] = service.activeTasks();

        // Assert
        expect(activeTasks.every((task: Task): boolean => !task.completed)).toBe(true);
      });

      it('should update when a task is toggled to completed', () => {
        // Arrange
        const initialActiveCount: number = service.activeTasks().length;
        const incompleteTask: Task | undefined = service
          .allTasks()
          .find((t: Task): boolean => !t.completed);
        expect(incompleteTask).toBeDefined();

        // Act
        service.toggleCompleted(incompleteTask!.id);

        // Assert
        expect(service.activeTasks().length).toBe(initialActiveCount - 1);
      });
    });

    describe('completedTasks', () => {
      it('should return only completed tasks', () => {
        // Act
        const completedTasks: Task[] = service.completedTasks();

        // Assert
        expect(completedTasks.every((task: Task): boolean => task.completed)).toBe(true);
      });

      it('should update when a task is toggled to incomplete', () => {
        // Arrange
        const initialCompletedCount: number = service.completedTasks().length;
        const completeTask: Task | undefined = service
          .allTasks()
          .find((t: Task): boolean => t.completed);
        expect(completeTask).toBeDefined();

        // Act
        service.toggleCompleted(completeTask!.id);

        // Assert
        expect(service.completedTasks().length).toBe(initialCompletedCount - 1);
      });
    });

    describe('overdueTasks', () => {
      it('should return only overdue incomplete tasks', () => {
        // Arrange
        const pastDate: Date = new Date('2020-01-01');
        service.addTask('Tarea vencida', pastDate);

        // Act
        const overdueTasks: Task[] = service.overdueTasks();

        // Assert
        expect(overdueTasks.length).toBeGreaterThan(0);
        expect(
          overdueTasks.every((task: Task): boolean => {
            if (!task.dueDate) return false;
            const today: Date = new Date();
            today.setHours(0, 0, 0, 0);
            const dueDate: Date = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate < today && !task.completed;
          }),
        ).toBe(true);
      });

      it('should not include tasks without due date', () => {
        // Arrange
        service.addTask('Tarea sin fecha');

        // Act
        const overdueTasks: Task[] = service.overdueTasks();

        // Assert
        const taskWithoutDate: Task | undefined = overdueTasks.find(
          (task: Task): boolean => !task.dueDate,
        );
        expect(taskWithoutDate).toBeUndefined();
      });

      it('should not include completed tasks even if overdue', () => {
        // Arrange
        const pastDate: Date = new Date('2020-01-01');
        service.addTask('Tarea vencida pero completada', pastDate);
        const addedTask: Task = service.allTasks()[service.allTasks().length - 1];
        service.toggleCompleted(addedTask.id);

        // Act
        const overdueTasks: Task[] = service.overdueTasks();

        // Assert
        const completedOverdueTask: Task | undefined = overdueTasks.find(
          (task: Task): boolean => task.id === addedTask.id,
        );
        expect(completedOverdueTask).toBeUndefined();
      });
    });
  });

  describe('getSortedTasks', () => {
    beforeEach(() => {
      // Limpiar todas las tareas existentes y agregar tareas de prueba con fechas específicas
      const allTasks: Task[] = service.allTasks();
      allTasks.forEach((task: Task): void => {
        service.deleteTask(task.id);
      });

      // Agregar tareas de prueba
      service.addTask('Zebra Task', new Date('2025-12-31'));
      service.addTask('Apple Task', new Date('2025-11-15'));
      service.addTask('Middle Task', new Date('2025-12-01'));
      service.addTask('Sin fecha');
    });

    it('should sort tasks by due date (earliest first)', () => {
      // Arrange
      const tasks: Task[] = service.allTasks();

      // Act
      const sortedTasks: Task[] = service.getSortedTasks(tasks, 'dueDate');

      // Assert
      expect(sortedTasks[0].title).toBe('Apple Task');
      expect(sortedTasks[1].title).toBe('Middle Task');
      expect(sortedTasks[2].title).toBe('Zebra Task');
      expect(sortedTasks[3].title).toBe('Sin fecha'); // Sin fecha va al final
    });

    it('should sort tasks by created date (most recent first)', () => {
      // Arrange
      const tasks: Task[] = service.allTasks();

      // Act
      const sortedTasks: Task[] = service.getSortedTasks(tasks, 'createdAt');

      // Assert
      // Verificar que las tareas están ordenadas por fecha de creación (más recientes primero)
      for (let i = 0; i < sortedTasks.length - 1; i++) {
        const currentDate: Date = new Date(sortedTasks[i].createdAt);
        const nextDate: Date = new Date(sortedTasks[i + 1].createdAt);
        expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
      }
    });

    it('should sort tasks alphabetically by title', () => {
      // Arrange
      const tasks: Task[] = service.allTasks();

      // Act
      const sortedTasks: Task[] = service.getSortedTasks(tasks, 'title');

      // Assert
      expect(sortedTasks[0].title).toBe('Apple Task');
      expect(sortedTasks[1].title).toBe('Middle Task');
      expect(sortedTasks[2].title).toBe('Sin fecha');
      expect(sortedTasks[3].title).toBe('Zebra Task');
    });

    it('should not mutate the original array', () => {
      // Arrange
      const tasks: Task[] = service.allTasks();
      const originalOrder: string[] = tasks.map((t: Task): string => t.title);

      // Act
      service.getSortedTasks(tasks, 'title');

      // Assert
      const currentOrder: string[] = tasks.map((t: Task): string => t.title);
      expect(currentOrder).toEqual(originalOrder);
    });
  });

  describe('Data Migration', () => {
    it('should migrate tasks without createdAt property', () => {
      // Arrange
      const tasksWithoutDates = [{ id: 1, title: 'Old task', completed: false } as any];
      storedTasks = tasksWithoutDates;

      // Act
      const newService = TestBed.inject(TaskManagement);

      // Assert
      const tasks: Task[] = newService.allTasks();
      expect(tasks[0].createdAt).toBeDefined();
      expect(tasks[0].createdAt).toBeInstanceOf(Date);
    });

    it('should convert string dates to Date objects', () => {
      // Arrange
      const tasksWithStringDates = [
        {
          id: 1,
          title: 'Task with string dates',
          completed: false,
          createdAt: '2025-10-01T00:00:00.000Z',
          dueDate: '2025-12-31T00:00:00.000Z',
        } as any,
      ];
      storedTasks = tasksWithStringDates;

      // Act
      const newService = TestBed.inject(TaskManagement);

      // Assert
      const tasks: Task[] = newService.allTasks();
      expect(tasks[0].createdAt).toBeInstanceOf(Date);
      expect(tasks[0].dueDate).toBeInstanceOf(Date);
    });
  });
});
