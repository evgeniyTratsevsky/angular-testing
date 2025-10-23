# Демо-приложение для тестирования Angular

Комплексная демонстрация **тестирования Angular** с использованием **Jasmine**, **TestBed** и **Karma**.

![Angular Testing Pyramid](https://angular.dev/assets/images/guide/testing/testing-pyramid.svg)

## 🎯 Обзор

Этот проект демонстрирует лучшие практики тестирования Angular приложений:
- ✅ **Юнит-тесты** - Тестирование сервисов в изоляции
- ✅ **Тесты компонентов** - Тестирование компонентов с TestBed
- ✅ **Интеграционные тесты** - Тестирование взаимодействия компонент-сервис
- ✅ **Тестирование DOM** - Тестирование пользовательских взаимодействий и шаблонов
- ✅ **Асинхронное тестирование** - Тестирование observable и асинхронных операций

## 🚀 Быстрый старт

### Требования
- Node.js (v18 или выше)
- npm или yarn

### Установка

```bash
# Установить зависимости
npm install

# Запустить сервер разработки
npm start

# Запустить тесты
npm test

# Запустить тесты с покрытием
npm run test:coverage
```

## 📦 Что включено

### Возможности приложения
- **Приложение Todo List** с полным CRUD функционалом
- Добавление, редактирование, удаление и переключение задач
- Панель статистики (всего, выполнено, ожидает)
- Очистка выполненных задач
- Валидация форм и обработка ошибок
- Красивый, современный UI

### Покрытие тестами

#### 1. **Тесты сервисов** (`todo.service.spec.ts`)
- ✅ 45+ юнит-тестов
- Тесты всех CRUD операций
- Тестирование поведения Observable
- Проверка управления состоянием
- Обработка граничных случаев

#### 2. **Тесты компонентов** (`todo-list.component.spec.ts`)
- ✅ 30+ интеграционных тестов
- Инициализация компонента
- Рендеринг шаблона
- Симуляция взаимодействия пользователя
- Тестирование манипуляций с DOM
- Асинхронные операции с `fakeAsync`
- Мокирование сервисов с Jasmine шпионами
- Обработка ошибок

#### 3. **Тесты корневого компонента** (`app.component.spec.ts`)
- Базовая инициализация приложения
- Интеграция компонентов

## 🧪 Стек тестирования

| Инструмент | Назначение | Версия |
|------|---------|---------|
| **Jasmine** | Фреймворк тестирования (BDD) | ~5.6.0 |
| **Karma** | Test runner | ~6.4.0 |
| **TestBed** | Утилита тестирования Angular | Встроена |
| **Karma Coverage** | Отчеты о покрытии кода | ~2.2.0 |

## 📂 Структура проекта

```
src/app/
├── models/
│   └── todo.model.ts                 # TypeScript интерфейсы
├── services/
│   ├── todo.service.ts               # Сервис бизнес-логики
│   └── todo.service.spec.ts          # Юнит-тесты сервиса ✅
├── components/
│   └── todo-list/
│       ├── todo-list.component.ts         # Логика компонента
│       ├── todo-list.component.html       # Шаблон
│       ├── todo-list.component.less       # Стили
│       └── todo-list.component.spec.ts    # Тесты компонента ✅
├── app.component.ts                  # Корневой компонент
└── app.component.spec.ts             # Тесты корневого компонента ✅
```

## 🎓 Демонстрируемые паттерны тестирования

### 1. Юнит-тестирование (Сервисы)
```typescript
describe('TodoService', () => {
  let service: TodoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TodoService);
  });

  it('должен добавить новую задачу', (done) => {
    service.addTodo('Тестовая задача').subscribe(todo => {
      expect(todo.title).toBe('Тестовая задача');
      expect(todo.completed).toBe(false);
      done();
    });
  });
});
```

### 2. Тестирование компонентов с TestBed
```typescript
describe('TodoListComponent', () => {
  let component: TodoListComponent;
  let fixture: ComponentFixture<TodoListComponent>;
  let mockService: jasmine.SpyObj<TodoService>;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('TodoService', ['getTodos']);
    mockService.getTodos.and.returnValue(of(mockTodos));
    
    await TestBed.configureTestingModule({
      imports: [TodoListComponent],
      providers: [
        { provide: TodoService, useValue: mockService }
      ]
    }).compileComponents();
  });
});
```

### 3. Тестирование DOM
```typescript
it('должен отображать элементы задач', () => {
  fixture.detectChanges();
  const todoElements = compiled.querySelectorAll('[data-testid^="todo-item-"]');
  expect(todoElements.length).toBe(3);
});
```

### 4. Тестирование взаимодействия пользователя
```typescript
it('должен вызвать addTodo при клике на кнопку', () => {
  spyOn(component, 'addTodo');
  const button = compiled.querySelector('[data-testid="add-button"]');
  button.click();
  expect(component.addTodo).toHaveBeenCalled();
});
```

### 5. Асинхронное тестирование
```typescript
it('должен обработать асинхронные операции', fakeAsync(() => {
  component.newTodoTitle = 'Новая задача';
  component.addTodo();
  
  expect(component.isLoading).toBe(true);
  tick(100); // Симулируем прохождение времени
  expect(component.isLoading).toBe(false);
}));
```

## 🔧 Доступные скрипты

```bash
# Разработка
npm start              # Запустить dev сервер (http://localhost:4200)
npm run build          # Сборка для production
npm run watch          # Сборка с отслеживанием изменений

# Тестирование
npm test               # Запустить тесты в режиме наблюдения
npm run test:headless  # Запустить тесты один раз (CI режим)
npm run test:coverage  # Создать отчет о покрытии

# Просмотр покрытия
# Откройте: coverage/angular-testing/index.html
```

## 📊 Покрытие тестами

Текущее покрытие кода:

```
Инструкции   : 95%+
Ветвления    : 90%+
Функции      : 95%+
Строки       : 95%+
```

Отчеты о покрытии генерируются в директории `coverage/` после запуска:
```bash
npm run test:coverage
```

## 🎯 Ключевые концепции тестирования

### Матчеры Jasmine
```typescript
expect(value).toBe(expected);              // Строгое равенство
expect(value).toEqual(expected);           // Глубокое равенство
expect(value).toBeTruthy();                // Проверка истинности
expect(value).toContain(item);             // Проверка содержания
expect(fn).toHaveBeenCalled();             // Проверка вызова шпиона
expect(fn).toHaveBeenCalledWith(args);     // Проверка аргументов шпиона
```

### API TestBed
```typescript
TestBed.configureTestingModule({ ... });   // Настройка тестового модуля
TestBed.createComponent(Component);         // Создание компонента
TestBed.inject(Service);                    // Внедрение сервиса
fixture.detectChanges();                    // Запуск обнаружения изменений
```

### Утилиты асинхронного тестирования
```typescript
// Метод 1: callback done
it('асинхронный тест', (done) => {
  observable.subscribe(() => {
    expect(true).toBe(true);
    done();
  });
});

// Метод 2: fakeAsync + tick
it('асинхронный тест', fakeAsync(() => {
  asyncOperation();
  tick(100);
  expect(result).toBeDefined();
}));

// Метод 3: async + whenStable
it('асинхронный тест', async () => {
  await asyncOperation();
  fixture.whenStable().then(() => {
    expect(result).toBeDefined();
  });
});
```

## 🏗️ Лучшие практики тестирования

1. ✅ **Паттерн AAA**: Arrange, Act, Assert (Подготовка, Действие, Проверка)
2. ✅ **Изоляция**: Мокируйте внешние зависимости
3. ✅ **Независимость**: Каждый тест должен выполняться независимо
4. ✅ **Описательные названия**: Четкие описания тестов
5. ✅ **Единая ответственность**: Одна проверка на тест (когда возможно)
6. ✅ **Быстрое выполнение**: Тесты должны выполняться быстро
7. ✅ **Стабильные селекторы**: Используйте атрибуты `data-testid`
8. ✅ **Граничные случаи**: Тестируйте сценарии ошибок и границы

## 📚 Ресурсы для обучения

- **Документация**: 
  - [TESTING_GUIDE_RU.md](./TESTING_GUIDE_RU.md) - Подробное руководство
  - [EXAMPLES_RU.md](./EXAMPLES_RU.md) - Примеры и шпаргалка
  - [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Detailed guide (English)
  - [EXAMPLES.md](./EXAMPLES.md) - Examples (English)
- **Angular тестирование**: https://angular.dev/guide/testing
- **Jasmine документация**: https://jasmine.github.io/
- **Karma документация**: https://karma-runner.github.io/

## 🎨 Особенности приложения

Приложение включает:
- Современный, градиентный дизайн UI
- Адаптивная верстка
- Статистика в реальном времени
- Встроенное редактирование
- Валидация форм с сообщениями об ошибках
- Красивые анимации и переходы

## 🐛 Устранение неполадок

### Тесты не запускаются?
```bash
# Очистить кэш и переустановить
rm -rf node_modules package-lock.json
npm install
```

### Karma отключается?
```bash
# Использовать headless Chrome
ng test --browsers=ChromeHeadless
```

### Покрытие не генерируется?
```bash
# Явно включить покрытие
ng test --code-coverage --watch=false
```

## 🤝 Вклад

Это демо-проект для обучения. Не стесняйтесь:
- Добавлять больше тестов
- Улучшать покрытие тестами
- Добавлять новые функции с тестами
- Рефакторить код следуя TDD

## 📝 Лицензия

MIT License - используйте этот проект для обучения!

## 🎓 Чему вы научитесь

Изучая этот проект, вы узнаете:
- ✅ Как настроить тестирование Angular с Jasmine и Karma
- ✅ Как писать юнит-тесты для сервисов
- ✅ Как писать тесты компонентов с TestBed
- ✅ Как мокировать зависимости с Jasmine шпионами
- ✅ Как тестировать асинхронные операции (Observables)
- ✅ Как тестировать взаимодействие пользователя и DOM
- ✅ Как тестировать формы и валидацию
- ✅ Как генерировать и интерпретировать отчеты о покрытии
- ✅ Лучшие практики организации тестов
- ✅ Распространенные паттерны и техники тестирования

## 💡 Комментарии в коде

Все тестовые файлы содержат подробные комментарии на русском языке:
- **todo.service.spec.ts** - Комментарии для юнит-тестов сервиса
- **todo-list.component.spec.ts** - Комментарии для тестов компонента
- **app.component.spec.ts** - Комментарии для тестов корневого компонента

Каждый тест включает объяснения:
- Что тестируется
- Почему это важно
- Как работает тест
- Какие паттерны используются

---

**Счастливого тестирования! 🧪✨**

Создано с ❤️ используя Angular 19, Jasmine и Karma

