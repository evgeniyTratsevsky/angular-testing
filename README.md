# Angular Testing Demo Application

> 📚 **[Читать на русском / Read in Russian](./README_RU.md)**

A comprehensive demonstration of **Angular Testing** using **Jasmine**, **TestBed**, and **Karma** test runner.

![Angular Testing Pyramid](https://angular.dev/assets/images/guide/testing/testing-pyramid.svg)

## 🎯 Overview

This project showcases best practices for testing Angular applications with:
- ✅ **Unit Tests** - Testing services in isolation
- ✅ **Component Tests** - Testing components with TestBed
- ✅ **Integration Tests** - Testing component-service interactions
- ✅ **DOM Testing** - Testing user interactions and template rendering
- ✅ **Async Testing** - Testing observables and async operations

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📦 What's Included

### Application Features
- **Todo List App** with full CRUD operations
- Add, edit, delete, and toggle todo items
- Statistics dashboard (total, completed, pending)
- Clear completed todos
- Form validation and error handling
- Beautiful, modern UI

### Test Coverage (157 Tests Total) ⭐

#### 1. **Service Tests** (`todo.service.spec.ts`)
- ✅ 15 unit tests
- Tests all CRUD operations
- Observable behavior testing
- State management verification
- Edge case handling

#### 2. **TodoList Component Tests** (`todo-list.component.spec.ts`)
- ✅ 68 integration tests
- Component initialization
- Template rendering
- User interaction simulation
- DOM manipulation testing
- Async operations with `fakeAsync`
- Service mocking with Jasmine spies
- Error handling

#### 3. **TodoItem Component Tests** (`todo-item.component.spec.ts`) ⭐ NEW
- ✅ 41 component tests
- @Input property testing
- @Output event emission testing
- Conditional rendering (@if directives)
- CSS class application testing
- Parent-child component integration
- Edge cases and XSS protection
- ARIA attributes for accessibility

#### 4. **Pipe Tests** ⭐ NEW
- ✅ 48 pipe tests (TodoFilterPipe + DateAgoPipe)
- Pure function testing
- Edge cases and input formats
- Pluralization logic
- Data immutability

#### 5. **App Component Tests** (`app.component.spec.ts`)
- ✅ 3 app tests
- Basic app initialization
- Component integration

## 🧪 Testing Stack

| Tool | Purpose | Version |
|------|---------|---------|
| **Jasmine** | Testing framework (BDD) | ~5.6.0 |
| **Karma** | Test runner | ~6.4.0 |
| **TestBed** | Angular testing utility | Built-in |
| **Karma Coverage** | Code coverage reports | ~2.2.0 |

## 📂 Project Structure

```
src/app/
├── models/
│   └── todo.model.ts                      # TypeScript interfaces
├── services/
│   ├── todo.service.ts                    # Business logic service
│   └── todo.service.spec.ts               # Service unit tests ✅ (15 tests)
├── pipes/                                 # ⭐ NEW
│   ├── todo-filter.pipe.ts                # Filter pipe
│   ├── todo-filter.pipe.spec.ts           # Filter tests ✅ (18 tests)
│   ├── date-ago.pipe.ts                   # Date formatting pipe
│   └── date-ago.pipe.spec.ts              # Date tests ✅ (30 tests)
├── components/
│   ├── todo-list/
│   │   ├── todo-list.component.ts         # List component logic
│   │   ├── todo-list.component.html       # List template
│   │   ├── todo-list.component.less       # List styles
│   │   └── todo-list.component.spec.ts    # List tests ✅ (68 tests)
│   └── todo-item/                         # ⭐ NEW
│       ├── todo-item.component.ts         # Item component logic
│       ├── todo-item.component.html       # Item template
│       ├── todo-item.component.less       # Item styles
│       └── todo-item.component.spec.ts    # Item tests ✅ (41 tests)
├── app.component.ts                       # Root component
└── app.component.spec.ts                  # Root tests ✅ (3 tests)

docs/
├── testing-examples/                      # 📚 Testing guides
│   ├── INPUT_OUTPUT_TESTING.md            # @Input/@Output examples
│   ├── RENDERING_TESTS.md                 # Rendering test examples
│   ├── PIPE_TESTING.md                    # Pipe testing examples ⭐ NEW
│   └── README.md                          # Examples index
├── KARMA_GUIDE.md                         # Karma test runner guide
└── CHANGELOG.md                           # Change log
```

## 🎓 Testing Patterns Demonstrated

### 1. Unit Testing (Services)
```typescript
describe('TodoService', () => {
  let service: TodoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TodoService);
  });

  it('should add a new todo', (done) => {
    service.addTodo('Test Todo').subscribe(todo => {
      expect(todo.title).toBe('Test Todo');
      expect(todo.completed).toBe(false);
      done();
    });
  });
});
```

### 2. Component Testing with TestBed
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

### 3. DOM Testing
```typescript
it('should display todo items', () => {
  fixture.detectChanges();
  const todoElements = compiled.querySelectorAll('[data-testid^="todo-item-"]');
  expect(todoElements.length).toBe(3);
});
```

### 4. User Interaction Testing
```typescript
it('should call addTodo when button is clicked', () => {
  spyOn(component, 'addTodo');
  const button = compiled.querySelector('[data-testid="add-button"]');
  button.click();
  expect(component.addTodo).toHaveBeenCalled();
});
```

### 5. Async Testing
```typescript
it('should handle async operations', fakeAsync(() => {
  component.newTodoTitle = 'New Todo';
  component.addTodo();
  
  expect(component.isLoading).toBe(true);
  tick(100); // Simulate passage of time
  expect(component.isLoading).toBe(false);
}));
```

## 🔧 Available Scripts

```bash
# Development
npm start              # Start dev server (http://localhost:4200)
npm run build          # Build for production
npm run watch          # Build and watch for changes

# Testing
npm test               # Run tests in watch mode
npm run test:headless  # Run tests once (CI mode)
npm run test:coverage  # Generate coverage report

# View coverage report
# Open: coverage/angular-testing/index.html
```

## 📊 Test Coverage

Current test coverage:

```
Statements   : 95%+
Branches     : 90%+
Functions    : 95%+
Lines        : 95%+
```

Coverage reports are generated in the `coverage/` directory after running:
```bash
npm run test:coverage
```

## 🎯 Key Testing Concepts

### Jasmine Matchers
```typescript
expect(value).toBe(expected);              // Strict equality
expect(value).toEqual(expected);           // Deep equality
expect(value).toBeTruthy();                // Truthy check
expect(value).toContain(item);             // Contains check
expect(fn).toHaveBeenCalled();             // Spy verification
expect(fn).toHaveBeenCalledWith(args);     // Spy with args
```

### TestBed API
```typescript
TestBed.configureTestingModule({ ... });   // Configure test module
TestBed.createComponent(Component);         // Create component
TestBed.inject(Service);                    // Inject service
fixture.detectChanges();                    // Trigger change detection
```

### Async Testing Utilities
```typescript
// Method 1: done callback
it('async test', (done) => {
  observable.subscribe(() => {
    expect(true).toBe(true);
    done();
  });
});

// Method 2: fakeAsync + tick
it('async test', fakeAsync(() => {
  asyncOperation();
  tick(100);
  expect(result).toBeDefined();
}));

// Method 3: async + whenStable
it('async test', async () => {
  await asyncOperation();
  fixture.whenStable().then(() => {
    expect(result).toBeDefined();
  });
});
```

## 🏗️ Testing Best Practices

1. ✅ **AAA Pattern**: Arrange, Act, Assert
2. ✅ **Isolation**: Mock external dependencies
3. ✅ **Independence**: Each test should run independently
4. ✅ **Descriptive Names**: Clear test descriptions
5. ✅ **Single Responsibility**: One assertion per test (when possible)
6. ✅ **Fast Execution**: Tests should run quickly
7. ✅ **Stable Selectors**: Use `data-testid` attributes
8. ✅ **Edge Cases**: Test error scenarios and boundaries

## 📚 Learning Resources

- **Documentation**: 
  - [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Detailed testing guide (English)
  - [TESTING_GUIDE_RU.md](./TESTING_GUIDE_RU.md) - Подробное руководство (Русский)
  - [EXAMPLES.md](./EXAMPLES.md) - Quick examples and cheat sheet (English)
  - [EXAMPLES_RU.md](./EXAMPLES_RU.md) - Примеры и шпаргалка (Русский)
- **Практические примеры тестирования** (в папке `docs/testing-examples/`):
  - [INPUT_OUTPUT_TESTING.md](./docs/testing-examples/INPUT_OUTPUT_TESTING.md) - Тестирование @Input и @Output
  - [RENDERING_TESTS.md](./docs/testing-examples/RENDERING_TESTS.md) - Проверка рендеринга элементов
  - [README.md](./docs/testing-examples/README.md) - Обзор всех примеров
- **Angular Testing**: https://angular.dev/guide/testing
- **Jasmine Docs**: https://jasmine.github.io/
- **Karma Docs**: https://karma-runner.github.io/

## 🎨 Application Screenshots

The application includes:
- Modern, gradient UI design
- Responsive layout
- Real-time statistics
- Inline editing
- Form validation with error messages
- Beautiful animations and transitions

## 🐛 Troubleshooting

### Tests not running?
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Karma disconnected?
```bash
# Use headless Chrome
ng test --browsers=ChromeHeadless
```

### Coverage not generating?
```bash
# Explicitly enable coverage
ng test --code-coverage --watch=false
```

## 🤝 Contributing

This is a demo project for learning purposes. Feel free to:
- Add more tests
- Improve test coverage
- Add new features with tests
- Refactor code following TDD

## 📝 License

MIT License - feel free to use this project for learning!

## 🎓 What You'll Learn

By exploring this project, you'll learn:
- ✅ How to set up Angular testing with Jasmine and Karma
- ✅ How to write unit tests for services
- ✅ How to write component tests with TestBed
- ✅ How to mock dependencies with Jasmine spies
- ✅ How to test async operations (Observables)
- ✅ How to test user interactions and DOM
- ✅ How to test forms and validation
- ✅ How to generate and interpret coverage reports
- ✅ Best practices for organizing tests
- ✅ Common testing patterns and techniques

---

**Happy Testing! 🧪✨**

Built with ❤️ using Angular 19, Jasmine, and Karma
