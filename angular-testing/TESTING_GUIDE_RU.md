# Руководство по тестированию Angular - Jasmine, TestBed и Karma

Этот проект демонстрирует комплексное тестирование Angular приложений с использованием **Jasmine**, **TestBed** и **Karma**.

## 🎯 Стек тестирования

- **Jasmine**: BDD фреймворк для написания тестов
- **Karma**: Test runner, который выполняет тесты в реальных браузерах
- **TestBed**: Утилита Angular для создания тестового окружения компонентов
- **Angular Testing Library**: Встроенные утилиты для тестирования

## 📦 Структура проекта

```
src/app/
├── models/
│   └── todo.model.ts              # TypeScript интерфейсы
├── services/
│   ├── todo.service.ts            # Сервис с бизнес-логикой
│   └── todo.service.spec.ts       # Юнит-тесты сервиса
├── components/
│   └── todo-list/
│       ├── todo-list.component.ts        # Логика компонента
│       ├── todo-list.component.html      # Шаблон
│       ├── todo-list.component.less      # Стили
│       └── todo-list.component.spec.ts   # Тесты компонента
└── app.component.ts               # Корневой компонент
```

## 🧪 Типы тестов

### 1. **Юнит-тесты (Сервисы)**
Расположение: `todo.service.spec.ts`

Тестируют чистую бизнес-логику без зависимостей:
- Возвращаемые значения методов
- Управление состоянием
- Поведение Observable
- Граничные случаи и обработка ошибок

**Ключевые паттерны:**
```typescript
describe('TodoService', () => {
  let service: TodoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TodoService);
  });

  it('должен добавить новую задачу', (done) => {
    service.addTodo('Тест').subscribe(todo => {
      expect(todo.title).toBe('Тест');
      done();
    });
  });
});
```

### 2. **Тесты компонентов**
Расположение: `todo-list.component.spec.ts`

Тестируют поведение компонента с TestBed:
- Инициализация компонента
- Рендеринг шаблона
- Взаимодействие пользователя (клики, ввод)
- Интеграция с замоканными сервисами
- Манипуляция DOM
- Асинхронные операции с `fakeAsync` и `tick`

**Ключевые паттерны:**
```typescript
describe('TodoListComponent', () => {
  let component: TodoListComponent;
  let fixture: ComponentFixture<TodoListComponent>;
  let mockService: jasmine.SpyObj<TodoService>;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('TodoService', ['getTodos', 'addTodo']);
    
    await TestBed.configureTestingModule({
      imports: [TodoListComponent],
      providers: [
        { provide: TodoService, useValue: mockService }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(TodoListComponent);
    component = fixture.componentInstance;
  });
});
```

## 🔧 Запуск тестов

### Запустить все тесты
```bash
npm test
```
или
```bash
ng test
```

### Запустить тесты один раз (CI режим)
```bash
npm run test:headless
```

### Запустить тесты с покрытием кода
```bash
npm run test:coverage
```

Отчеты о покрытии будут созданы в директории `coverage/`.

## 📊 Паттерны и лучшие практики тестирования

### 1. **Паттерн Arrange-Act-Assert (AAA)**
```typescript
it('должен переключить статус задачи', () => {
  // Arrange (Подготовка)
  const todoId = 1;
  const initialState = service.getTodoById(todoId);
  
  // Act (Действие)
  service.toggleTodo(todoId);
  
  // Assert (Проверка)
  const updatedState = service.getTodoById(todoId);
  expect(updatedState.completed).toBe(!initialState.completed);
});
```

### 2. **Мокирование зависимостей**
```typescript
const mockService = jasmine.createSpyObj('TodoService', ['addTodo']);
mockService.addTodo.and.returnValue(of(mockTodo));
```

### 3. **Тестирование асинхронных операций**
```typescript
// Используя done callback
it('должен обработать асинхронную операцию', (done) => {
  service.getData().subscribe(data => {
    expect(data).toBeTruthy();
    done();
  });
});

// Используя fakeAsync
it('должен обработать асинхронную операцию с fakeAsync', fakeAsync(() => {
  service.addTodo('Тест').subscribe();
  tick(100); // Симуляция прохождения времени
  expect(component.isLoading).toBe(false);
}));
```

### 4. **Тестирование взаимодействия с DOM**
```typescript
it('должен вызвать addTodo при клике на кнопку', () => {
  spyOn(component, 'addTodo');
  const button = fixture.nativeElement.querySelector('[data-testid="add-button"]');
  button.click();
  expect(component.addTodo).toHaveBeenCalled();
});
```

### 5. **Тестирование форм и ввода**
```typescript
it('должен обновить модель при изменении input', () => {
  const input = fixture.nativeElement.querySelector('[data-testid="todo-input"]');
  input.value = 'Новая задача';
  input.dispatchEvent(new Event('input'));
  fixture.detectChanges();
  expect(component.newTodoTitle).toBe('Новая задача');
});
```

## 🎓 Используемые возможности Jasmine

### Матчеры
```typescript
expect(value).toBe(expected);           // Строгое равенство (===)
expect(value).toEqual(expected);        // Глубокое равенство
expect(value).toBeTruthy();             // Проверка на истинность
expect(value).toBeFalsy();              // Проверка на ложность
expect(value).toBeUndefined();          // Проверка на undefined
expect(value).toContain(item);          // Содержит элемент (массив/строка)
expect(array.length).toBeGreaterThan(0); // Сравнение
```

### Шпионы (Spies)
```typescript
spyOn(object, 'method');                    // Создать шпиона на метод
spyOn(object, 'method').and.returnValue(5); // Замокировать возвращаемое значение
spyOn(object, 'method').and.callThrough(); // Вызвать оригинальный метод
expect(spy).toHaveBeenCalled();             // Проверить вызов
expect(spy).toHaveBeenCalledWith(arg);      // Проверить аргументы
```

### Хуки жизненного цикла
```typescript
beforeEach(() => {});  // Выполняется перед каждым тестом
afterEach(() => {});   // Выполняется после каждого теста
beforeAll(() => {});   // Выполняется один раз перед всеми тестами
afterAll(() => {});    // Выполняется один раз после всех тестов
```

## 🏗️ API TestBed

### Конфигурация
```typescript
TestBed.configureTestingModule({
  imports: [ComponentToTest],
  providers: [ServiceProvider],
  declarations: [] // Для старых версий Angular
});
```

### Создание компонентов
```typescript
const fixture = TestBed.createComponent(MyComponent);
const component = fixture.componentInstance;
const compiled = fixture.nativeElement;
fixture.detectChanges(); // Запустить обнаружение изменений
```

### Внедрение сервисов
```typescript
const service = TestBed.inject(MyService);
```

## 📝 Цели покрытия кода

- **Инструкции**: > 80%
- **Ветвления**: > 75%
- **Функции**: > 80%
- **Строки**: > 80%

## 🚀 Продвинутые техники тестирования

### 1. **Тестирование Observable с Marble Testing**
```typescript
// Для сложных потоков observable
import { TestScheduler } from 'rxjs/testing';
```

### 2. **Тестирование HTTP запросов**
```typescript
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
```

### 3. **Тестирование навигации роутера**
```typescript
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
```

## 🐛 Частые проблемы тестирования и решения

### Проблема: Тесты зависают
**Решение**: Используйте callback `done()` или `fakeAsync` с `tick()`

### Проблема: Обнаружение изменений не работает
**Решение**: Вызовите `fixture.detectChanges()` после изменений

### Проблема: "Can't resolve all parameters"
**Решение**: Убедитесь, что все зависимости предоставлены в TestBed

### Проблема: Асинхронный тест завершается до завершения observable
**Решение**: Используйте callback `done()` в subscribe

## 📚 Дополнительные ресурсы

- [Руководство по тестированию Angular](https://angular.dev/guide/testing)
- [Документация Jasmine](https://jasmine.github.io/)
- [Документация Karma](https://karma-runner.github.io/)
- [API TestBed Angular](https://angular.dev/api/core/testing/TestBed)

## 🎯 Пирамида тестирования в этом проекте

```
     /\
    /  \  E2E тесты (не включены, можно использовать Cypress/Playwright)
   /----\
  / Интег \  Интеграционные тесты (Компонент + Сервис)
 /--------\
/  Юнит    \  Юнит-тесты (логика сервисов)
/___________\
```

Этот проект фокусируется на **юнит-тестах** и **интеграционных тестах** (тестирование компонентов).

## 💡 Советы по написанию хороших тестов

1. ✅ Тестируйте поведение, а не реализацию
2. ✅ Используйте описательные названия тестов
3. ✅ Держите тесты изолированными и независимыми
4. ✅ Мокируйте внешние зависимости
5. ✅ Тестируйте граничные случаи и сценарии ошибок
6. ✅ Используйте атрибуты `data-testid` для стабильных селекторов
7. ✅ Стремитесь к быстрому выполнению тестов
8. ✅ Пишите тесты вместе с кодом (TDD когда возможно)

## 📖 Описание тестов в проекте

### Тесты TodoService

#### **getTodos**
- ✅ Должен вернуть observable со списком задач
- ✅ Должен эмитить начальные задачи при подписке

#### **getTodoById**
- ✅ Должен вернуть задачу когда она существует
- ✅ Должен вернуть undefined когда задача не существует

#### **addTodo**
- ✅ Должен добавить новую задачу
- ✅ Должен эмитить обновленный список задач после добавления
- ✅ Должен назначать уникальные ID новым задачам

#### **toggleTodo**
- ✅ Должен переключить задачу из невыполненной в выполненную
- ✅ Должен переключить задачу из выполненной в невыполненную
- ✅ Должен вернуть false при переключении несуществующей задачи
- ✅ Должен эмитить обновленные задачи после переключения

#### **deleteTodo**
- ✅ Должен удалить существующую задачу
- ✅ Должен вернуть false при удалении несуществующей задачи
- ✅ Должен эмитить обновленные задачи после удаления

#### **updateTodo**
- ✅ Должен обновить заголовок задачи
- ✅ Должен вернуть false при обновлении несуществующей задачи
- ✅ Должен эмитить обновленные задачи после обновления

#### **getStats**
- ✅ Должен вернуть корректную статистику
- ✅ Должен обновить статистику после переключения задачи
- ✅ Должен обновить статистику после добавления задачи

#### **clearCompleted**
- ✅ Должен удалить все выполненные задачи
- ✅ Должен оставить невыполненные задачи
- ✅ Должен вернуть 0 когда нет выполненных задач
- ✅ Должен эмитить обновленные задачи после очистки

### Тесты TodoListComponent

#### **Инициализация компонента**
- ✅ Должен создаться
- ✅ Должен вызвать getTodos при инициализации
- ✅ Должен инициализировать статистику при запуске
- ✅ Должен иметь пустой newTodoTitle изначально
- ✅ Не должен быть в режиме редактирования изначально

#### **Рендеринг шаблона**
- ✅ Должен отображать заголовок
- ✅ Должен корректно отображать статистику
- ✅ Должен рендерить элементы задач
- ✅ Должен отображать заголовки задач
- ✅ Должен применять класс completed к выполненным задачам
- ✅ Должен отображать пустое состояние когда нет задач
- ✅ Должен показывать кнопку очистки выполненных когда есть выполненные задачи
- ✅ Не должен показывать кнопку очистки когда нет выполненных задач

#### **addTodo**
- ✅ Должен добавить задачу когда заголовок валиден
- ✅ Должен показать ошибку когда заголовок пустой
- ✅ Должен показать ошибку когда заголовок слишком короткий
- ✅ Должен обрезать пробелы из заголовка
- ✅ Должен обновить статистику после добавления задачи
- ✅ Должен обработать ошибку когда добавление задачи не удалось

#### **Взаимодействие пользователя**
- ✅ Должен вызвать addTodo при клике на кнопку добавления
- ✅ Должен вызвать addTodo при нажатии Enter в поле ввода
- ✅ Должен отключить input и кнопку во время загрузки

#### **toggleTodo**
- ✅ Должен вызвать todoService.toggleTodo с корректным ID
- ✅ Должен обновить статистику после переключения
- ✅ Должен переключить при клике на checkbox

#### **deleteTodo**
- ✅ Должен вызвать todoService.deleteTodo с корректным ID
- ✅ Должен обновить статистику после удаления
- ✅ Должен удалить при клике на кнопку удаления

#### **Функциональность редактирования**
- ✅ Должен войти в режим редактирования при клике на кнопку редактирования
- ✅ Должен показать input редактирования в режиме редактирования
- ✅ Должен сохранить изменения при клике на кнопку сохранения
- ✅ Не должен сохранить изменения если заголовок слишком короткий
- ✅ Должен отменить редактирование при клике на кнопку отмены

#### **clearCompleted**
- ✅ Должен вызвать todoService.clearCompleted
- ✅ Должен обновить статистику после очистки
- ✅ Должен очистить при клике на кнопку очистки выполненных

#### **Обработка ошибок**
- ✅ Должен отображать сообщение об ошибке когда оно присутствует
- ✅ Не должен отображать сообщение об ошибке когда оно пустое

#### **Функция TrackBy**
- ✅ Должна вернуть ID задачи для trackBy
- ✅ Должна помочь Angular эффективно отслеживать задачи

---

**Счастливого тестирования! 🧪✨**

Создано с ❤️ используя Angular 19, Jasmine и Karma

