# Unit Tests vs Integration Tests - Примеры

## 📚 Содержание

1. [Что такое Unit Tests?](#что-такое-unit-tests)
2. [Что такое Integration Tests?](#что-такое-integration-tests)
3. [Примеры Unit Tests](#примеры-unit-tests)
4. [Примеры Integration Tests](#примеры-integration-tests)
5. [Сравнение](#сравнение)
6. [Когда использовать](#когда-использовать)

---

## Что такое Unit Tests?

**Unit Test** - тестирует **одну единицу кода изолированно** от всего остального.

### Характеристики:
- ✅ Тестирует одну функцию/класс/метод
- ✅ Без зависимостей (или с моками)
- ✅ Очень быстрый (< 10ms)
- ✅ Не использует DOM
- ✅ Не использует TestBed (для pipes/функций)

### Что тестируем:
- Pipes
- Утилитарные функции
- Сервисы (без HTTP)
- Модели/классы
- Валидаторы

---

## Примеры Unit Tests

### 1. Pipe Test - `src/app/pipes/date-ago.pipe.spec.ts`

```typescript
import { DateAgoPipe } from './date-ago.pipe';

describe('DateAgoPipe - UNIT TEST', () => {
  let pipe: DateAgoPipe;

  beforeEach(() => {
    // Просто создаём экземпляр - без TestBed
    pipe = new DateAgoPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  // Unit test - изолированная проверка логики
  it('должен вернуть "только что" для даты меньше минуты', () => {
    const now = new Date();
    const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);
    
    const result = pipe.transform(thirtySecondsAgo);
    
    expect(result).toBe('только что');
  });

  // Unit test - проверка различных входов
  it('должен вернуть "5 минут назад"', () => {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    const result = pipe.transform(fiveMinutesAgo);
    
    expect(result).toBe('5 минут назад');
  });

  // Unit test - граничный случай
  it('должен вернуть пустую строку для null', () => {
    const result = pipe.transform(null as any);
    expect(result).toBe('');
  });

  // Unit test - проверка pluralization логики
  it('должен правильно склонять "1 минута"', () => {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 1 * 60 * 1000);
    
    const result = pipe.transform(oneMinuteAgo);
    
    expect(result).toBe('1 минуту назад');
  });
});
```

**Почему это Unit Test:**
- ❌ Нет TestBed
- ❌ Нет компонентов
- ❌ Нет DOM
- ✅ Тестируем только логику pipe
- ✅ Очень быстро

---

### 2. Service Test - `src/app/services/todo.service.spec.ts`

```typescript
import { TestBed } from '@angular/core/testing';
import { TodoService } from './todo.service';

describe('TodoService - UNIT TEST', () => {
  let service: TodoService;

  beforeEach(() => {
    // Минимальная настройка TestBed для сервиса
    TestBed.configureTestingModule({});
    service = TestBed.inject(TodoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Unit test - тестируем метод добавления
  it('должен добавить новую задачу', (done) => {
    const newTodo = { title: 'Test Task' };
    
    service.addTodo(newTodo).subscribe(todo => {
      // Проверяем только логику сервиса
      expect(todo.id).toBeDefined();
      expect(todo.title).toBe('Test Task');
      expect(todo.completed).toBe(false);
      expect(todo.createdAt).toBeInstanceOf(Date);
      done();
    });
  });

  // Unit test - проверка фильтрации
  it('должен фильтровать выполненные задачи', (done) => {
    // Сначала добавляем задачи
    service.addTodo({ title: 'Task 1' }).subscribe(() => {
      service.addTodo({ title: 'Task 2' }).subscribe(todo => {
        service.toggleTodo(todo.id).subscribe(() => {
          // Проверяем логику фильтрации
          const stats = service.getStats();
          expect(stats.completed).toBe(1);
          expect(stats.pending).toBeGreaterThan(0);
          done();
        });
      });
    });
  });

  // Unit test - проверка Observable поведения
  it('должен эмитить обновления при изменении', (done) => {
    let emitCount = 0;
    
    service.getTodos().subscribe(todos => {
      emitCount++;
      if (emitCount === 2) {
        // Второй эмит после добавления
        expect(todos.length).toBeGreaterThan(0);
        done();
      }
    });
    
    service.addTodo({ title: 'New' }).subscribe();
  });
});
```

**Почему это Unit Test:**
- ✅ Используем TestBed (для DI), но минимально
- ❌ Нет компонентов
- ❌ Нет DOM
- ✅ Тестируем только логику сервиса
- ✅ Быстрый

---

### 3. Filter Pipe Test - `src/app/pipes/todo-filter.pipe.spec.ts`

```typescript
import { TodoFilterPipe } from './todo-filter.pipe';
import { Todo } from '../models/todo.model';

describe('TodoFilterPipe - UNIT TEST', () => {
  let pipe: TodoFilterPipe;

  const mockTodos: Todo[] = [
    { id: 1, title: 'Task 1', completed: false, createdAt: new Date() },
    { id: 2, title: 'Task 2', completed: true, createdAt: new Date() },
    { id: 3, title: 'Task 3', completed: false, createdAt: new Date() }
  ];

  beforeEach(() => {
    pipe = new TodoFilterPipe();
  });

  // Unit test - фильтр 'all'
  it('должен вернуть все задачи для фильтра "all"', () => {
    const result = pipe.transform(mockTodos, 'all');
    expect(result.length).toBe(3);
  });

  // Unit test - фильтр 'completed'
  it('должен вернуть только выполненные задачи', () => {
    const result = pipe.transform(mockTodos, 'completed');
    
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(2);
    expect(result.every(todo => todo.completed)).toBe(true);
  });

  // Unit test - фильтр 'pending'
  it('должен вернуть только невыполненные задачи', () => {
    const result = pipe.transform(mockTodos, 'pending');
    
    expect(result.length).toBe(2);
    expect(result.every(todo => !todo.completed)).toBe(true);
  });

  // Unit test - иммутабельность
  it('не должен изменять оригинальный массив', () => {
    const originalLength = mockTodos.length;
    const originalFirst = mockTodos[0];
    
    pipe.transform(mockTodos, 'completed');
    
    expect(mockTodos.length).toBe(originalLength);
    expect(mockTodos[0]).toBe(originalFirst);
  });
});
```

---

## Что такое Integration Tests?

**Integration Test** - тестирует **взаимодействие между несколькими частями** системы.

### Характеристики:
- ✅ Тестирует несколько компонентов вместе
- ✅ Использует TestBed обязательно
- ✅ Тестирует DOM и рендеринг
- ✅ Мокает только внешние зависимости
- ⚠️ Медленнее (50-200ms)

### Что тестируем:
- Компоненты + шаблоны
- Компоненты + сервисы
- Компоненты + pipes
- Родитель + дочерние компоненты
- Пользовательские взаимодействия

---

## Примеры Integration Tests

### 1. Component Test - `src/app/components/todo-list/todo-list.component.spec.ts`

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { TodoListComponent } from './todo-list.component';
import { TodoService } from '../../services/todo.service';
import { Todo } from '../../models/todo.model';

describe('TodoListComponent - INTEGRATION TEST', () => {
  let component: TodoListComponent;
  let fixture: ComponentFixture<TodoListComponent>;
  let todoService: jasmine.SpyObj<TodoService>;
  let compiled: HTMLElement;

  const mockTodos: Todo[] = [
    { id: 1, title: 'Test Todo 1', completed: false, createdAt: new Date() },
    { id: 2, title: 'Test Todo 2', completed: true, createdAt: new Date() }
  ];

  beforeEach(async () => {
    // Создаём mock сервиса
    const todoServiceSpy = jasmine.createSpyObj('TodoService', [
      'getTodos', 'addTodo', 'toggleTodo', 'deleteTodo', 'getStats'
    ]);

    // Настраиваем TestBed - интеграция компонента с зависимостями
    await TestBed.configureTestingModule({
      imports: [TodoListComponent, FormsModule],
      providers: [
        { provide: TodoService, useValue: todoServiceSpy }
      ]
    }).compileComponents();

    todoService = TestBed.inject(TodoService) as jasmine.SpyObj<TodoService>;
    
    // Настраиваем поведение mock сервиса
    todoService.getTodos.and.returnValue(of(mockTodos));
    todoService.getStats.and.returnValue({ total: 2, completed: 1, pending: 1 });

    fixture = TestBed.createComponent(TodoListComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
  });

  // Integration test - инициализация компонента
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Integration test - компонент + сервис + DOM
  it('должен загрузить и отобразить задачи из сервиса', () => {
    // Act: запускаем жизненный цикл компонента
    fixture.detectChanges();

    // Assert: проверяем что сервис был вызван
    expect(todoService.getTodos).toHaveBeenCalled();
    
    // Assert: проверяем что данные в компоненте
    expect(component.todos.length).toBe(2);
    
    // Assert: проверяем что данные отображаются в DOM
    const items = compiled.querySelectorAll('[data-testid="todo-item"]');
    expect(items.length).toBe(2);
  });

  // Integration test - пользовательское взаимодействие
  it('должен добавить задачу при вводе и клике на кнопку', () => {
    const newTodo = { id: 3, title: 'New Task', completed: false, createdAt: new Date() };
    todoService.addTodo.and.returnValue(of(newTodo));
    
    fixture.detectChanges();

    // Arrange: находим элементы в DOM
    const input = compiled.querySelector('[data-testid="todo-input"]') as HTMLInputElement;
    const button = compiled.querySelector('[data-testid="add-button"]') as HTMLButtonElement;

    // Act: симулируем ввод пользователя
    input.value = 'New Task';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Act: симулируем клик
    button.click();
    fixture.detectChanges();

    // Assert: проверяем что сервис был вызван
    expect(todoService.addTodo).toHaveBeenCalledWith({ title: 'New Task' });
  });

  // Integration test - условный рендеринг
  it('должен показать сообщение о пустом списке', () => {
    todoService.getTodos.and.returnValue(of([]));
    
    fixture.detectChanges();

    const emptyMessage = compiled.querySelector('[data-testid="empty-state"]');
    expect(emptyMessage).toBeTruthy();
    expect(emptyMessage?.textContent).toContain('Нет задач');
  });

  // Integration test - статистика
  it('должен отобразить статистику из сервиса', () => {
    fixture.detectChanges();

    const totalElement = compiled.querySelector('[data-testid="stat-total"]');
    const completedElement = compiled.querySelector('[data-testid="stat-completed"]');
    
    expect(totalElement?.textContent).toContain('2');
    expect(completedElement?.textContent).toContain('1');
  });

  // Integration test - взаимодействие компонент + сервис
  it('должен обновить список после удаления', () => {
    fixture.detectChanges();
    
    const updatedTodos = [mockTodos[0]]; // Удалили второй
    todoService.deleteTodo.and.returnValue(of(undefined));
    todoService.getTodos.and.returnValue(of(updatedTodos));

    // Act: удаляем задачу
    component.deleteTodo(2);
    fixture.detectChanges();

    // Assert: проверяем обновление
    expect(todoService.deleteTodo).toHaveBeenCalledWith(2);
    expect(component.todos.length).toBe(1);
  });
});
```

**Почему это Integration Test:**
- ✅ Используем TestBed полностью
- ✅ Тестируем компонент + сервис (мок)
- ✅ Тестируем DOM и рендеринг
- ✅ Тестируем пользовательские взаимодействия
- ✅ Проверяем жизненный цикл компонента

---

### 2. Parent-Child Integration - `src/app/components/todo-item/todo-item.component.spec.ts`

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodoItemComponent } from './todo-item.component';
import { Todo } from '../../models/todo.model';

describe('TodoItemComponent - INTEGRATION TEST', () => {
  let component: TodoItemComponent;
  let fixture: ComponentFixture<TodoItemComponent>;
  let compiled: HTMLElement;

  const mockTodo: Todo = {
    id: 1,
    title: 'Test Todo',
    completed: false,
    createdAt: new Date('2024-01-15')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoItemComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TodoItemComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
  });

  // Integration test - @Input + рендеринг
  it('должен отобразить данные из @Input свойства', () => {
    // Arrange: устанавливаем @Input
    component.todo = mockTodo;
    component.isHighlighted = true;
    
    // Act: запускаем рендеринг
    fixture.detectChanges();
    
    // Assert: проверяем DOM
    const title = compiled.querySelector('[data-testid="title-1"]');
    expect(title?.textContent).toContain('Test Todo');
    
    const highlighted = compiled.querySelector('.highlighted');
    expect(highlighted).toBeTruthy();
  });

  // Integration test - @Output + DOM события
  it('должен эмитить событие при клике на кнопку', () => {
    spyOn(component.deleteItem, 'emit');
    
    component.todo = mockTodo;
    fixture.detectChanges();
    
    // Act: кликаем на кнопку в DOM
    const deleteBtn = compiled.querySelector('[data-testid="delete-btn-1"]') as HTMLButtonElement;
    deleteBtn.click();
    
    // Assert: проверяем эмиссию события
    expect(component.deleteItem.emit).toHaveBeenCalledWith(1);
  });

  // Integration test - родитель-ребенок взаимодействие
  it('должен работать в контексте родительского компонента', () => {
    component.todo = mockTodo;
    component.isHighlighted = true;
    component.canEdit = true;
    
    let toggledId: number | undefined;
    let deletedId: number | undefined;
    
    // Подписываемся как родитель
    component.toggleComplete.subscribe(id => toggledId = id);
    component.deleteItem.subscribe(id => deletedId = id);
    
    fixture.detectChanges();
    
    // Проверяем рендеринг
    expect(compiled.querySelector('.todo-title')?.textContent).toContain('Test Todo');
    expect(compiled.querySelector('.highlighted')).toBeTruthy();
    
    // Проверяем взаимодействие
    component.onToggle();
    component.onDelete();
    
    expect(toggledId).toBe(1);
    expect(deletedId).toBe(1);
  });
});
```

---

## Сравнение

| Характеристика | Unit Test | Integration Test |
|----------------|-----------|------------------|
| **Скорость** | < 10ms ⚡ | 50-200ms 🐌 |
| **Сложность** | Простой | Сложнее |
| **TestBed** | Не обязателен | Обязателен |
| **DOM** | Не тестируется | Тестируется |
| **Зависимости** | Нет или все моки | Частично реальные |
| **Что проверяет** | Логику одной функции | Взаимодействие частей |
| **Когда падает** | При изменении логики | При изменении логики ИЛИ интерфейса |
| **Количество** | Много (70-80%) | Меньше (20-30%) |

### Пирамида тестирования:

```
        /\
       /E2E\         ← 10% (медленные, хрупкие)
      /──────\
     /Integr-\      ← 20-30% (средние)
    /─ation ──\
   /────────────\
  / Unit Tests  \   ← 70-80% (быстрые, стабильные)
 /────────────────\
```

---

## Когда использовать

### ✅ Unit Tests для:

1. **Pipes**
   ```typescript
   // date-ago.pipe.spec.ts
   it('should format date', () => {
     expect(pipe.transform(date)).toBe('5 минут назад');
   });
   ```

2. **Утилиты**
   ```typescript
   // utils.spec.ts
   it('should calculate sum', () => {
     expect(sum(2, 3)).toBe(5);
   });
   ```

3. **Валидаторы**
   ```typescript
   // validators.spec.ts
   it('should validate email', () => {
     expect(emailValidator('test@test.com')).toBeNull();
   });
   ```

4. **Сервисы (логика)**
   ```typescript
   // service.spec.ts
   it('should filter items', () => {
     expect(service.filterItems(items, 'active')).toHaveLength(2);
   });
   ```

---

### ✅ Integration Tests для:

1. **Компоненты с шаблонами**
   ```typescript
   it('should render todo list', () => {
     fixture.detectChanges();
     expect(compiled.querySelectorAll('li').length).toBe(3);
   });
   ```

2. **Пользовательские сценарии**
   ```typescript
   it('should add todo on button click', () => {
     input.value = 'New';
     button.click();
     expect(items.length).toBe(2);
   });
   ```

3. **Родитель-ребенок**
   ```typescript
   it('should emit event to parent', () => {
     childComponent.itemClicked.subscribe(id => {
       expect(id).toBe(1);
     });
   });
   ```

4. **Формы**
   ```typescript
   it('should validate form', () => {
     component.form.setValue({ name: '' });
     expect(component.form.valid).toBe(false);
   });
   ```

---

## 📍 Примеры в проекте:

### Unit Tests:
- ✅ `src/app/services/todo.service.spec.ts` (15 тестов)
- ✅ `src/app/pipes/todo-filter.pipe.spec.ts` (18 тестов)
- ✅ `src/app/pipes/date-ago.pipe.spec.ts` (30 тестов)

### Integration Tests:
- ✅ `src/app/components/todo-list/todo-list.component.spec.ts` (68 тестов)
- ✅ `src/app/components/todo-item/todo-item.component.spec.ts` (41 тестов)
- ✅ `src/app/app.component.spec.ts` (3 теста)

---

## 🎯 Лучшие практики:

### 1. Начинайте с Unit Tests
```typescript
// ✅ Сначала
it('should calculate discount', () => {
  expect(calculateDiscount(100, 10)).toBe(90);
});

// ⏭️ Потом
it('should display discounted price', () => {
  fixture.detectChanges();
  expect(compiled.querySelector('.price')?.textContent).toBe('90');
});
```

### 2. Unit тесты должны быть быстрыми
```typescript
// ✅ Хорошо - мгновенно
const result = pipe.transform(input);

// ❌ Плохо - медленно
await TestBed.configureTestingModule({...}).compileComponents();
```

### 3. Integration тесты для реальных сценариев
```typescript
// ✅ Хорошо - реальный сценарий
it('user can add and delete todo', () => {
  // Добавить
  addButton.click();
  expect(items.length).toBe(1);
  
  // Удалить
  deleteButton.click();
  expect(items.length).toBe(0);
});
```

---

## 🚀 Запуск тестов:

```bash
# Все тесты (Unit + Integration)
npm test

# Только Unit тесты (быстро)
ng test --include='**/{*.pipe,*.service}.spec.ts'

# Только Integration тесты (медленно)
ng test --include='**/*.component.spec.ts'

# Headless режим
npm run test:headless

# С покрытием
npm run test:coverage
```

---

## 📊 Статистика проекта:

**Unit Tests:** 63 теста (40%)
- TodoService: 15
- TodoFilterPipe: 18
- DateAgoPipe: 30

**Integration Tests:** 112 тестов (71%)
- TodoListComponent: 68
- TodoItemComponent: 41
- AppComponent: 3

**Всего:** 157 тестов

---

## Резюме:

| Вопрос | Ответ |
|--------|-------|
| Что быстрее? | Unit tests ⚡ |
| Что проще? | Unit tests 😊 |
| Что важнее? | Оба! 🎯 |
| Сколько нужно? | 70% unit, 30% integration |
| С чего начать? | С unit тестов 🚀 |

**Золотое правило:** Пишите больше Unit тестов, но не забывайте про Integration! 💡

