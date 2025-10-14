import { Injectable } from '@angular/core';
import { Task } from '../../features/task-manager/models/task';

@Injectable({
  providedIn: 'root',
})
export class DateFormatter {
  // Memoized formatters para mejor rendimiento
  private readonly longFormatter: Intl.DateTimeFormat = new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  private readonly shortFormatter: Intl.DateTimeFormat = new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
  });

  /**
   * Normaliza una fecha a medianoche (00:00:00.000)
   * Útil para comparaciones de fechas sin considerar la hora
   */
  normalizeToMidnight(date: Date): Date {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }

  /**
   * Formatea una fecha en formato largo (ej: "01 oct 2025")
   */
  formatLong(date: Date | undefined): string {
    if (!date) return '';
    return this.longFormatter.format(new Date(date));
  }

  /**
   * Formatea una fecha en formato corto (ej: "01 oct")
   */
  formatShort(date: Date | undefined): string {
    if (!date) return '';
    return this.shortFormatter.format(new Date(date));
  }

  /**
   * Verifica si una tarea está vencida
   */
  isOverdue(task: Task): boolean {
    if (task.completed || !task.dueDate) return false;

    const today: Date = this.normalizeToMidnight(new Date());
    const dueDate: Date = this.normalizeToMidnight(new Date(task.dueDate));

    return dueDate < today;
  }
}
