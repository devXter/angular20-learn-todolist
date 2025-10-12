import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { LocalStorage } from './local-storage';

describe('LocalStorage', () => {
  let service: LocalStorage;
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    // Mock del localStorage
    localStorageMock = {};

    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
      return localStorageMock[key] || null;
    });

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
      localStorageMock[key] = value;
    });

    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key: string) => {
      delete localStorageMock[key];
    });

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(LocalStorage);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getItem', () => {
    it('debe retornar null cuando el item no existe', () => {
      const result = service.getItem<string>('nonexistent');
      expect(result).toBeNull();
    });

    it('debe deserializar y retornar el valor correctamente', () => {
      const testData = { name: 'Test', value: 123 };
      localStorageMock['testKey'] = JSON.stringify(testData);

      const result = service.getItem<typeof testData>('testKey');
      expect(result).toEqual(testData);
    });

    it('debe retornar null cuando hay un error de parsing', () => {
      localStorageMock['invalidKey'] = 'invalid json';
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = service.getItem<any>('invalidKey');
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('setItem', () => {
    it('debe serializar y guardar el valor correctamente', () => {
      const testData = { name: 'Test', value: 123 };
      service.setItem('testKey', testData);

      expect(localStorageMock['testKey']).toBe(JSON.stringify(testData));
    });

    it('debe manejar errores al guardar', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage full');
      });

      service.setItem('testKey', { data: 'test' });
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('removeItem', () => {
    it('debe eliminar el item del localStorage', () => {
      localStorageMock['testKey'] = 'test value';
      service.removeItem('testKey');

      expect(localStorageMock['testKey']).toBeUndefined();
    });

    it('debe manejar errores al eliminar', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Error removing');
      });

      service.removeItem('testKey');
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
