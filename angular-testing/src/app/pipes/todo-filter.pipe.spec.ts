/**
 * Тесты для TodoFilterPipe
 *
 * Этот файл демонстрирует тестирование Angular Pipes:
 * - Базовое тестирование трансформации данных
 * - Тестирование различных входных параметров
 * - Обработка граничных случаев
 * - Проверка чистоты pipe (pure pipe)
 */

import { TodoFilterPipe } from './todo-filter.pipe';
import { Todo } from '../models/todo.model';

describe('TodoFilterPipe', () => {
  let pipe: TodoFilterPipe;

  // Тестовые данные
  const mockTodos: Todo[] = [
    { id: 1, title: 'Задача 1', completed: false, createdAt: new Date() },
    { id: 2, title: 'Задача 2', completed: true, createdAt: new Date() },
    { id: 3, title: 'Задача 3', completed: false, createdAt: new Date() },
    { id: 4, title: 'Задача 4', completed: true, createdAt: new Date() },
    { id: 5, title: 'Задача 5', completed: false, createdAt: new Date() }
  ];

  // Создаем экземпляр pipe перед каждым тестом
  beforeEach(() => {
    pipe = new TodoFilterPipe();
  });

  // Базовый тест создания
  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  /**
   * Группа тестов: фильтр "all"
   */
  describe('filter: all', () => {
    // Должен вернуть все задачи
    it('должен вернуть все задачи', () => {
      const result = pipe.transform(mockTodos, 'all');
      expect(result.length).toBe(5);
      expect(result).toEqual(mockTodos);
    });

    // Должен вернуть оригинальный массив
    it('должен вернуть тот же массив (по ссылке)', () => {
      const result = pipe.transform(mockTodos, 'all');
      expect(result).toBe(mockTodos);
    });
  });

  /**
   * Группа тестов: фильтр "completed"
   */
  describe('filter: completed', () => {
    // Должен вернуть только выполненные задачи
    it('должен вернуть только выполненные задачи', () => {
      const result = pipe.transform(mockTodos, 'completed');

      expect(result.length).toBe(2);
      expect(result.every(todo => todo.completed)).toBe(true);
    });

    // Должен вернуть правильные id
    it('должен вернуть задачи с id 2 и 4', () => {
      const result = pipe.transform(mockTodos, 'completed');

      const ids = result.map(todo => todo.id);
      expect(ids).toEqual([2, 4]);
    });

    // Не должен изменять оригинальный массив
    it('не должен изменять оригинальный массив', () => {
      const originalLength = mockTodos.length;
      pipe.transform(mockTodos, 'completed');

      expect(mockTodos.length).toBe(originalLength);
    });
  });

  /**
   * Группа тестов: фильтр "pending"
   */
  describe('filter: pending', () => {
    // Должен вернуть только невыполненные задачи
    it('должен вернуть только невыполненные задачи', () => {
      const result = pipe.transform(mockTodos, 'pending');

      expect(result.length).toBe(3);
      expect(result.every(todo => !todo.completed)).toBe(true);
    });

    // Должен вернуть правильные id
    it('должен вернуть задачи с id 1, 3 и 5', () => {
      const result = pipe.transform(mockTodos, 'pending');

      const ids = result.map(todo => todo.id);
      expect(ids).toEqual([1, 3, 5]);
    });
  });

  /**
   * Группа тестов: граничные случаи
   */
  describe('Edge Cases', () => {
    // Пустой массив
    it('должен вернуть пустой массив для пустого входного массива', () => {
      const result = pipe.transform([], 'all');
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    // null вместо массива
    it('должен вернуть пустой массив для null', () => {
      const result = pipe.transform(null as any, 'all');
      expect(result).toEqual([]);
    });

    // undefined вместо массива
    it('должен вернуть пустой массив для undefined', () => {
      const result = pipe.transform(undefined as any, 'all');
      expect(result).toEqual([]);
    });

    // Неправильный тип данных
    it('должен вернуть пустой массив для не-массива', () => {
      const result = pipe.transform('not an array' as any, 'all');
      expect(result).toEqual([]);
    });

    // Все задачи выполнены
    it('должен вернуть пустой массив при фильтре pending если все выполнены', () => {
      const allCompleted: Todo[] = [
        { id: 1, title: 'Done 1', completed: true, createdAt: new Date() },
        { id: 2, title: 'Done 2', completed: true, createdAt: new Date() }
      ];

      const result = pipe.transform(allCompleted, 'pending');
      expect(result.length).toBe(0);
    });

    // Все задачи невыполнены
    it('должен вернуть пустой массив при фильтре completed если все невыполнены', () => {
      const allPending: Todo[] = [
        { id: 1, title: 'Todo 1', completed: false, createdAt: new Date() },
        { id: 2, title: 'Todo 2', completed: false, createdAt: new Date() }
      ];

      const result = pipe.transform(allPending, 'completed');
      expect(result.length).toBe(0);
    });
  });

  /**
   * Группа тестов: консистентность и производительность
   */
  describe('Consistency', () => {
    // Должен возвращать одинаковый результат при повторных вызовах
    it('должен возвращать одинаковый результат при повторных вызовах', () => {
      const result1 = pipe.transform(mockTodos, 'completed');
      const result2 = pipe.transform(mockTodos, 'completed');

      expect(result1).toEqual(result2);
    });

    // Pure pipe - не должен кэшировать между разными массивами
    it('должен работать с разными массивами независимо', () => {
      const todos1: Todo[] = [
        { id: 1, title: 'Test', completed: true, createdAt: new Date() }
      ];
      const todos2: Todo[] = [
        { id: 2, title: 'Test2', completed: false, createdAt: new Date() }
      ];

      const result1 = pipe.transform(todos1, 'completed');
      const result2 = pipe.transform(todos2, 'completed');

      expect(result1.length).toBe(1);
      expect(result2.length).toBe(0);
    });
  });

  /**
   * Группа тестов: реальные сценарии использования
   */
  describe('Real World Scenarios', () => {
    // Один элемент
    it('должен корректно фильтровать массив с одним элементом', () => {
      const singleTodo: Todo[] = [
        { id: 1, title: 'Single', completed: true, createdAt: new Date() }
      ];

      const completedResult = pipe.transform(singleTodo, 'completed');
      const pendingResult = pipe.transform(singleTodo, 'pending');

      expect(completedResult.length).toBe(1);
      expect(pendingResult.length).toBe(0);
    });

    // Большой массив
    it('должен корректно обрабатывать большой массив', () => {
      const largeTodos: Todo[] = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        title: `Task ${i}`,
        completed: i % 2 === 0,
        createdAt: new Date()
      }));

      const completed = pipe.transform(largeTodos, 'completed');
      const pending = pipe.transform(largeTodos, 'pending');

      expect(completed.length).toBe(500);
      expect(pending.length).toBe(500);
    });

    // Чередующиеся статусы
    it('должен правильно обрабатывать чередующиеся статусы', () => {
      const alternating: Todo[] = [
        { id: 1, title: 'T1', completed: true, createdAt: new Date() },
        { id: 2, title: 'T2', completed: false, createdAt: new Date() },
        { id: 3, title: 'T3', completed: true, createdAt: new Date() },
        { id: 4, title: 'T4', completed: false, createdAt: new Date() }
      ];

      const completed = pipe.transform(alternating, 'completed');
      const pending = pipe.transform(alternating, 'pending');

      expect(completed.map(t => t.id)).toEqual([1, 3]);
      expect(pending.map(t => t.id)).toEqual([2, 4]);
    });
  });
});

