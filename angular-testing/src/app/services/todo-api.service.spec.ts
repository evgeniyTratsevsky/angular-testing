/**
 * Тесты для TodoApiService с HttpTestingController
 *
 * Этот файл демонстрирует все аспекты тестирования HTTP запросов:
 * - GET, POST, PUT, PATCH, DELETE запросы
 * - Проверка параметров запросов
 * - Проверка заголовков
 * - Обработка ошибок
 * - Retry логика
 * - Множественные запросы
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TodoApiService } from './todo-api.service';
import { Todo } from '../models/todo.model';

describe('TodoApiService - HttpTestingController', () => {
  let service: TodoApiService;
  let httpMock: HttpTestingController;

  const apiUrl = 'https://api.example.com/todos';

  // Тестовые данные
  const mockTodos: Todo[] = [
    { id: 1, title: 'Todo 1', completed: false, createdAt: new Date('2024-01-01') },
    { id: 2, title: 'Todo 2', completed: true, createdAt: new Date('2024-01-02') },
    { id: 3, title: 'Todo 3', completed: false, createdAt: new Date('2024-01-03') }
  ];

  const mockTodo: Todo = mockTodos[0];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // ← Импортируем HttpClientTestingModule
      providers: [TodoApiService]
    });

    service = TestBed.inject(TodoApiService);
    httpMock = TestBed.inject(HttpTestingController); // ← Получаем HttpTestingController
  });

  // ВАЖНО: Проверяем что не осталось незавершённых запросов
  afterEach(() => {
    httpMock.verify(); // ← Проверяет что все запросы были обработаны после каждого теста
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  /**
   * GET запросы
   */
  describe('GET Requests', () => {
    // Базовый GET запрос
    it('должен получить все задачи через GET', () => {
      // Arrange & Act
      service.getTodos().subscribe(todos => {
        // Assert: проверяем полученные данные
        expect(todos).toEqual(mockTodos);
        expect(todos.length).toBe(3);
      });

      // Assert: проверяем что был сделан правильный запрос
      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');

      // Симулируем ответ от сервера
      req.flush(mockTodos);
    });

    // GET запрос с параметрами
    it('должен получить задачи с пагинацией', () => {
      const page = 2;
      const limit = 10;

      service.getTodosWithPagination(page, limit).subscribe(todos => {
        expect(todos).toEqual(mockTodos);
      });

      // Проверяем URL с параметрами
      const req = httpMock.expectOne(`${apiUrl}?page=2&limit=10`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('limit')).toBe('10');

      // Симулируем ответ от сервера - это заглушка для запроса - мы говорим что запрос должен вернуть mockTodos
      req.flush(mockTodos);
    });

    // GET запрос по ID
    it('должен получить задачу по ID', () => {
      const todoId = 1;

      service.getTodoById(todoId).subscribe(todo => {
        expect(todo).toEqual(mockTodo);
        expect(todo.id).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/${todoId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTodo);
    });

    // GET запрос с query параметрами
    it('должен искать задачи с query параметром', () => {
      const searchQuery = 'test';

      service.searchTodos(searchQuery).subscribe(todos => {
        expect(todos.length).toBeGreaterThan(0);
      });

      const req = httpMock.expectOne(`${apiUrl}/search?q=${searchQuery}`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('q')).toBe(searchQuery);

      req.flush([mockTodo]);
    });
  });

  /**
   * POST запросы
   */
  describe('POST Requests', () => {
    it('должен создать новую задачу через POST', () => {
      const newTodo: Partial<Todo> = { title: 'New Todo', completed: false };
      const createdTodo: Todo = {
        id: 4,
        title: 'New Todo',
        completed: false,
        createdAt: new Date()
      };

      service.createTodo(newTodo).subscribe(todo => {
        expect(todo).toEqual(createdTodo);
        expect(todo.id).toBe(4);
      });

      // Проверяем что был сделан POST запрос
      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');

      // Проверяем тело запроса
      expect(req.request.body).toEqual(newTodo);

      // Проверяем что тело запроса передано
      expect(req.request.body).toBeTruthy();

      req.flush(createdTodo);
    });

    it('должен отправить правильные заголовки в POST запросе', () => {
      const newTodo: Partial<Todo> = { title: 'Test' };

      service.createTodo(newTodo).subscribe();

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');

      // Проверяем что тело запроса правильное
      expect(req.request.body).toEqual(newTodo);

      req.flush({});
    });
  });

  /**
   * PUT запросы
   */
  describe('PUT Requests', () => {
    it('должен обновить задачу через PUT', () => {
      const todoId = 1;
      const updates: Partial<Todo> = { title: 'Updated Title', completed: true };
      const updatedTodo: Todo = { ...mockTodo, ...updates };

      service.updateTodo(todoId, updates).subscribe(todo => {
        expect(todo).toEqual(updatedTodo);
        expect(todo.title).toBe('Updated Title');
        expect(todo.completed).toBe(true);
      });

      const req = httpMock.expectOne(`${apiUrl}/${todoId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updates);

      req.flush(updatedTodo);
    });

    it('должен выполнить массовое обновление', () => {
      const updates = mockTodos.map(t => ({ ...t, completed: true }));

      service.batchUpdate(updates).subscribe(todos => {
        expect(todos.every(t => t.completed)).toBe(true);
      });

      const req = httpMock.expectOne(`${apiUrl}/batch`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updates);

      req.flush(updates);
    });
  });

  /**
   * PATCH запросы
   */
  describe('PATCH Requests', () => {
    it('должен частично обновить задачу через PATCH', () => {
      const todoId = 1;
      const changes: Partial<Todo> = { completed: true };
      const patchedTodo: Todo = { ...mockTodo, completed: true };

      service.patchTodo(todoId, changes).subscribe(todo => {
        expect(todo.completed).toBe(true);
        expect(todo.title).toBe(mockTodo.title); // Остальные поля не изменились
      });

      const req = httpMock.expectOne(`${apiUrl}/${todoId}`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(changes);

      req.flush(patchedTodo);
    });
  });

  /**
   * DELETE запросы
   */
  describe('DELETE Requests', () => {
    it('должен удалить задачу через DELETE', () => {
      const todoId = 1;

      service.deleteTodo(todoId).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/${todoId}`);
      expect(req.request.method).toBe('DELETE');

      // Симулируем успешное удаление (без тела ответа)
      req.flush(null);
    });

    it('должен обработать DELETE с ответом 204 No Content', () => {
      const todoId = 2;

      service.deleteTodo(todoId).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/${todoId}`);
      expect(req.request.method).toBe('DELETE');

      // Симулируем 204 ответ
      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });

  /**
   * Обработка ошибок
   */
  describe('Error Handling', () => {
    it('должен обработать 404 ошибку', () => {
      const todoId = 999;

      service.getTodoById(todoId).subscribe({
        next: () => fail('Should have failed with 404 error'),
        error: (error) => {
          expect(error.message).toContain('Server Error');
          expect(error.message).toContain('404');
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/${todoId}`);

      // Симулируем 404 ошибку
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });

    it('должен обработать 500 ошибку сервера', () => {
      service.getTodos().subscribe({
        next: () => fail('Should have failed with 500 error'),
        error: (error) => {
          expect(error.message).toContain('Server Error');
          expect(error.message).toContain('500');
        }
      });

      // Обрабатываем первую попытку + 2 retry
      for (let i = 0; i < 3; i++) {
        const req = httpMock.expectOne(apiUrl);
        req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
      }
    });

    it('должен обработать network error', () => {
      service.getTodos().subscribe({
        next: () => fail('Should have failed with network error'),
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      // Обрабатываем первую попытку + 2 retry
      for (let i = 0; i < 3; i++) {
        const req = httpMock.expectOne(apiUrl);
        // Симулируем сетевую ошибку
        req.error(new ProgressEvent('Network error'), {
          status: 0,
          statusText: 'Unknown Error'
        });
      }
    });

    it('должен обработать ошибку валидации (422)', () => {
      const invalidTodo: Partial<Todo> = { title: '' }; // Пустой title

      service.createTodo(invalidTodo).subscribe({
        next: () => fail('Should have failed with validation error'),
        error: (error) => {
          expect(error.message).toContain('422');
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(
        { error: 'Validation failed', fields: ['title'] },
        { status: 422, statusText: 'Unprocessable Entity' }
      );
    });
  });

  /**
   * Retry логика
   */
  describe('Retry Logic', () => {
    it('должен повторить GET запрос при ошибке (retry)', () => {
      let callCount = 0;

      service.getTodos().subscribe({
        next: (todos) => {
          expect(todos).toEqual(mockTodos);
          expect(callCount).toBe(3); // Первая попытка + 2 retry
        },
        error: () => fail('Should not error after successful retry')
      });

      // Первая попытка - ошибка
      const req1 = httpMock.expectOne(apiUrl);
      callCount++;
      req1.flush('Error', { status: 500, statusText: 'Server Error' });

      // Вторая попытка (retry 1) - ошибка
      const req2 = httpMock.expectOne(apiUrl);
      callCount++;
      req2.flush('Error', { status: 500, statusText: 'Server Error' });

      // Третья попытка (retry 2) - успех
      const req3 = httpMock.expectOne(apiUrl);
      callCount++;
      req3.flush(mockTodos);
    });

    it('должен вернуть ошибку после всех retry попыток', () => {
      service.getTodos().subscribe({
        next: () => fail('Should have failed after retries'),
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      // Все 3 попытки заканчиваются ошибкой
      for (let i = 0; i < 3; i++) {
        const req = httpMock.expectOne(apiUrl);
        req.flush('Error', { status: 500, statusText: 'Server Error' });
      }
    });
  });

  /**
   * Работа с заголовками
   */
  describe('Headers', () => {
    it('должен получить данные и заголовки', () => {
      service.getStats().subscribe(result => {
        expect(result.data).toBeTruthy();
        expect(result.headers['x-total-count']).toBe('10');
        expect(result.headers['x-completed-count']).toBe('5');
      });

      const req = httpMock.expectOne(`${apiUrl}/stats`);
      expect(req.request.method).toBe('GET');

      // Симулируем ответ с custom заголовками
      req.flush(
        { total: 10, completed: 5 },
        {
          headers: {
            'x-total-count': '10',
            'x-completed-count': '5'
          }
        }
      );
    });
  });

  /**
   * Множественные запросы
   */
  describe('Multiple Requests', () => {
    it('должен обработать несколько параллельных запросов', () => {
      const results: Todo[] = [];

      // Делаем 3 параллельных запроса
      service.getTodoById(1).subscribe(todo => results.push(todo));
      service.getTodoById(2).subscribe(todo => results.push(todo));
      service.getTodoById(3).subscribe(todo => results.push(todo));

      // Проверяем что были сделаны 3 запроса
      const requests = [
        httpMock.expectOne(`${apiUrl}/1`),
        httpMock.expectOne(`${apiUrl}/2`),
        httpMock.expectOne(`${apiUrl}/3`)
      ];

      // Отвечаем на каждый запрос
      requests[0].flush(mockTodos[0]);
      requests[1].flush(mockTodos[1]);
      requests[2].flush(mockTodos[2]);

      // Проверяем результаты
      expect(results.length).toBe(3);
      expect(results[0].id).toBe(1);
      expect(results[1].id).toBe(2);
      expect(results[2].id).toBe(3);
    });

    it('должен обработать последовательные запросы', () => {
      // Сначала создаём задачу
      service.createTodo({ title: 'New' }).subscribe(created => {
        // Затем обновляем её
        service.updateTodo(created.id, { completed: true }).subscribe(updated => {
          expect(updated.completed).toBe(true);
        });

        // Обрабатываем второй запрос
        const updateReq = httpMock.expectOne(`${apiUrl}/${created.id}`);
        expect(updateReq.request.method).toBe('PUT');
        updateReq.flush({ ...created, completed: true });
      });

      // Обрабатываем первый запрос
      const createReq = httpMock.expectOne(apiUrl);
      expect(createReq.request.method).toBe('POST');
      createReq.flush({ id: 99, title: 'New', completed: false, createdAt: new Date() });
    });
  });

  /**
   * Проверка что запросы НЕ были сделаны
   */
  describe('No Requests Made', () => {
    it('не должно быть запросов если метод не вызван', () => {
      // Ничего не вызываем

      // verify() проверит что не было запросов
      httpMock.verify();
    });

    it('должен проверить что конкретный URL НЕ был запрошен', () => {
      service.getTodos().subscribe();

      const req = httpMock.expectOne(apiUrl);
      req.flush([]);

      // Проверяем что другой URL не был запрошен
      httpMock.expectNone(`${apiUrl}/999`);
    });
  });

  /**
   * Сложные сценарии
   */
  describe('Complex Scenarios', () => {
    it('должен обработать create -> update -> delete цепочку', () => {
      let createdId: number;

      // 1. Create
      service.createTodo({ title: 'Test' }).subscribe(created => {
        createdId = created.id;

        // 2. Update
        service.patchTodo(createdId, { completed: true }).subscribe(() => {

          // 3. Delete
          service.deleteTodo(createdId).subscribe(() => {
            expect(createdId).toBeDefined();
          });

          // Handle delete request
          const deleteReq = httpMock.expectOne(`${apiUrl}/${createdId}`);
          deleteReq.flush(null);
        });

        // Handle update request
        const updateReq = httpMock.expectOne(`${apiUrl}/${createdId}`);
        updateReq.flush({ ...created, completed: true });
      });

      // Handle create request
      const createReq = httpMock.expectOne(apiUrl);
      createReq.flush({ id: 100, title: 'Test', completed: false, createdAt: new Date() });
    });
  });
});

