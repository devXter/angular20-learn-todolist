import { TestBed } from '@angular/core/testing';

import { TaskManager } from './task-manager';

describe('TaskManager', () => {
  let service: TaskManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
