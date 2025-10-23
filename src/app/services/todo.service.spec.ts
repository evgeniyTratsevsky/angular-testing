/**
 * Тесты для TodoService
 *
 * Этот файл содержит юнит-тесты для TodoService, которые проверяют:
 * - Создание и инициализацию сервиса
 * - CRUD операции (создание, чтение, обновление, удаление)
 * - Работу с Observable потоками
 * - Управление состоянием задач
 * - Вычисление статистики
 */

import { TestBed } from '@angular/core/testing';
import { TodoService } from './todo.service';
import { Todo } from '../models/todo.model';

describe('TodoService', () => {
  let service: TodoService;

  // Выполняется перед каждым тестом
  // Настраивает чистое тестовое окружение
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TodoService);
  });

  // Базовый тест: проверяет что сервис успешно создается
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  /**
   * Тесты метода getTodos
   * Проверяют получение списка задач через Observable
   */
  describe('getTodos', () => {
    // Проверяет что метод возвращает Observable с задачами
    it('should return an observable of todos', (done) => {
      service.getTodos().subscribe(todos => {
        expect(todos).toBeDefined();
        expect(todos.length).toBeGreaterThan(0);
        done(); // Сигнализирует что асинхронный тест завершен
      });
    });

    // Проверяет что при подписке эмитятся начальные задачи
    it('should emit initial todos on subscription', (done) => {
      service.getTodos().subscribe(todos => {
        expect(todos.length).toBe(3);
        expect(todos[0].title).toBe('Learn Angular');
        done();
      });
    });
  });

  /**
   * Тесты метода getTodoById
   * Проверяют поиск задачи по ID
   */
  describe('getTodoById', () => {
    // Проверяет успешный поиск существующей задачи
    it('should return a todo when it exists', () => {
      const todo = service.getTodoById(1);
      expect(todo).toBeDefined();
      expect(todo?.title).toBe('Learn Angular');
    });

    // Проверяет что возвращается undefined для несуществующей задачи
    it('should return undefined when todo does not exist', () => {
      const todo = service.getTodoById(999);
      expect(todo).toBeUndefined();
    });
  });

  /**
   * Тесты метода addTodo
   * Проверяют добавление новых задач
   */
  describe('addTodo', () => {
    // Проверяет успешное добавление новой задачи
    it('should add a new todo', (done) => {
      const title = 'New Todo';

      service.addTodo(title).subscribe(newTodo => {
        // Проверяем что задача создана с правильными свойствами
        expect(newTodo).toBeDefined();
        expect(newTodo.title).toBe(title);
        expect(newTodo.completed).toBe(false); // Новая задача не выполнена
        expect(newTodo.id).toBeDefined(); // ID автоматически назначен
        done();
      });
    });

    // Проверяет что после добавления эмитится обновленный список
    it('should emit updated todos list after adding', (done) => {
      let emissionCount = 0;

      // Подписываемся на поток задач
      service.getTodos().subscribe(todos => {
        emissionCount++;
        if (emissionCount === 2) { // Вторая эмиссия после добавления
          expect(todos.length).toBe(4);
          expect(todos[3].title).toBe('Test Todo');
          done();
        }
      });

      // Добавляем задачу - это вызовет вторую эмиссию
      service.addTodo('Test Todo').subscribe();
    });

    // Проверяет что каждая новая задача получает уникальный ID
    it('should assign unique ids to new todos', (done) => {
      const firstTodoId = 4;

      service.addTodo('First').subscribe(first => {
        expect(first.id).toBe(firstTodoId);

        // Вторая задача должна получить следующий ID
        service.addTodo('Second').subscribe(second => {
          expect(second.id).toBe(firstTodoId + 1);
          done();
        });
      });
    });
  });

  /**
   * Тесты метода toggleTodo
   * Проверяют переключение статуса выполнения задачи
   */
  describe('toggleTodo', () => {
    // Проверяет переключение невыполненной задачи в выполненную
    it('should toggle a todo from incomplete to complete', () => {
      // Arrange: получаем исходное состояние
      const todo = service.getTodoById(2);
      expect(todo?.completed).toBe(false);

      // Act: переключаем статус
      const result = service.toggleTodo(2);
      expect(result).toBe(true); // Операция успешна

      // Assert: проверяем новое состояние
      const updatedTodo = service.getTodoById(2);
      expect(updatedTodo?.completed).toBe(true);
    });

    // Проверяет переключение выполненной задачи в невыполненную
    it('should toggle a todo from complete to incomplete', () => {
      const todo = service.getTodoById(1);
      expect(todo?.completed).toBe(true);

      const result = service.toggleTodo(1);
      expect(result).toBe(true);

      const updatedTodo = service.getTodoById(1);
      expect(updatedTodo?.completed).toBe(false);
    });

    // Проверяет обработку ошибки при переключении несуществующей задачи
    it('should return false when toggling non-existent todo', () => {
      const result = service.toggleTodo(999);
      expect(result).toBe(false);
    });

    // Проверяет что после переключения эмитится обновленный список
    it('should emit updated todos after toggling', (done) => {
      let emissionCount = 0;

      service.getTodos().subscribe(todos => {
        emissionCount++;
        if (emissionCount === 2) {
          const toggledTodo = todos.find(t => t.id === 2);
          expect(toggledTodo?.completed).toBe(true);
          done();
        }
      });

      service.toggleTodo(2);
    });
  });

  /**
   * Тесты метода deleteTodo
   * Проверяют удаление задач
   */
  describe('deleteTodo', () => {
    // Проверяет успешное удаление существующей задачи
    it('should delete an existing todo', () => {
      const result = service.deleteTodo(1);
      expect(result).toBe(true);

      // Проверяем что задача действительно удалена
      const deletedTodo = service.getTodoById(1);
      expect(deletedTodo).toBeUndefined();
    });

    // Проверяет обработку попытки удалить несуществующую задачу
    it('should return false when deleting non-existent todo', () => {
      const result = service.deleteTodo(999);
      expect(result).toBe(false);
    });

    // Проверяет что после удаления эмитится обновленный список
    it('should emit updated todos after deletion', (done) => {
      let emissionCount = 0;

      service.getTodos().subscribe(todos => {
        emissionCount++;
        if (emissionCount === 2) {
          expect(todos.length).toBe(2); // Осталось 2 задачи
          expect(todos.find(t => t.id === 1)).toBeUndefined();
          done();
        }
      });

      service.deleteTodo(1);
    });
  });

  /**
   * Тесты метода updateTodo
   * Проверяют обновление заголовка задачи
   */
  describe('updateTodo', () => {
    // Проверяет успешное обновление заголовка
    it('should update todo title', () => {
      const newTitle = 'Updated Title';
      const result = service.updateTodo(1, newTitle);

      expect(result).toBe(true);
      const updatedTodo = service.getTodoById(1);
      expect(updatedTodo?.title).toBe(newTitle);
    });

    // Проверяет обработку попытки обновить несуществующую задачу
    it('should return false when updating non-existent todo', () => {
      const result = service.updateTodo(999, 'New Title');
      expect(result).toBe(false);
    });

    // Проверяет что после обновления эмитится обновленный список
    it('should emit updated todos after update', (done) => {
      let emissionCount = 0;
      const newTitle = 'Updated';

      service.getTodos().subscribe(todos => {
        emissionCount++;
        if (emissionCount === 2) {
          const updatedTodo = todos.find(t => t.id === 1);
          expect(updatedTodo?.title).toBe(newTitle);
          done();
        }
      });

      service.updateTodo(1, newTitle);
    });
  });

  /**
   * Тесты метода getStats
   * Проверяют вычисление статистики задач
   */
  describe('getStats', () => {
    // Проверяет правильность вычисления статистики
    it('should return correct statistics', () => {
      const stats = service.getStats();

      expect(stats.total).toBe(3);      // Всего 3 задачи
      expect(stats.completed).toBe(1);   // 1 выполнена
      expect(stats.pending).toBe(2);     // 2 невыполнены
    });

    // Проверяет обновление статистики после переключения задачи
    it('should update stats after toggling a todo', () => {
      service.toggleTodo(2);
      const stats = service.getStats();

      expect(stats.completed).toBe(2);   // Теперь 2 выполнены
      expect(stats.pending).toBe(1);     // 1 невыполнена
    });

    // Проверяет обновление статистики после добавления задачи
    it('should update stats after adding a todo', (done) => {
      service.addTodo('New Todo').subscribe(() => {
        const stats = service.getStats();
        expect(stats.total).toBe(4);     // Всего стало 4
        expect(stats.pending).toBe(3);   // 3 невыполнены
        done();
      });
    });
  });

  /**
   * Тесты метода clearCompleted
   * Проверяют удаление всех выполненных задач
   */
  describe('clearCompleted', () => {
    // Проверяет удаление всех выполненных задач
    it('should remove all completed todos', () => {
      const removedCount = service.clearCompleted();

      expect(removedCount).toBe(1); // Удалена 1 выполненная задача

      // Проверяем что выполненная задача удалена
      const remainingTodos = service.getTodoById(1);
      expect(remainingTodos).toBeUndefined();
    });

    // Проверяет что невыполненные задачи остаются
    it('should keep uncompleted todos', () => {
      service.clearCompleted();

      // Проверяем что невыполненные задачи все еще есть
      const todo2 = service.getTodoById(2);
      const todo3 = service.getTodoById(3);

      expect(todo2).toBeDefined();
      expect(todo3).toBeDefined();
    });

    // Проверяет работу когда нет выполненных задач
    it('should return 0 when no completed todos exist', () => {
      service.clearCompleted(); // Первый раз удаляем
      const secondClear = service.clearCompleted(); // Второй раз - нечего удалять

      expect(secondClear).toBe(0);
    });

    // Проверяет что после очистки эмитится обновленный список
    it('should emit updated todos after clearing', (done) => {
      let emissionCount = 0;

      service.getTodos().subscribe(todos => {
        emissionCount++;
        if (emissionCount === 2) {
          expect(todos.length).toBe(2); // Осталось 2 задачи
          // Проверяем что все оставшиеся - невыполненные
          expect(todos.every(t => !t.completed)).toBe(true);
          done();
        }
      });

      service.clearCompleted();
    });
  });
});
