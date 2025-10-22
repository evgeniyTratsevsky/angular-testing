# Testing Examples & Cheat Sheet

This document provides quick reference examples for common Angular testing scenarios using Jasmine, TestBed, and Karma.

## Table of Contents
- [Basic Test Structure](#basic-test-structure)
- [Service Testing](#service-testing)
- [Component Testing](#component-testing)
- [Async Testing](#async-testing)
- [Mocking & Spies](#mocking--spies)
- [DOM Testing](#dom-testing)
- [Form Testing](#form-testing)
- [Common Patterns](#common-patterns)

---

## Basic Test Structure

### Simple Test Suite
```typescript
describe('Component or Service Name', () => {
  // Runs once before all tests
  beforeAll(() => {
    console.log('Setup once');
  });

  // Runs before each test
  beforeEach(() => {
    console.log('Setup before each test');
  });

  // Runs after each test
  afterEach(() => {
    console.log('Cleanup after each test');
  });

  // Runs once after all tests
  afterAll(() => {
    console.log('Cleanup once');
  });

  it('should do something', () => {
    expect(true).toBe(true);
  });

  // Skip a test
  xit('should be skipped', () => {
    expect(false).toBe(true);
  });

  // Focus on a specific test (only this runs)
  fit('should run only this test', () => {
    expect(true).toBe(true);
  });
});
```

---

## Service Testing

### Basic Service Test
```typescript
import { TestBed } from '@angular/core/testing';
import { MyService } from './my.service';

describe('MyService', () => {
  let service: MyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MyService]
    });
    service = TestBed.inject(MyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return data', () => {
    const result = service.getData();
    expect(result).toEqual(['data1', 'data2']);
  });
});
```

### Service with Dependencies
```typescript
describe('ServiceWithDependencies', () => {
  let service: MyService;
  let mockDep: jasmine.SpyObj<DependencyService>;

  beforeEach(() => {
    mockDep = jasmine.createSpyObj('DependencyService', ['method1', 'method2']);
    
    TestBed.configureTestingModule({
      providers: [
        MyService,
        { provide: DependencyService, useValue: mockDep }
      ]
    });
    
    service = TestBed.inject(MyService);
  });

  it('should call dependency', () => {
    mockDep.method1.and.returnValue('mocked result');
    const result = service.doSomething();
    expect(mockDep.method1).toHaveBeenCalled();
    expect(result).toBe('mocked result');
  });
});
```

### Testing Observables
```typescript
import { of, throwError } from 'rxjs';

it('should handle observable success', (done) => {
  service.getData().subscribe(data => {
    expect(data).toBeDefined();
    expect(data.length).toBeGreaterThan(0);
    done();
  });
});

it('should handle observable error', (done) => {
  service.getDataWithError().subscribe({
    next: () => fail('should have failed'),
    error: (error) => {
      expect(error).toBeDefined();
      done();
    }
  });
});
```

---

## Component Testing

### Basic Component Setup
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyComponent } from './my.component';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent] // For standalone components
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### Component with Dependencies
```typescript
beforeEach(async () => {
  const mockService = jasmine.createSpyObj('DataService', ['getData']);
  mockService.getData.and.returnValue(of([{ id: 1, name: 'Test' }]));

  await TestBed.configureTestingModule({
    imports: [MyComponent, CommonModule],
    providers: [
      { provide: DataService, useValue: mockService }
    ]
  }).compileComponents();
});
```

---

## Async Testing

### Using done() Callback
```typescript
it('should complete async operation', (done) => {
  component.asyncMethod().subscribe(result => {
    expect(result).toBeTruthy();
    done();
  });
});
```

### Using fakeAsync and tick()
```typescript
import { fakeAsync, tick, flush } from '@angular/core/testing';

it('should handle timeout', fakeAsync(() => {
  let completed = false;
  
  setTimeout(() => {
    completed = true;
  }, 1000);

  expect(completed).toBe(false);
  tick(1000);
  expect(completed).toBe(true);
}));

it('should handle multiple ticks', fakeAsync(() => {
  component.startProcess();
  
  tick(100); // Advance 100ms
  expect(component.step).toBe(1);
  
  tick(200); // Advance 200ms more
  expect(component.step).toBe(2);
  
  flush(); // Complete all pending timers
}));
```

### Using async and whenStable
```typescript
import { waitForAsync } from '@angular/core/testing';

it('should work with async', waitForAsync(() => {
  fixture.whenStable().then(() => {
    fixture.detectChanges();
    expect(component.data).toBeDefined();
  });
}));
```

---

## Mocking & Spies

### Creating Spies
```typescript
// Spy on object method
const obj = { method: () => 'original' };
spyOn(obj, 'method').and.returnValue('mocked');

// Spy on component method
spyOn(component, 'save');
component.save();
expect(component.save).toHaveBeenCalled();

// Spy with arguments
spyOn(service, 'update');
component.updateItem(1, 'data');
expect(service.update).toHaveBeenCalledWith(1, 'data');
```

### Spy Return Values
```typescript
// Return a value
spy.and.returnValue(42);

// Return different values on successive calls
spy.and.returnValues(1, 2, 3);

// Call through to original
spy.and.callThrough();

// Call fake implementation
spy.and.callFake((arg) => arg * 2);

// Throw error
spy.and.throwError('Error message');

// Return observable
spy.and.returnValue(of({ data: 'value' }));

// Return promise
spy.and.returnValue(Promise.resolve('value'));
```

### Checking Spy Calls
```typescript
expect(spy).toHaveBeenCalled();
expect(spy).toHaveBeenCalledTimes(3);
expect(spy).toHaveBeenCalledWith('arg1', 'arg2');
expect(spy).not.toHaveBeenCalled();

// Get call information
const calls = spy.calls.all();
const firstCall = spy.calls.first();
const mostRecentCall = spy.calls.mostRecent();
const callCount = spy.calls.count();

// Check arguments
expect(spy.calls.argsFor(0)).toEqual(['arg1', 'arg2']);
```

---

## DOM Testing

### Querying Elements
```typescript
// By CSS selector
const element = compiled.querySelector('.my-class');
const elements = compiled.querySelectorAll('button');

// By test ID (recommended)
const button = compiled.querySelector('[data-testid="submit-button"]');

// Using DebugElement
import { By } from '@angular/platform-browser';
const button = fixture.debugElement.query(By.css('button'));
const buttons = fixture.debugElement.queryAll(By.css('button'));
```

### Testing Element Content
```typescript
it('should display title', () => {
  const title = compiled.querySelector('h1');
  expect(title?.textContent).toContain('My Title');
});

it('should render list items', () => {
  const items = compiled.querySelectorAll('li');
  expect(items.length).toBe(3);
  expect(items[0].textContent).toBe('Item 1');
});
```

### Testing Element Attributes
```typescript
it('should have correct attributes', () => {
  const input = compiled.querySelector('input');
  expect(input?.getAttribute('type')).toBe('text');
  expect(input?.getAttribute('placeholder')).toBe('Enter text');
  expect(input?.hasAttribute('disabled')).toBe(false);
});
```

### Testing CSS Classes
```typescript
it('should apply CSS classes', () => {
  const element = compiled.querySelector('.item');
  expect(element?.classList.contains('active')).toBe(true);
  expect(element?.classList.contains('disabled')).toBe(false);
});
```

### Simulating User Events
```typescript
// Click event
it('should handle click', () => {
  const button = compiled.querySelector('button') as HTMLButtonElement;
  button.click();
  fixture.detectChanges();
  expect(component.clicked).toBe(true);
});

// Input event
it('should handle input', () => {
  const input = compiled.querySelector('input') as HTMLInputElement;
  input.value = 'new value';
  input.dispatchEvent(new Event('input'));
  fixture.detectChanges();
  expect(component.inputValue).toBe('new value');
});

// Keyboard event
it('should handle Enter key', () => {
  const input = compiled.querySelector('input') as HTMLInputElement;
  const event = new KeyboardEvent('keyup', { key: 'Enter' });
  input.dispatchEvent(event);
  expect(component.submitted).toBe(true);
});

// Mouse events
const element = compiled.querySelector('.item');
element?.dispatchEvent(new MouseEvent('mouseenter'));
element?.dispatchEvent(new MouseEvent('mouseleave'));
```

---

## Form Testing

### Template-Driven Forms
```typescript
import { FormsModule } from '@angular/forms';

beforeEach(async () => {
  await TestBed.configureTestingModule({
    imports: [MyComponent, FormsModule]
  }).compileComponents();
});

it('should bind input to model', fakeAsync(() => {
  const input = compiled.querySelector('input') as HTMLInputElement;
  input.value = 'test value';
  input.dispatchEvent(new Event('input'));
  
  tick(); // Wait for ngModel update
  fixture.detectChanges();
  
  expect(component.model.name).toBe('test value');
}));
```

### Reactive Forms
```typescript
import { ReactiveFormsModule } from '@angular/forms';

it('should create form with default values', () => {
  expect(component.form.get('email')?.value).toBe('');
  expect(component.form.get('password')?.value).toBe('');
});

it('should validate required fields', () => {
  const email = component.form.get('email');
  expect(email?.valid).toBe(false);
  expect(email?.hasError('required')).toBe(true);
  
  email?.setValue('test@example.com');
  expect(email?.valid).toBe(true);
});

it('should validate email format', () => {
  const email = component.form.get('email');
  email?.setValue('invalid-email');
  expect(email?.hasError('email')).toBe(true);
  
  email?.setValue('valid@example.com');
  expect(email?.valid).toBe(true);
});

it('should disable submit when form invalid', () => {
  expect(component.form.valid).toBe(false);
  const button = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;
  expect(button.disabled).toBe(true);
});
```

---

## Common Patterns

### Testing @Input Properties
```typescript
it('should accept input', () => {
  component.title = 'Test Title';
  fixture.detectChanges();
  
  const element = compiled.querySelector('h1');
  expect(element?.textContent).toBe('Test Title');
});
```

### Testing @Output Events
```typescript
it('should emit output event', () => {
  spyOn(component.itemSelected, 'emit');
  
  component.selectItem({ id: 1, name: 'Item' });
  
  expect(component.itemSelected.emit).toHaveBeenCalledWith({ id: 1, name: 'Item' });
});

// Or listen to the event
it('should emit on button click', (done) => {
  component.itemSelected.subscribe(item => {
    expect(item.id).toBe(1);
    done();
  });
  
  const button = compiled.querySelector('button');
  button?.click();
});
```

### Testing Lifecycle Hooks
```typescript
it('should initialize data on ngOnInit', () => {
  spyOn(service, 'loadData').and.returnValue(of(['data']));
  
  component.ngOnInit();
  
  expect(service.loadData).toHaveBeenCalled();
  expect(component.data).toEqual(['data']);
});

it('should cleanup on ngOnDestroy', () => {
  spyOn(component.subscription, 'unsubscribe');
  
  component.ngOnDestroy();
  
  expect(component.subscription.unsubscribe).toHaveBeenCalled();
});
```

### Testing Conditional Rendering
```typescript
it('should show element when condition is true', () => {
  component.showElement = true;
  fixture.detectChanges();
  
  const element = compiled.querySelector('[data-testid="conditional"]');
  expect(element).toBeTruthy();
});

it('should hide element when condition is false', () => {
  component.showElement = false;
  fixture.detectChanges();
  
  const element = compiled.querySelector('[data-testid="conditional"]');
  expect(element).toBeFalsy();
});
```

### Testing *ngFor
```typescript
it('should render list items', () => {
  component.items = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' }
  ];
  fixture.detectChanges();
  
  const items = compiled.querySelectorAll('.item');
  expect(items.length).toBe(3);
  expect(items[0].textContent).toContain('Item 1');
  expect(items[1].textContent).toContain('Item 2');
  expect(items[2].textContent).toContain('Item 3');
});
```

### Testing Error Handling
```typescript
it('should display error message', () => {
  component.errorMessage = 'Something went wrong';
  fixture.detectChanges();
  
  const error = compiled.querySelector('[data-testid="error"]');
  expect(error).toBeTruthy();
  expect(error?.textContent).toBe('Something went wrong');
});

it('should handle service error', fakeAsync(() => {
  mockService.getData.and.returnValue(throwError(() => new Error('API Error')));
  
  component.loadData();
  tick();
  
  expect(component.error).toBe('API Error');
  expect(component.loading).toBe(false);
}));
```

---

## Jasmine Matchers Reference

```typescript
// Equality
expect(value).toBe(expected);              // ===
expect(value).toEqual(expected);           // deep equality
expect(value).not.toBe(expected);

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// Numbers
expect(value).toBeGreaterThan(10);
expect(value).toBeGreaterThanOrEqual(10);
expect(value).toBeLessThan(10);
expect(value).toBeLessThanOrEqual(10);
expect(value).toBeCloseTo(10.5, 1); // precision

// Strings
expect(string).toContain('substring');
expect(string).toMatch(/regex/);
expect(string).toMatch('pattern');

// Arrays
expect(array).toContain(item);
expect(array.length).toBe(3);

// Objects
expect(obj).toHaveProperty('key');
expect(obj.key).toBe('value');

// Errors
expect(() => fn()).toThrow();
expect(() => fn()).toThrowError('message');
expect(() => fn()).toThrowError(Error);

// Promises
await expectAsync(promise).toBeResolved();
await expectAsync(promise).toBeRejected();
await expectAsync(promise).toBeResolvedTo(value);
```

---

## Tips & Best Practices

1. **Use data-testid attributes** for reliable element selection
2. **Mock external dependencies** to isolate tests
3. **Test behavior, not implementation** details
4. **Use descriptive test names** that explain what is being tested
5. **Keep tests independent** - each test should work in isolation
6. **Test edge cases** and error scenarios
7. **Use beforeEach** for common setup
8. **Call fixture.detectChanges()** after making changes
9. **Use fakeAsync** for synchronous-looking async tests
10. **Group related tests** with nested describe blocks

---

Happy Testing! 🧪

