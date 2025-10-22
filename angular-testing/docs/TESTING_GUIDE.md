# Angular Testing Guide - Jasmine, TestBed & Karma

This project demonstrates comprehensive Angular testing using **Jasmine**, **TestBed**, and **Karma**.

## 🎯 Testing Stack

- **Jasmine**: BDD testing framework for writing test suites
- **Karma**: Test runner that executes tests in real browsers
- **TestBed**: Angular testing utility for creating component testing modules
- **Angular Testing Library**: Built-in utilities like `ComponentFixture`

## 📦 Project Structure

```
src/app/
├── models/
│   └── todo.model.ts              # TypeScript interfaces
├── services/
│   ├── todo.service.ts            # Service with business logic
│   └── todo.service.spec.ts       # Service unit tests
├── components/
│   └── todo-list/
│       ├── todo-list.component.ts        # Component logic
│       ├── todo-list.component.html      # Template
│       ├── todo-list.component.less      # Styles
│       └── todo-list.component.spec.ts   # Component tests
└── app.component.ts               # Root component
```

## 🧪 Test Types Demonstrated

### 1. **Unit Tests (Service)**
Located in: `todo.service.spec.ts`

Tests pure business logic without dependencies:
- Method return values
- State management
- Observable behavior
- Edge cases and error handling

**Key Patterns:**
```typescript
describe('TodoService', () => {
  let service: TodoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TodoService);
  });

  it('should add a new todo', (done) => {
    service.addTodo('Test').subscribe(todo => {
      expect(todo.title).toBe('Test');
      done();
    });
  });
});
```

### 2. **Component Tests**
Located in: `todo-list.component.spec.ts`

Tests component behavior with TestBed:
- Component initialization
- Template rendering
- User interactions (clicks, input)
- Integration with mocked services
- DOM manipulation
- Async operations with `fakeAsync` and `tick`

**Key Patterns:**
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

## 🔧 Running Tests

### Run All Tests
```bash
npm test
```
or
```bash
ng test
```

### Run Tests Once (CI Mode)
```bash
ng test --watch=false --browsers=ChromeHeadless
```

### Run Tests with Code Coverage
```bash
ng test --code-coverage
```

Coverage reports will be generated in `coverage/` directory.

### Run Specific Test File
```bash
ng test --include='**/todo.service.spec.ts'
```

## 📊 Testing Patterns & Best Practices

### 1. **Arrange-Act-Assert (AAA) Pattern**
```typescript
it('should toggle todo status', () => {
  // Arrange
  const todoId = 1;
  const initialState = service.getTodoById(todoId);
  
  // Act
  service.toggleTodo(todoId);
  
  // Assert
  const updatedState = service.getTodoById(todoId);
  expect(updatedState.completed).toBe(!initialState.completed);
});
```

### 2. **Mocking Dependencies**
```typescript
const mockService = jasmine.createSpyObj('TodoService', ['addTodo']);
mockService.addTodo.and.returnValue(of(mockTodo));
```

### 3. **Testing Async Operations**
```typescript
// Using done callback
it('should handle async', (done) => {
  service.getData().subscribe(data => {
    expect(data).toBeTruthy();
    done();
  });
});

// Using fakeAsync
it('should handle async with fakeAsync', fakeAsync(() => {
  service.addTodo('Test').subscribe();
  tick(100); // Simulate passage of time
  expect(component.isLoading).toBe(false);
}));
```

### 4. **Testing DOM Interactions**
```typescript
it('should call addTodo when button is clicked', () => {
  spyOn(component, 'addTodo');
  const button = fixture.nativeElement.querySelector('[data-testid="add-button"]');
  button.click();
  expect(component.addTodo).toHaveBeenCalled();
});
```

### 5. **Testing Forms and Input**
```typescript
it('should update model when input changes', () => {
  const input = fixture.nativeElement.querySelector('[data-testid="todo-input"]');
  input.value = 'New Todo';
  input.dispatchEvent(new Event('input'));
  fixture.detectChanges();
  expect(component.newTodoTitle).toBe('New Todo');
});
```

## 🎓 Key Jasmine Features Used

### Matchers
```typescript
expect(value).toBe(expected);           // Strict equality (===)
expect(value).toEqual(expected);        // Deep equality
expect(value).toBeTruthy();             // Truthy check
expect(value).toBeFalsy();              // Falsy check
expect(value).toBeUndefined();          // Undefined check
expect(value).toContain(item);          // Array/string contains
expect(array.length).toBeGreaterThan(0); // Comparison
```

### Spies
```typescript
spyOn(object, 'method');                    // Spy on method
spyOn(object, 'method').and.returnValue(5); // Mock return value
spyOn(object, 'method').and.callThrough(); // Call original
expect(spy).toHaveBeenCalled();             // Verify called
expect(spy).toHaveBeenCalledWith(arg);      // Verify arguments
```

### Lifecycle Hooks
```typescript
beforeEach(() => {});  // Run before each test
afterEach(() => {});   // Run after each test
beforeAll(() => {});   // Run once before all tests
afterAll(() => {});    // Run once after all tests
```

## 🏗️ TestBed API

### Configuration
```typescript
TestBed.configureTestingModule({
  imports: [ComponentToTest],
  providers: [ServiceProvider],
  declarations: [] // For older Angular versions
});
```

### Creating Components
```typescript
const fixture = TestBed.createComponent(MyComponent);
const component = fixture.componentInstance;
const compiled = fixture.nativeElement;
fixture.detectChanges(); // Trigger change detection
```

### Injecting Services
```typescript
const service = TestBed.inject(MyService);
```

## 📝 Test Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## 🚀 Advanced Testing Techniques

### 1. **Testing Observables with Marble Testing**
```typescript
// For complex observable streams
import { TestScheduler } from 'rxjs/testing';
```

### 2. **Testing HTTP Requests**
```typescript
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
```

### 3. **Testing Router Navigation**
```typescript
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
```

## 🐛 Common Testing Issues & Solutions

### Issue: Tests timing out
**Solution**: Use `done()` callback or `fakeAsync` with `tick()`

### Issue: Change detection not working
**Solution**: Call `fixture.detectChanges()` after changes

### Issue: "Can't resolve all parameters"
**Solution**: Ensure all dependencies are provided in TestBed

### Issue: Async test finishing before observable completes
**Solution**: Use `done()` callback in subscribe

## 📚 Additional Resources

- [Angular Testing Guide](https://angular.dev/guide/testing)
- [Jasmine Documentation](https://jasmine.github.io/)
- [Karma Documentation](https://karma-runner.github.io/)
- [Angular TestBed API](https://angular.dev/api/core/testing/TestBed)

## 🎯 Testing Pyramid in This Project

```
     /\
    /  \  E2E Tests (not included, would use Cypress/Playwright)
   /----\
  / Inte \  Integration Tests (Component + Service)
 /--------\
/  Unit    \  Unit Tests (Service logic)
/___________\
```

This project focuses on **Unit Tests** and **Integration Tests** (Component testing).

## 💡 Tips for Writing Good Tests

1. ✅ Test behavior, not implementation
2. ✅ Use descriptive test names
3. ✅ Keep tests isolated and independent
4. ✅ Mock external dependencies
5. ✅ Test edge cases and error scenarios
6. ✅ Use `data-testid` attributes for stable selectors
7. ✅ Aim for fast test execution
8. ✅ Write tests alongside code (TDD when possible)

---

Happy Testing! 🧪✨

