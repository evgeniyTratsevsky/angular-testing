# Тестирование HTTP запросов с HttpTestingController

## 📚 Содержание

1. [Что такое HttpTestingController?](#что-такое-httptestingcontroller)
2. [Настройка тестов](#настройка-тестов)
3. [Базовые примеры](#базовые-примеры)
4. [GET запросы](#get-запросы)
5. [POST/PUT/PATCH/DELETE](#postputpatchdelete)
6. [Обработка ошибок](#обработка-ошибок)
7. [Retry логика](#retry-логика)
8. [Заголовки и параметры](#заголовки-и-параметры)
9. [Лучшие практики](#лучшие-практики)

---

## Что такое HttpTestingController?

**HttpTestingController** - это инструмент Angular для тестирования HTTP запросов **без реальных сетевых вызовов**.

### Преимущества:
- ✅ **Быстро** - нет реальных HTTP запросов
- ✅ **Надёжно** - нет зависимости от сети
- ✅ **Контролируемо** - можно симулировать любые ответы и ошибки
- ✅ **Изолированно** - тестируем только наш код

### Как это работает:

```
Ваш код                HttpClient               HttpTestingController
   │                       │                            │
   ├──────GET /api────────>│                            │
   │                       │                            │
   │                       ├────Перехватывается────────>│
   │                       │                            │
   │                       │<────Моковый ответ──────────┤
   │<─────Response─────────┤                            │
```

---

## Настройка тестов

### 1. Импорт HttpClientTestingModule

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { YourService } from './your.service';

describe('YourService', () => {
  let service: YourService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // ← Импортируем модуль
      providers: [YourService]
    });

    service = TestBed.inject(YourService);
    httpMock = TestBed.inject(HttpTestingController); // ← Получаем контроллер
  });

  // ВАЖНО: Проверяем что нет незавершённых запросов
  afterEach(() => {
    httpMock.verify(); // ← Проверка после каждого теста
  });
});
```

### 2. Структура теста

```typescript
it('should make HTTP request', () => {
  // 1. ACT: Вызываем метод который делает HTTP запрос
  service.getData().subscribe(data => {
    // 3. ASSERT: Проверяем полученные данные
    expect(data).toEqual(expectedData);
  });

  // 2. ARRANGE: Перехватываем и обрабатываем запрос
  const req = httpMock.expectOne('/api/data');
  expect(req.request.method).toBe('GET');
  req.flush(expectedData); // Отправляем моковый ответ
});
```

---

## Базовые примеры

### Пример 1: Простой GET запрос

```typescript
// Сервис
@Injectable()
export class TodoApiService {
  constructor(private http: HttpClient) {}

  getTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>('https://api.example.com/todos');
  }
}

// Тест
it('should get todos', () => {
  const mockTodos = [
    { id: 1, title: 'Todo 1', completed: false },
    { id: 2, title: 'Todo 2', completed: true }
  ];

  // Вызываем метод
  service.getTodos().subscribe(todos => {
    expect(todos).toEqual(mockTodos);
    expect(todos.length).toBe(2);
  });

  // Перехватываем запрос
  const req = httpMock.expectOne('https://api.example.com/todos');
  
  // Проверяем метод запроса
  expect(req.request.method).toBe('GET');
  
  // Отправляем моковый ответ
  req.flush(mockTodos);
});
```

### Пример 2: POST запрос с телом

```typescript
// Сервис
createTodo(todo: Partial<Todo>): Observable<Todo> {
  return this.http.post<Todo>('https://api.example.com/todos', todo);
}

// Тест
it('should create todo', () => {
  const newTodo = { title: 'New Task', completed: false };
  const createdTodo = { id: 3, ...newTodo };

  service.createTodo(newTodo).subscribe(todo => {
    expect(todo).toEqual(createdTodo);
    expect(todo.id).toBe(3);
  });

  const req = httpMock.expectOne('https://api.example.com/todos');
  expect(req.request.method).toBe('POST');
  
  // Проверяем тело запроса
  expect(req.request.body).toEqual(newTodo);
  
  req.flush(createdTodo);
});
```

---

## GET запросы

### GET с параметрами

```typescript
// Сервис
getTodosWithPagination(page: number, limit: number): Observable<Todo[]> {
  return this.http.get<Todo[]>('https://api.example.com/todos', {
    params: { page: page.toString(), limit: limit.toString() }
  });
}

// Тест
it('should get todos with pagination', () => {
  const mockTodos = [{ id: 1, title: 'Todo 1', completed: false }];

  service.getTodosWithPagination(2, 10).subscribe(todos => {
    expect(todos).toEqual(mockTodos);
  });

  // Проверяем URL с параметрами
  const req = httpMock.expectOne('https://api.example.com/todos?page=2&limit=10');
  expect(req.request.method).toBe('GET');
  
  // Проверяем параметры
  expect(req.request.params.get('page')).toBe('2');
  expect(req.request.params.get('limit')).toBe('10');

  req.flush(mockTodos);
});
```

### GET по ID

```typescript
// Сервис
getTodoById(id: number): Observable<Todo> {
  return this.http.get<Todo>(`https://api.example.com/todos/${id}`);
}

// Тест
it('should get todo by id', () => {
  const mockTodo = { id: 1, title: 'Todo 1', completed: false };

  service.getTodoById(1).subscribe(todo => {
    expect(todo).toEqual(mockTodo);
  });

  const req = httpMock.expectOne('https://api.example.com/todos/1');
  expect(req.request.method).toBe('GET');
  req.flush(mockTodo);
});
```

### GET с поиском

```typescript
// Сервис
searchTodos(query: string): Observable<Todo[]> {
  return this.http.get<Todo[]>('https://api.example.com/todos/search', {
    params: { q: query }
  });
}

// Тест
it('should search todos', () => {
  const mockResults = [{ id: 1, title: 'Test Todo', completed: false }];

  service.searchTodos('test').subscribe(todos => {
    expect(todos.length).toBeGreaterThan(0);
  });

  const req = httpMock.expectOne('https://api.example.com/todos/search?q=test');
  expect(req.request.params.get('q')).toBe('test');
  req.flush(mockResults);
});
```

---

## POST/PUT/PATCH/DELETE

### POST - Создание

```typescript
it('should create todo via POST', () => {
  const newTodo = { title: 'New Todo', completed: false };
  const created = { id: 99, ...newTodo };

  service.createTodo(newTodo).subscribe(todo => {
    expect(todo.id).toBeDefined();
  });

  const req = httpMock.expectOne('https://api.example.com/todos');
  expect(req.request.method).toBe('POST');
  expect(req.request.body).toEqual(newTodo);
  req.flush(created);
});
```

### PUT - Полное обновление

```typescript
// Сервис
updateTodo(id: number, todo: Partial<Todo>): Observable<Todo> {
  return this.http.put<Todo>(`https://api.example.com/todos/${id}`, todo);
}

// Тест
it('should update todo via PUT', () => {
  const updates = { title: 'Updated', completed: true };
  const updated = { id: 1, ...updates };

  service.updateTodo(1, updates).subscribe(todo => {
    expect(todo.title).toBe('Updated');
  });

  const req = httpMock.expectOne('https://api.example.com/todos/1');
  expect(req.request.method).toBe('PUT');
  expect(req.request.body).toEqual(updates);
  req.flush(updated);
});
```

### PATCH - Частичное обновление

```typescript
// Сервис
patchTodo(id: number, changes: Partial<Todo>): Observable<Todo> {
  return this.http.patch<Todo>(`https://api.example.com/todos/${id}`, changes);
}

// Тест
it('should partially update todo via PATCH', () => {
  const changes = { completed: true };

  service.patchTodo(1, changes).subscribe(todo => {
    expect(todo.completed).toBe(true);
  });

  const req = httpMock.expectOne('https://api.example.com/todos/1');
  expect(req.request.method).toBe('PATCH');
  expect(req.request.body).toEqual(changes);
  req.flush({ id: 1, title: 'Todo', completed: true });
});
```

### DELETE - Удаление

```typescript
// Сервис
deleteTodo(id: number): Observable<void> {
  return this.http.delete<void>(`https://api.example.com/todos/${id}`);
}

// Тест
it('should delete todo via DELETE', () => {
  service.deleteTodo(1).subscribe(response => {
    expect(response).toBeUndefined();
  });

  const req = httpMock.expectOne('https://api.example.com/todos/1');
  expect(req.request.method).toBe('DELETE');
  req.flush(null); // DELETE обычно не возвращает тело
});
```

---

## Обработка ошибок

### 404 Not Found

```typescript
it('should handle 404 error', () => {
  service.getTodoById(999).subscribe({
    next: () => fail('Should have failed with 404'),
    error: (error) => {
      expect(error.status).toBe(404);
      expect(error.statusText).toBe('Not Found');
    }
  });

  const req = httpMock.expectOne('https://api.example.com/todos/999');
  
  // Симулируем 404 ошибку
  req.flush('Not Found', { 
    status: 404, 
    statusText: 'Not Found' 
  });
});
```

### 500 Server Error

```typescript
it('should handle 500 error', () => {
  service.getTodos().subscribe({
    next: () => fail('Should have failed with 500'),
    error: (error) => {
      expect(error.status).toBe(500);
    }
  });

  const req = httpMock.expectOne('https://api.example.com/todos');
  req.flush('Server Error', { 
    status: 500, 
    statusText: 'Internal Server Error' 
  });
});
```

### Network Error

```typescript
it('should handle network error', () => {
  service.getTodos().subscribe({
    next: () => fail('Should have failed with network error'),
    error: (error) => {
      expect(error.error.type).toBe('Network error');
    }
  });

  const req = httpMock.expectOne('https://api.example.com/todos');
  
  // Симулируем сетевую ошибку
  req.error(new ProgressEvent('Network error'), {
    status: 0,
    statusText: 'Unknown Error'
  });
});
```

### Validation Error (422)

```typescript
it('should handle validation error', () => {
  const invalidTodo = { title: '' };

  service.createTodo(invalidTodo).subscribe({
    next: () => fail('Should have failed'),
    error: (error) => {
      expect(error.status).toBe(422);
      expect(error.error.fields).toContain('title');
    }
  });

  const req = httpMock.expectOne('https://api.example.com/todos');
  req.flush(
    { error: 'Validation failed', fields: ['title'] },
    { status: 422, statusText: 'Unprocessable Entity' }
  );
});
```

---

## Retry логика

### Тестирование retry()

```typescript
// Сервис с retry
getTodos(): Observable<Todo[]> {
  return this.http.get<Todo[]>('https://api.example.com/todos').pipe(
    retry(2), // Повторить 2 раза при ошибке
    catchError(this.handleError)
  );
}

// Тест
it('should retry request on failure', () => {
  let callCount = 0;
  const mockTodos = [{ id: 1, title: 'Todo', completed: false }];

  service.getTodos().subscribe(todos => {
    expect(todos).toEqual(mockTodos);
    expect(callCount).toBe(3); // 1 original + 2 retries
  });

  // Первая попытка - ошибка
  const req1 = httpMock.expectOne('https://api.example.com/todos');
  callCount++;
  req1.flush('Error', { status: 500, statusText: 'Server Error' });

  // Вторая попытка (retry 1) - ошибка
  const req2 = httpMock.expectOne('https://api.example.com/todos');
  callCount++;
  req2.flush('Error', { status: 500, statusText: 'Server Error' });

  // Третья попытка (retry 2) - успех
  const req3 = httpMock.expectOne('https://api.example.com/todos');
  callCount++;
  req3.flush(mockTodos);
});
```

---

## Заголовки и параметры

### Проверка заголовков запроса

```typescript
it('should send correct headers', () => {
  service.createTodo({ title: 'Test' }).subscribe();

  const req = httpMock.expectOne('https://api.example.com/todos');
  
  // Проверяем заголовки
  expect(req.request.headers.has('Content-Type')).toBeTruthy();
  expect(req.request.detectContentTypeHeader()).toBe('application/json');

  req.flush({});
});
```

### Получение заголовков ответа

```typescript
// Сервис
getStats(): Observable<{ data: any; headers: any }> {
  return this.http.get('https://api.example.com/todos/stats', {
    observe: 'response' // ← Получаем полный ответ с заголовками
  }).pipe(
    map(response => ({
      data: response.body,
      headers: {
        'x-total-count': response.headers.get('x-total-count'),
        'x-page': response.headers.get('x-page')
      }
    }))
  );
}

// Тест
it('should get response headers', () => {
  service.getStats().subscribe(result => {
    expect(result.data.total).toBe(100);
    expect(result.headers['x-total-count']).toBe('100');
    expect(result.headers['x-page']).toBe('1');
  });

  const req = httpMock.expectOne('https://api.example.com/todos/stats');
  
  // Отправляем ответ с custom заголовками
  req.flush(
    { total: 100 },
    { 
      headers: {
        'x-total-count': '100',
        'x-page': '1'
      }
    }
  );
});
```

---

## Множественные запросы

### Параллельные запросы

```typescript
it('should handle multiple parallel requests', () => {
  const results: Todo[] = [];

  // Делаем 3 параллельных запроса
  service.getTodoById(1).subscribe(todo => results.push(todo));
  service.getTodoById(2).subscribe(todo => results.push(todo));
  service.getTodoById(3).subscribe(todo => results.push(todo));

  // Перехватываем все запросы
  const req1 = httpMock.expectOne('https://api.example.com/todos/1');
  const req2 = httpMock.expectOne('https://api.example.com/todos/2');
  const req3 = httpMock.expectOne('https://api.example.com/todos/3');

  // Отвечаем на каждый
  req1.flush({ id: 1, title: 'Todo 1', completed: false });
  req2.flush({ id: 2, title: 'Todo 2', completed: true });
  req3.flush({ id: 3, title: 'Todo 3', completed: false });

  expect(results.length).toBe(3);
});
```

### Последовательные запросы

```typescript
it('should handle sequential requests', () => {
  // Сначала создаём
  service.createTodo({ title: 'New' }).subscribe(created => {
    // Затем обновляем
    service.updateTodo(created.id, { completed: true }).subscribe(updated => {
      expect(updated.completed).toBe(true);
    });

    // Обрабатываем второй запрос
    const updateReq = httpMock.expectOne(`https://api.example.com/todos/${created.id}`);
    updateReq.flush({ ...created, completed: true });
  });

  // Обрабатываем первый запрос
  const createReq = httpMock.expectOne('https://api.example.com/todos');
  createReq.flush({ id: 99, title: 'New', completed: false });
});
```

---

## Лучшие практики

### ✅ DO (Делайте так)

#### 1. Всегда вызывайте verify()

```typescript
afterEach(() => {
  httpMock.verify(); // ← Проверяет что все запросы обработаны
});
```

#### 2. Проверяйте метод запроса

```typescript
const req = httpMock.expectOne(url);
expect(req.request.method).toBe('POST'); // ← Важно!
```

#### 3. Проверяйте тело запроса

```typescript
expect(req.request.body).toEqual(expectedData);
```

#### 4. Тестируйте ошибки

```typescript
it('should handle errors', () => {
  service.getData().subscribe({
    next: () => fail('Should have failed'),
    error: (error) => expect(error).toBeTruthy()
  });

  const req = httpMock.expectOne(url);
  req.flush('Error', { status: 500, statusText: 'Server Error' });
});
```

---

### ❌ DON'T (Не делайте так)

#### 1. Не забывайте flush()

```typescript
// ❌ Плохо - запрос зависнет
service.getData().subscribe();
const req = httpMock.expectOne(url);
// Забыли req.flush()

// ✅ Хорошо
const req = httpMock.expectOne(url);
req.flush(mockData);
```

#### 2. Не делайте реальные HTTP запросы

```typescript
// ❌ Плохо - реальный запрос в тестах
TestBed.configureTestingModule({
  imports: [HttpClientModule] // ← Неправильно!
});

// ✅ Хорошо - моки
TestBed.configureTestingModule({
  imports: [HttpClientTestingModule] // ← Правильно!
});
```

#### 3. Не игнорируйте незавершённые запросы

```typescript
// ❌ Плохо - нет verify()
afterEach(() => {
  // Пусто
});

// ✅ Хорошо
afterEach(() => {
  httpMock.verify();
});
```

---

## Полезные методы HttpTestingController

| Метод | Описание |
|-------|----------|
| `expectOne(url)` | Ожидает ОДИН запрос к URL |
| `expectNone(url)` | Проверяет что НЕТ запросов к URL |
| `match(url)` | Находит ВСЕ запросы к URL (массив) |
| `verify()` | Проверяет что все запросы обработаны |

---

## Резюме

| Аспект | Как тестировать |
|--------|-----------------|
| **GET** | `expectOne(url)` + `flush(data)` |
| **POST** | Проверить `method` и `body` |
| **Ошибки** | `flush(error, { status: 404 })` |
| **Параметры** | `req.request.params.get('key')` |
| **Заголовки** | `req.request.headers.has('key')` |
| **Retry** | Несколько `expectOne()` для повторов |

---

## Примеры в проекте

**Полный пример:** `src/app/services/todo-api.service.spec.ts`

- ✅ 50+ тестов
- ✅ Все HTTP методы
- ✅ Обработка ошибок
- ✅ Retry логика
- ✅ Заголовки и параметры

**Запуск:**
```bash
ng test --include='**/todo-api.service.spec.ts'
```

---

## Дополнительные ресурсы

- [Angular HTTP Testing](https://angular.dev/guide/http/testing)
- [HttpClientTestingModule API](https://angular.dev/api/common/http/testing/HttpClientTestingModule)
- [HttpTestingController API](https://angular.dev/api/common/http/testing/HttpTestingController)

**HttpTestingController делает тестирование HTTP простым и надёжным!** 🚀

