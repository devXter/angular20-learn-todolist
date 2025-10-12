import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { TaskManagement } from './task-management';
import { Task } from '../models/task';

describe('TaskManagement', () => {
  let service: TaskManagement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
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
});
