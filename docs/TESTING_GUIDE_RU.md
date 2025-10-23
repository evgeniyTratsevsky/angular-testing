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

#### Базовое использование
```typescript
spyOn(object, 'method');                    // Создать шпиона на метод
spyOn(object, 'method').and.returnValue(5); // Замокировать возвращаемое значение
spyOn(object, 'method').and.callThrough(); // Вызвать оригинальный метод
expect(spy).toHaveBeenCalled();             // Проверить вызов
expect(spy).toHaveBeenCalledWith(arg);      // Проверить аргументы
```

#### Свойства spy для проверки вызовов

**spy.calls.args** - получить массив всех аргументов всех вызовов:
```typescript
it('должен отслеживать аргументы всех вызовов', () => {
  const service = jasmine.createSpyObj('DataService', ['saveData']);
  
  service.saveData('первый', 1);
  service.saveData('второй', 2);
  service.saveData('третий', 3);
  
  // Получить массив всех аргументов через calls.all()
  const allCalls = service.saveData.calls.all();
  const allArgs = allCalls.map(call => call.args);
  
  expect(allArgs).toEqual([
    ['первый', 1],
    ['второй', 2],
    ['третий', 3]
  ]);
  
  // Альтернатива: получить аргументы конкретного вызова (индекс с 0)
  expect(service.saveData.calls.argsFor(0)).toEqual(['первый', 1]);
  expect(service.saveData.calls.argsFor(1)).toEqual(['второй', 2]);
});
```

**spy.calls.object** - получить контекст (this) при вызове:
```typescript
it('должен отслеживать контекст вызова', () => {
  const myObject = {
    name: 'Test Object',
    method: function() { return this.name; }
  };
  
  spyOn(myObject, 'method');
  
  myObject.method();
  
  // Проверить, что метод был вызван в контексте myObject
  expect(myObject.method.calls.first().object).toBe(myObject);
  expect(myObject.method.calls.mostRecent().object).toBe(myObject);
});
```

**spy.calls.returnValue** - получить возвращаемое значение:
```typescript
it('должен отслеживать возвращаемые значения', () => {
  const calculator = {
    add: (a: number, b: number) => a + b
  };
  
  spyOn(calculator, 'add').and.callThrough();
  
  calculator.add(2, 3);
  calculator.add(5, 7);
  
  // Проверить возвращаемые значения
  expect(calculator.add.calls.first().returnValue).toBe(5);
  expect(calculator.add.calls.mostRecent().returnValue).toBe(12);
  expect(calculator.add.calls.all()[0].returnValue).toBe(5);
  expect(calculator.add.calls.all()[1].returnValue).toBe(12);
});
```

#### Стратегии spy

**and.stub()** - заглушка без действий (поведение по умолчанию):
```typescript
it('должен использовать заглушку без поведения', () => {
  const service = jasmine.createSpyObj('UserService', ['getUser']);
  
  // По умолчанию spy уже работает как stub
  // Но можно явно установить stub поведение
  service.getUser.and.stub();
  
  const result = service.getUser(1);
  
  // Метод был вызван, но ничего не вернул
  expect(service.getUser).toHaveBeenCalledWith(1);
  expect(result).toBeUndefined();
});

it('должен сбросить spy обратно к stub', () => {
  const service = jasmine.createSpyObj('NotificationService', ['notify']);
  
  // Сначала настроили возврат значения
  service.notify.and.returnValue(true);
  expect(service.notify('test')).toBe(true);
  
  // Затем сбросили обратно к stub
  service.notify.and.stub();
  expect(service.notify('test')).toBeUndefined();
});
```

**and.identity()** - вернуть первый аргумент как есть:
```typescript
it('должен вернуть первый аргумент с помощью identity', () => {
  const processor = jasmine.createSpyObj('DataProcessor', ['transform']);
  
  processor.transform.and.identity();
  
  const input = { id: 1, name: 'Test' };
  const result = processor.transform(input);
  
  // Метод вернул первый аргумент без изменений
  expect(result).toBe(input);
  expect(processor.transform).toHaveBeenCalledWith(input);
});

it('должен работать с примитивами', () => {
  const echo = jasmine.createSpy('echo').and.identity();
  
  expect(echo('hello')).toBe('hello');
  expect(echo(42)).toBe(42);
  expect(echo(true)).toBe(true);
  
  // Со множественными аргументами возвращается только первый
  expect(echo('first', 'second', 'third')).toBe('first');
});
```

#### Комплексный пример с несколькими вызовами
```typescript
it('должен отслеживать несколько вызовов с разными аргументами', () => {
  const apiService = jasmine.createSpyObj('ApiService', ['request']);
  
  // Настраиваем разные ответы
  apiService.request.and.returnValues(
    { status: 200, data: 'first' },
    { status: 201, data: 'second' },
    { status: 200, data: 'third' }
  );
  
  // Делаем вызовы
  const result1 = apiService.request('GET', '/users');
  const result2 = apiService.request('POST', '/users', { name: 'John' });
  const result3 = apiService.request('GET', '/posts');
  
  // Проверяем количество вызовов
  expect(apiService.request.calls.count()).toBe(3);
  
  // Проверяем аргументы каждого вызова через argsFor()
  expect(apiService.request.calls.argsFor(0)).toEqual(['GET', '/users']);
  expect(apiService.request.calls.argsFor(1)).toEqual(['POST', '/users', { name: 'John' }]);
  expect(apiService.request.calls.argsFor(2)).toEqual(['GET', '/posts']);
  
  // Или через all() и map()
  const allCalls = apiService.request.calls.all();
  const allArgs = allCalls.map(call => call.args);
  expect(allArgs).toEqual([
    ['GET', '/users'],
    ['POST', '/users', { name: 'John' }],
    ['GET', '/posts']
  ]);
  
  // Проверяем возвращаемые значения
  expect(result1).toEqual({ status: 200, data: 'first' });
  expect(result2).toEqual({ status: 201, data: 'second' });
  expect(result3).toEqual({ status: 200, data: 'third' });
  
  // Проверяем через calls.returnValue
  expect(allCalls[0].returnValue).toEqual({ status: 200, data: 'first' });
  expect(allCalls[1].returnValue).toEqual({ status: 201, data: 'second' });
});
```

#### Практический пример в Angular тесте
```typescript
describe('TodoComponent с детальной проверкой spy', () => {
  let component: TodoComponent;
  let todoService: jasmine.SpyObj<TodoService>;
  
  beforeEach(() => {
    todoService = jasmine.createSpyObj('TodoService', ['addTodo', 'getTodos']);
    component = new TodoComponent(todoService);
  });
  
  it('должен вызывать addTodo с правильными аргументами', () => {
    const mockTodo1 = { id: 1, title: 'Task 1', completed: false };
    const mockTodo2 = { id: 2, title: 'Task 2', completed: false };
    
    todoService.addTodo.and.returnValues(
      of(mockTodo1),
      of(mockTodo2)
    );
    
    // Добавляем две задачи
    component.addTodo('Task 1');
    component.addTodo('Task 2');
    
    // Проверяем, что метод был вызван 2 раза
    expect(todoService.addTodo.calls.count()).toBe(2);
    
    // Проверяем аргументы каждого вызова
    expect(todoService.addTodo.calls.argsFor(0)).toEqual(['Task 1']);
    expect(todoService.addTodo.calls.argsFor(1)).toEqual(['Task 2']);
    
    // Альтернативный способ через all()
    const allCalls = todoService.addTodo.calls.all();
    const allArgs = allCalls.map(call => call.args);
    expect(allArgs).toEqual([
      ['Task 1'],
      ['Task 2']
    ]);
    
    // Проверяем первый и последний вызов
    expect(todoService.addTodo.calls.first().args).toEqual(['Task 1']);
    expect(todoService.addTodo.calls.mostRecent().args).toEqual(['Task 2']);
  });
  
  it('должен использовать identity для pass-through функции', () => {
    const transformer = jasmine.createSpy('transform').and.identity();
    
    const data = { id: 1, value: 'test' };
    const result = transformer(data);
    
    expect(result).toBe(data);
    expect(transformer).toHaveBeenCalledOnceWith(data);
  });
});
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

