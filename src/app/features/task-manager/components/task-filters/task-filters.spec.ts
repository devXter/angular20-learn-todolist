import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { vi } from 'vitest';
import { TaskFilters } from './task-filters';
import { TaskFilter, TaskSortBy } from '../../models/task-filter';
import { ComponentRef } from '@angular/core';

describe('TaskFilters', () => {
  let component: TaskFilters;
  let fixture: ComponentFixture<TaskFilters>;
  let componentRef: ComponentRef<TaskFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFilters],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFilters);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    // Set required inputs
    componentRef.setInput('activeTab', 'all');
    componentRef.setInput('sortBy', 'dueDate');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Inputs', () => {
    it('should accept activeTab input', () => {
      componentRef.setInput('activeTab', 'active');
      fixture.detectChanges();

      expect(component.activeTab()).toBe('active');
    });

    it('should accept sortBy input', () => {
      componentRef.setInput('sortBy', 'title');
      fixture.detectChanges();

      expect(component.sortBy()).toBe('title');
    });

    it('should accept all valid TaskFilter values', () => {
      const filters: TaskFilter[] = ['all', 'active', 'completed'];

      filters.forEach((filter) => {
        componentRef.setInput('activeTab', filter);
        fixture.detectChanges();

        expect(component.activeTab()).toBe(filter);
      });
    });

    it('should accept all valid TaskSortBy values', () => {
      const sortOptions: TaskSortBy[] = ['dueDate', 'createdAt', 'title'];

      sortOptions.forEach((sortOption) => {
        componentRef.setInput('sortBy', sortOption);
        fixture.detectChanges();

        expect(component.sortBy()).toBe(sortOption);
      });
    });
  });

  describe('Outputs', () => {
    describe('tabChanged', () => {
      it('should emit tabChanged when onTabClick is called', () => {
        const emitSpy = vi.spyOn(component.tabChanged, 'emit');

        component['onTabClick']('active');

        expect(emitSpy).toHaveBeenCalledWith('active');
      });

      it('should emit correct filter for each tab', () => {
        const emitSpy = vi.spyOn(component.tabChanged, 'emit');
        const filters: TaskFilter[] = ['all', 'active', 'completed'];

        filters.forEach((filter) => {
          component['onTabClick'](filter);
          expect(emitSpy).toHaveBeenCalledWith(filter);
        });

        expect(emitSpy).toHaveBeenCalledTimes(3);
      });
    });

    describe('sortChanged', () => {
      it('should emit sortChanged when onSortChange is called', () => {
        const emitSpy = vi.spyOn(component.sortChanged, 'emit');
        const select = fixture.nativeElement.querySelector('select');

        select.value = 'title';
        select.dispatchEvent(new Event('change'));

        expect(emitSpy).toHaveBeenCalledWith('title');
      });

      it('should emit correct sort option for each value', () => {
        const emitSpy = vi.spyOn(component.sortChanged, 'emit');
        const sortOptions: TaskSortBy[] = ['dueDate', 'createdAt', 'title'];
        const select = fixture.nativeElement.querySelector('select');

        sortOptions.forEach((sortOption) => {
          select.value = sortOption;
          select.dispatchEvent(new Event('change'));
          expect(emitSpy).toHaveBeenCalledWith(sortOption);
        });

        expect(emitSpy).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('Template Bindings', () => {
    describe('Tab Buttons', () => {
      it('should render three tab buttons', () => {
        const buttons = fixture.nativeElement.querySelectorAll('button[type="button"]');

        expect(buttons.length).toBe(3);
        expect(buttons[0].textContent.trim()).toBe('Todas');
        expect(buttons[1].textContent.trim()).toBe('Activas');
        expect(buttons[2].textContent.trim()).toBe('Completadas');
      });

      it('should apply active styles to the "all" tab when activeTab is "all"', () => {
        componentRef.setInput('activeTab', 'all');
        fixture.detectChanges();

        const allButton = fixture.nativeElement.querySelector('button:nth-of-type(1)');

        expect(allButton.classList.contains('bg-white')).toBe(true);
        expect(allButton.classList.contains('text-indigo-600')).toBe(true);
        expect(allButton.classList.contains('shadow-md')).toBe(true);
      });

      it('should apply active styles to the "active" tab when activeTab is "active"', () => {
        componentRef.setInput('activeTab', 'active');
        fixture.detectChanges();

        const activeButton = fixture.nativeElement.querySelector('button:nth-of-type(2)');

        expect(activeButton.classList.contains('bg-white')).toBe(true);
        expect(activeButton.classList.contains('text-indigo-600')).toBe(true);
        expect(activeButton.classList.contains('shadow-md')).toBe(true);
      });

      it('should apply active styles to the "completed" tab when activeTab is "completed"', () => {
        componentRef.setInput('activeTab', 'completed');
        fixture.detectChanges();

        const completedButton = fixture.nativeElement.querySelector('button:nth-of-type(3)');

        expect(completedButton.classList.contains('bg-white')).toBe(true);
        expect(completedButton.classList.contains('text-indigo-600')).toBe(true);
        expect(completedButton.classList.contains('shadow-md')).toBe(true);
      });

      it('should emit tabChanged when "all" button is clicked', () => {
        const emitSpy = vi.spyOn(component.tabChanged, 'emit');
        const allButton = fixture.nativeElement.querySelector('button:nth-of-type(1)');

        allButton.click();

        expect(emitSpy).toHaveBeenCalledWith('all');
      });

      it('should emit tabChanged when "active" button is clicked', () => {
        const emitSpy = vi.spyOn(component.tabChanged, 'emit');
        const activeButton = fixture.nativeElement.querySelector('button:nth-of-type(2)');

        activeButton.click();

        expect(emitSpy).toHaveBeenCalledWith('active');
      });

      it('should emit tabChanged when "completed" button is clicked', () => {
        const emitSpy = vi.spyOn(component.tabChanged, 'emit');
        const completedButton = fixture.nativeElement.querySelector('button:nth-of-type(3)');

        completedButton.click();

        expect(emitSpy).toHaveBeenCalledWith('completed');
      });

      it('should not apply active styles to inactive tabs', () => {
        componentRef.setInput('activeTab', 'all');
        fixture.detectChanges();

        const activeButton = fixture.nativeElement.querySelector('button:nth-of-type(2)');
        const completedButton = fixture.nativeElement.querySelector('button:nth-of-type(3)');

        expect(activeButton.classList.contains('bg-white')).toBe(false);
        expect(completedButton.classList.contains('bg-white')).toBe(false);
      });
    });

    describe('Sort Selector', () => {
      it('should render select element with three options', () => {
        const select = fixture.nativeElement.querySelector('select');
        const options = select.querySelectorAll('option');

        expect(select).toBeTruthy();
        expect(options.length).toBe(3);
      });

      it('should display correct option labels', () => {
        const options = fixture.nativeElement.querySelectorAll('option');

        expect(options[0].textContent).toBe('Fecha de vencimiento');
        expect(options[1].textContent).toBe('Fecha de creación');
        expect(options[2].textContent).toBe('Alfabético');
      });

      it('should have correct option values', () => {
        const options = fixture.nativeElement.querySelectorAll('option');

        expect(options[0].value).toBe('dueDate');
        expect(options[1].value).toBe('createdAt');
        expect(options[2].value).toBe('title');
      });

      it('should set select value to sortBy input', () => {
        componentRef.setInput('sortBy', 'title');
        fixture.detectChanges();

        const select = fixture.nativeElement.querySelector('select');

        expect(select.value).toBe('title');
      });

      it('should emit sortChanged when select value changes', () => {
        const emitSpy = vi.spyOn(component.sortChanged, 'emit');
        const select = fixture.nativeElement.querySelector('select');

        select.value = 'createdAt';
        select.dispatchEvent(new Event('change'));

        expect(emitSpy).toHaveBeenCalledWith('createdAt');
      });

      it('should update for each sort option change', () => {
        const emitSpy = vi.spyOn(component.sortChanged, 'emit');
        const select = fixture.nativeElement.querySelector('select');
        const sortOptions: TaskSortBy[] = ['dueDate', 'createdAt', 'title'];

        sortOptions.forEach((sortOption) => {
          select.value = sortOption;
          select.dispatchEvent(new Event('change'));
          expect(emitSpy).toHaveBeenCalledWith(sortOption);
        });

        expect(emitSpy).toHaveBeenCalledTimes(3);
      });
    });

    describe('SVG Icon', () => {
      it('should render sort icon', () => {
        const svg = fixture.nativeElement.querySelector('svg');
        const use = svg.querySelector('use');

        expect(svg).toBeTruthy();
        expect(use).toBeTruthy();
        expect(use.getAttribute('href')).toBe('/icons.svg#icon-sort');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have aria-hidden on decorative SVG icon', () => {
      const svg = fixture.nativeElement.querySelector('svg');

      expect(svg.getAttribute('aria-hidden')).toBe('true');
    });

    it('should have type="button" on all tab buttons', () => {
      const buttons = fixture.nativeElement.querySelectorAll('button');

      buttons.forEach((button: HTMLButtonElement) => {
        expect(button.type).toBe('button');
      });
    });
  });

  describe('Styling', () => {
    it('should apply consistent button styling classes', () => {
      const buttons = fixture.nativeElement.querySelectorAll('button[type="button"]');

      buttons.forEach((button: HTMLButtonElement) => {
        expect(button.classList.contains('rounded-lg')).toBe(true);
        expect(button.classList.contains('px-6')).toBe(true);
        expect(button.classList.contains('py-2.5')).toBe(true);
        expect(button.classList.contains('text-sm')).toBe(true);
        expect(button.classList.contains('font-medium')).toBe(true);
      });
    });

    it('should apply section container styling', () => {
      const section = fixture.nativeElement.querySelector('section');

      expect(section.classList.contains('mb-6')).toBe(true);
      expect(section.classList.contains('rounded-2xl')).toBe(true);
      expect(section.classList.contains('bg-white')).toBe(true);
      expect(section.classList.contains('shadow-xl')).toBe(true);
    });
  });
});
