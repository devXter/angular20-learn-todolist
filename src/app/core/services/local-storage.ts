import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorage {
  /**
   * Recupera un elemento del localStorage y lo deserializa
   * @param key La clave del elemento a recuperar
   * @returns El valor deserializado o null si no existe o hay error
   */
  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : null;
    } catch (error) {
      console.error(`Error al leer del localStorage con la clave "${key}":`, error);
      return null;
    }
  }

  /**
   * Guarda un elemento en el localStorage serializándolo a JSON
   * @param key La clave bajo la cual guardar el elemento
   * @param value El valor a guardar
   */
  setItem<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Error al guardar en localStorage con la clave "${key}":`, error);
    }
  }

  /**
   * Elimina un elemento del localStorage
   * @param key La clave del elemento a eliminar
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error al eliminar del localStorage con la clave "${key}":`, error);
    }
  }
}
