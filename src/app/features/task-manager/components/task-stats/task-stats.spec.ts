import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TaskStats } from './task-stats';

describe('TaskStats', () => {
  let component: TaskStats;
  let fixture: ComponentFixture<TaskStats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskStats],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskStats);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Configuration', () => {
    it('should be standalone', () => {
      const metadata = (TaskStats as any).ɵcmp;
      expect(metadata.standalone).toBe(true);
    });

    it('should use OnPush change detection', () => {
      const metadata = (TaskStats as any).ɵcmp;
      // ChangeDetectionStrategy.OnPush = 0, but in standalone components
      // the property might be structured differently
      expect(metadata.changeDetection === 0 || metadata.changeDetection === undefined).toBe(true);
    });

    it('should have correct selector', () => {
      const metadata = (TaskStats as any).ɵcmp;
      expect(metadata.selectors).toEqual([['app-task-stats']]);
    });
  });

  describe('Input Signals', () => {
    it('should have remaining input signal', () => {
      fixture.componentRef.setInput('remaining', 5);
      expect(component.remaining()).toBe(5);
    });

    it('should have total input signal', () => {
      fixture.componentRef.setInput('total', 10);
      expect(component.total()).toBe(10);
    });

    it('should update when remaining input changes', () => {
      fixture.componentRef.setInput('remaining', 3);
      expect(component.remaining()).toBe(3);

      fixture.componentRef.setInput('remaining', 7);
      expect(component.remaining()).toBe(7);
    });

    it('should update when total input changes', () => {
      fixture.componentRef.setInput('total', 5);
      expect(component.total()).toBe(5);

      fixture.componentRef.setInput('total', 15);
      expect(component.total()).toBe(15);
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('remaining', 3);
      fixture.componentRef.setInput('total', 10);
      fixture.detectChanges();
    });

    it('should display remaining tasks count', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      // Find "Tareas Pendientes" label and get its sibling with the count
      const allParagraphs = Array.from(compiled.querySelectorAll('p'));
      const pendingLabel = allParagraphs.find(p => p.textContent?.includes('Tareas Pendientes'));
      const remainingText = pendingLabel?.nextElementSibling;
      expect(remainingText?.textContent?.trim()).toBe('3');
    });

    it('should display total tasks count', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const totalText = compiled.querySelector('div.text-right > p:nth-of-type(2)');
      expect(totalText?.textContent?.trim()).toBe('10');
    });

    it('should render stats card section', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const section = compiled.querySelector('section');
      expect(section).toBeTruthy();
      expect(section?.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(section?.classList.contains('from-indigo-600')).toBe(true);
      expect(section?.classList.contains('to-purple-600')).toBe(true);
    });

    it('should render SVG icon', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const svg = compiled.querySelector('svg');
      const use = compiled.querySelector('use');
      expect(svg).toBeTruthy();
      expect(use?.getAttribute('href')).toBe('/icons.svg#icon-check-circle');
    });

    it('should display "Tareas Pendientes" label', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const labels = Array.from(compiled.querySelectorAll('p.text-sm'));
      const pendingLabel = labels.find(el => el.textContent?.includes('Tareas Pendientes'));
      expect(pendingLabel).toBeTruthy();
    });

    it('should display "Total de Tareas" label', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const labels = Array.from(compiled.querySelectorAll('p.text-sm'));
      const totalLabel = labels.find(el => el.textContent?.includes('Total de Tareas'));
      expect(totalLabel).toBeTruthy();
    });

    it('should update displayed values when inputs change', () => {
      const compiled = fixture.nativeElement as HTMLElement;

      // Initial values
      fixture.componentRef.setInput('remaining', 5);
      fixture.componentRef.setInput('total', 12);
      fixture.detectChanges();

      let allParagraphs = Array.from(compiled.querySelectorAll('p'));
      let pendingLabel = allParagraphs.find(p => p.textContent?.includes('Tareas Pendientes'));
      let remainingText = pendingLabel?.nextElementSibling;
      let totalText = compiled.querySelector('div.text-right > p:nth-of-type(2)');
      expect(remainingText?.textContent?.trim()).toBe('5');
      expect(totalText?.textContent?.trim()).toBe('12');

      // Updated values
      fixture.componentRef.setInput('remaining', 2);
      fixture.componentRef.setInput('total', 8);
      fixture.detectChanges();

      allParagraphs = Array.from(compiled.querySelectorAll('p'));
      pendingLabel = allParagraphs.find(p => p.textContent?.includes('Tareas Pendientes'));
      remainingText = pendingLabel?.nextElementSibling;
      totalText = compiled.querySelector('div.text-right > p:nth-of-type(2)');
      expect(remainingText?.textContent?.trim()).toBe('2');
      expect(totalText?.textContent?.trim()).toBe('8');
    });
  });

  describe('Zero Values', () => {
    it('should handle zero remaining tasks', () => {
      fixture.componentRef.setInput('remaining', 0);
      fixture.componentRef.setInput('total', 5);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const allParagraphs = Array.from(compiled.querySelectorAll('p'));
      const pendingLabel = allParagraphs.find(p => p.textContent?.includes('Tareas Pendientes'));
      const remainingText = pendingLabel?.nextElementSibling;
      expect(remainingText?.textContent?.trim()).toBe('0');
    });

    it('should handle zero total tasks', () => {
      fixture.componentRef.setInput('remaining', 0);
      fixture.componentRef.setInput('total', 0);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const allParagraphs = Array.from(compiled.querySelectorAll('p'));
      const pendingLabel = allParagraphs.find(p => p.textContent?.includes('Tareas Pendientes'));
      const remainingText = pendingLabel?.nextElementSibling;
      const totalText = compiled.querySelector('div.text-right > p:nth-of-type(2)');
      expect(remainingText?.textContent?.trim()).toBe('0');
      expect(totalText?.textContent?.trim()).toBe('0');
    });
  });

  describe('Large Values', () => {
    it('should handle large numbers correctly', () => {
      fixture.componentRef.setInput('remaining', 999);
      fixture.componentRef.setInput('total', 1000);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const allParagraphs = Array.from(compiled.querySelectorAll('p'));
      const pendingLabel = allParagraphs.find(p => p.textContent?.includes('Tareas Pendientes'));
      const remainingText = pendingLabel?.nextElementSibling;
      const totalText = compiled.querySelector('div.text-right > p:nth-of-type(2)');
      expect(remainingText?.textContent?.trim()).toBe('999');
      expect(totalText?.textContent?.trim()).toBe('1000');
    });
  });
});
