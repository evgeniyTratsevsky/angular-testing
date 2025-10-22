# Примеры тестирования и шпаргалка

Этот документ предоставляет быстрые примеры для частых сценариев тестирования Angular с использованием Jasmine, TestBed и Karma.

## Содержание
- [Базовая структура теста](#базовая-структура-теста)
- [Тестирование сервисов](#тестирование-сервисов)
- [Тестирование компонентов](#тестирование-компонентов)
- [Асинхронное тестирование](#асинхронное-тестирование)
- [Мокирование и шпионы](#мокирование-и-шпионы)
- [Тестирование DOM](#тестирование-dom)
- [Тестирование форм](#тестирование-форм)
- [Общие паттерны](#общие-паттерны)

---

## Базовая структура теста

### Простой набор тестов
```typescript
describe('Имя компонента или сервиса', () => {
  // Выполняется один раз перед всеми тестами
  beforeAll(() => {
    console.log('Настройка один раз');
  });

  // Выполняется перед каждым тестом
  beforeEach(() => {
    console.log('Настройка перед каждым тестом');
  });

  // Выполняется после каждого теста
  afterEach(() => {
    console.log('Очистка после каждого теста');
  });

  // Выполняется один раз после всех тестов
  afterAll(() => {
    console.log('Очистка один раз');
  });

  it('должен что-то делать', () => {
    expect(true).toBe(true);
  });

  // Пропустить тест
  xit('должен быть пропущен', () => {
    expect(false).toBe(true);
  });

  // Сфокусироваться на конкретном тесте (выполнится только он)
  fit('должен выполнить только этот тест', () => {
    expect(true).toBe(true);
  });
});
```

---

## Тестирование сервисов

### Базовый тест сервиса
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

  it('должен быть создан', () => {
    expect(service).toBeTruthy();
  });

  it('должен вернуть данные', () => {
    const result = service.getData();
    expect(result).toEqual(['данные1', 'данные2']);
  });
});
```

### Сервис с зависимостями
```typescript
describe('СервисСЗависимостями', () => {
  let service: MyService;
  let mockDep: jasmine.SpyObj<DependencyService>;

  beforeEach(() => {
    mockDep = jasmine.createSpyObj('DependencyService', ['метод1', 'метод2']);
    
    TestBed.configureTestingModule({
      providers: [
        MyService,
        { provide: DependencyService, useValue: mockDep }
      ]
    });
    
    service = TestBed.inject(MyService);
  });

  it('должен вызвать зависимость', () => {
    mockDep.метод1.and.returnValue('замоканный результат');
    const result = service.doSomething();
    expect(mockDep.метод1).toHaveBeenCalled();
    expect(result).toBe('замоканный результат');
  });
});
```

### Тестирование Observable
```typescript
import { of, throwError } from 'rxjs';

it('должен обработать успешный observable', (done) => {
  service.getData().subscribe(data => {
    expect(data).toBeDefined();
    expect(data.length).toBeGreaterThan(0);
    done();
  });
});

it('должен обработать ошибку observable', (done) => {
  service.getDataWithError().subscribe({
    next: () => fail('должен был упасть'),
    error: (error) => {
      expect(error).toBeDefined();
      done();
    }
  });
});
```

---

## Тестирование компонентов

### Базовая настройка компонента
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyComponent } from './my.component';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent] // Для standalone компонентов
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('должен создаться', () => {
    expect(component).toBeTruthy();
  });
});
```

### Компонент с зависимостями
```typescript
beforeEach(async () => {
  const mockService = jasmine.createSpyObj('DataService', ['getData']);
  mockService.getData.and.returnValue(of([{ id: 1, name: 'Тест' }]));

  await TestBed.configureTestingModule({
    imports: [MyComponent, CommonModule],
    providers: [
      { provide: DataService, useValue: mockService }
    ]
  }).compileComponents();
});
```

---

## Асинхронное тестирование

### Используя callback done()
```typescript
it('должен завершить асинхронную операцию', (done) => {
  component.asyncMethod().subscribe(result => {
    expect(result).toBeTruthy();
    done();
  });
});
```

### Используя fakeAsync и tick()
```typescript
import { fakeAsync, tick, flush } from '@angular/core/testing';

it('должен обработать timeout', fakeAsync(() => {
  let completed = false;
  
  setTimeout(() => {
    completed = true;
  }, 1000);

  expect(completed).toBe(false);
  tick(1000);
  expect(completed).toBe(true);
}));

it('должен обработать несколько тиков', fakeAsync(() => {
  component.startProcess();
  
  tick(100); // Продвинуться на 100мс
  expect(component.step).toBe(1);
  
  tick(200); // Продвинуться еще на 200мс
  expect(component.step).toBe(2);
  
  flush(); // Завершить все ожидающие таймеры
}));
```

### Используя async и whenStable
```typescript
import { waitForAsync } from '@angular/core/testing';

it('должен работать с async', waitForAsync(() => {
  fixture.whenStable().then(() => {
    fixture.detectChanges();
    expect(component.data).toBeDefined();
  });
}));
```

---

## Мокирование и шпионы

### Создание шпионов
```typescript
// Шпион на метод объекта
const obj = { method: () => 'оригинал' };
spyOn(obj, 'method').and.returnValue('замоканный');

// Шпион на метод компонента
spyOn(component, 'save');
component.save();
expect(component.save).toHaveBeenCalled();

// Шпион с аргументами
spyOn(service, 'update');
component.updateItem(1, 'данные');
expect(service.update).toHaveBeenCalledWith(1, 'данные');
```

### Возвращаемые значения шпиона
```typescript
// Вернуть значение
spy.and.returnValue(42);

// Вернуть разные значения при последовательных вызовах
spy.and.returnValues(1, 2, 3);

// Вызвать оригинальный метод
spy.and.callThrough();

// Вызвать фейковую реализацию
spy.and.callFake((arg) => arg * 2);

// Выбросить ошибку
spy.and.throwError('Сообщение об ошибке');

// Вернуть observable
spy.and.returnValue(of({ data: 'значение' }));

// Вернуть promise
spy.and.returnValue(Promise.resolve('значение'));
```

### Проверка вызовов шпиона
```typescript
expect(spy).toHaveBeenCalled();
expect(spy).toHaveBeenCalledTimes(3);
expect(spy).toHaveBeenCalledWith('арг1', 'арг2');
expect(spy).not.toHaveBeenCalled();

// Получить информацию о вызовах
const calls = spy.calls.all();
const firstCall = spy.calls.first();
const mostRecentCall = spy.calls.mostRecent();
const callCount = spy.calls.count();

// Проверить аргументы
expect(spy.calls.argsFor(0)).toEqual(['арг1', 'арг2']);
```

---

## Тестирование DOM

### Запрос элементов
```typescript
// По CSS селектору
const element = compiled.querySelector('.my-class');
const elements = compiled.querySelectorAll('button');

// По test ID (рекомендуется)
const button = compiled.querySelector('[data-testid="submit-button"]');

// Используя DebugElement
import { By } from '@angular/platform-browser';
const button = fixture.debugElement.query(By.css('button'));
const buttons = fixture.debugElement.queryAll(By.css('button'));
```

### Тестирование содержимого элемента
```typescript
it('должен отображать заголовок', () => {
  const title = compiled.querySelector('h1');
  expect(title?.textContent).toContain('Мой заголовок');
});

it('должен рендерить элементы списка', () => {
  const items = compiled.querySelectorAll('li');
  expect(items.length).toBe(3);
  expect(items[0].textContent).toBe('Элемент 1');
});
```

### Тестирование атрибутов элемента
```typescript
it('должен иметь правильные атрибуты', () => {
  const input = compiled.querySelector('input');
  expect(input?.getAttribute('type')).toBe('text');
  expect(input?.getAttribute('placeholder')).toBe('Введите текст');
  expect(input?.hasAttribute('disabled')).toBe(false);
});
```

### Тестирование CSS классов
```typescript
it('должен применить CSS классы', () => {
  const element = compiled.querySelector('.item');
  expect(element?.classList.contains('active')).toBe(true);
  expect(element?.classList.contains('disabled')).toBe(false);
});
```

### Симуляция событий пользователя
```typescript
// Событие клика
it('должен обработать клик', () => {
  const button = compiled.querySelector('button') as HTMLButtonElement;
  button.click();
  fixture.detectChanges();
  expect(component.clicked).toBe(true);
});

// Событие ввода
it('должен обработать ввод', () => {
  const input = compiled.querySelector('input') as HTMLInputElement;
  input.value = 'новое значение';
  input.dispatchEvent(new Event('input'));
  fixture.detectChanges();
  expect(component.inputValue).toBe('новое значение');
});

// Событие клавиатуры
it('должен обработать клавишу Enter', () => {
  const input = compiled.querySelector('input') as HTMLInputElement;
  const event = new KeyboardEvent('keyup', { key: 'Enter' });
  input.dispatchEvent(event);
  expect(component.submitted).toBe(true);
});

// События мыши
const element = compiled.querySelector('.item');
element?.dispatchEvent(new MouseEvent('mouseenter'));
element?.dispatchEvent(new MouseEvent('mouseleave'));
```

---

## Тестирование форм

### Формы на основе шаблонов
```typescript
import { FormsModule } from '@angular/forms';

beforeEach(async () => {
  await TestBed.configureTestingModule({
    imports: [MyComponent, FormsModule]
  }).compileComponents();
});

it('должен привязать input к модели', fakeAsync(() => {
  const input = compiled.querySelector('input') as HTMLInputElement;
  input.value = 'тестовое значение';
  input.dispatchEvent(new Event('input'));
  
  tick(); // Дождаться обновления ngModel
  fixture.detectChanges();
  
  expect(component.model.name).toBe('тестовое значение');
}));
```

### Реактивные формы
```typescript
import { ReactiveFormsModule } from '@angular/forms';

it('должен создать форму со значениями по умолчанию', () => {
  expect(component.form.get('email')?.value).toBe('');
  expect(component.form.get('password')?.value).toBe('');
});

it('должен валидировать обязательные поля', () => {
  const email = component.form.get('email');
  expect(email?.valid).toBe(false);
  expect(email?.hasError('required')).toBe(true);
  
  email?.setValue('test@example.com');
  expect(email?.valid).toBe(true);
});

it('должен валидировать формат email', () => {
  const email = component.form.get('email');
  email?.setValue('неправильный-email');
  expect(email?.hasError('email')).toBe(true);
  
  email?.setValue('правильный@example.com');
  expect(email?.valid).toBe(true);
});

it('должен отключить кнопку отправки когда форма невалидна', () => {
  expect(component.form.valid).toBe(false);
  const button = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;
  expect(button.disabled).toBe(true);
});
```

---

## Общие паттерны

### Тестирование свойств @Input
```typescript
it('должен принять входное значение', () => {
  component.title = 'Тестовый заголовок';
  fixture.detectChanges();
  
  const element = compiled.querySelector('h1');
  expect(element?.textContent).toBe('Тестовый заголовок');
});
```

### Тестирование событий @Output
```typescript
it('должен эмитить выходное событие', () => {
  spyOn(component.itemSelected, 'emit');
  
  component.selectItem({ id: 1, name: 'Элемент' });
  
  expect(component.itemSelected.emit).toHaveBeenCalledWith({ id: 1, name: 'Элемент' });
});

// Или слушать событие
it('должен эмитить при клике на кнопку', (done) => {
  component.itemSelected.subscribe(item => {
    expect(item.id).toBe(1);
    done();
  });
  
  const button = compiled.querySelector('button');
  button?.click();
});
```

### Тестирование хуков жизненного цикла
```typescript
it('должен инициализировать данные в ngOnInit', () => {
  spyOn(service, 'loadData').and.returnValue(of(['данные']));
  
  component.ngOnInit();
  
  expect(service.loadData).toHaveBeenCalled();
  expect(component.data).toEqual(['данные']);
});

it('должен очиститься в ngOnDestroy', () => {
  spyOn(component.subscription, 'unsubscribe');
  
  component.ngOnDestroy();
  
  expect(component.subscription.unsubscribe).toHaveBeenCalled();
});
```

### Тестирование условного рендеринга
```typescript
it('должен показать элемент когда условие истинно', () => {
  component.showElement = true;
  fixture.detectChanges();
  
  const element = compiled.querySelector('[data-testid="conditional"]');
  expect(element).toBeTruthy();
});

it('должен скрыть элемент когда условие ложно', () => {
  component.showElement = false;
  fixture.detectChanges();
  
  const element = compiled.querySelector('[data-testid="conditional"]');
  expect(element).toBeFalsy();
});
```

### Тестирование *ngFor
```typescript
it('должен рендерить элементы списка', () => {
  component.items = [
    { id: 1, name: 'Элемент 1' },
    { id: 2, name: 'Элемент 2' },
    { id: 3, name: 'Элемент 3' }
  ];
  fixture.detectChanges();
  
  const items = compiled.querySelectorAll('.item');
  expect(items.length).toBe(3);
  expect(items[0].textContent).toContain('Элемент 1');
  expect(items[1].textContent).toContain('Элемент 2');
  expect(items[2].textContent).toContain('Элемент 3');
});
```

### Тестирование обработки ошибок
```typescript
it('должен отобразить сообщение об ошибке', () => {
  component.errorMessage = 'Что-то пошло не так';
  fixture.detectChanges();
  
  const error = compiled.querySelector('[data-testid="error"]');
  expect(error).toBeTruthy();
  expect(error?.textContent).toBe('Что-то пошло не так');
});

it('должен обработать ошибку сервиса', fakeAsync(() => {
  mockService.getData.and.returnValue(throwError(() => new Error('Ошибка API')));
  
  component.loadData();
  tick();
  
  expect(component.error).toBe('Ошибка API');
  expect(component.loading).toBe(false);
}));
```

---

## Справочник матчеров Jasmine

```typescript
// Равенство
expect(value).toBe(expected);              // ===
expect(value).toEqual(expected);           // глубокое равенство
expect(value).not.toBe(expected);

// Истинность
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// Числа
expect(value).toBeGreaterThan(10);
expect(value).toBeGreaterThanOrEqual(10);
expect(value).toBeLessThan(10);
expect(value).toBeLessThanOrEqual(10);
expect(value).toBeCloseTo(10.5, 1); // точность

// Строки
expect(string).toContain('подстрока');
expect(string).toMatch(/regex/);
expect(string).toMatch('паттерн');

// Массивы
expect(array).toContain(item);
expect(array.length).toBe(3);

// Объекты
expect(obj).toHaveProperty('key');
expect(obj.key).toBe('value');

// Ошибки
expect(() => fn()).toThrow();
expect(() => fn()).toThrowError('сообщение');
expect(() => fn()).toThrowError(Error);

// Промисы
await expectAsync(promise).toBeResolved();
await expectAsync(promise).toBeRejected();
await expectAsync(promise).toBeResolvedTo(value);
```

---

## Советы и лучшие практики

1. **Используйте атрибуты data-testid** для надежного выбора элементов
2. **Мокируйте внешние зависимости** для изоляции тестов
3. **Тестируйте поведение, а не реализацию**
4. **Используйте описательные названия тестов** которые объясняют что тестируется
5. **Держите тесты независимыми** - каждый тест должен работать изолированно
6. **Тестируйте граничные случаи** и сценарии ошибок
7. **Используйте beforeEach** для общей настройки
8. **Вызывайте fixture.detectChanges()** после внесения изменений
9. **Используйте fakeAsync** для синхронно-выглядящих асинхронных тестов
10. **Группируйте связанные тесты** с вложенными блоками describe

---

Счастливого тестирования! 🧪

