# Проверка рендеринга в Angular тестах

## Содержание

1. [Базовые концепции](#базовые-концепции)
2. [Проверка наличия элементов](#проверка-наличия-элементов)
3. [Проверка содержимого](#проверка-содержимого)
4. [Проверка атрибутов](#проверка-атрибутов)
5. [Условный рендеринг](#условный-рендеринг)
6. [Списки и циклы](#списки-и-циклы)
7. [Продвинутые техники](#продвинутые-техники)

---

## Базовые концепции

### Что такое рендеринг в контексте тестирования?

Рендеринг - это процесс преобразования шаблона Angular в реальный DOM. В тестах мы проверяем:
- ✅ Правильное отображение данных
- ✅ Наличие/отсутствие элементов
- ✅ Корректные атрибуты и классы
- ✅ Реакцию на изменение данных

### Основные инструменты

```typescript
describe('Rendering Tests', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement; // DOM элемент
  });
});
```

**Ключевые объекты:**
- `fixture` - обертка компонента для тестирования
- `component` - экземпляр компонента
- `compiled` - корневой DOM элемент
- `fixture.detectChanges()` - запускает обнаружение изменений

---

## Проверка наличия элементов

### 1. Базовая проверка наличия элемента

```typescript
it('должен отображать заголовок', () => {
  component.title = 'Hello World';
  fixture.detectChanges();
  
  const heading = compiled.querySelector('h1');
  expect(heading).toBeTruthy(); // Элемент существует
});
```

### 2. Проверка отсутствия элемента

```typescript
it('не должен отображать сообщение об ошибке по умолчанию', () => {
  fixture.detectChanges();
  
  const errorMsg = compiled.querySelector('.error-message');
  expect(errorMsg).toBeFalsy(); // Элемент отсутствует
  // или
  expect(errorMsg).toBeNull();
});
```

### 3. Использование data-testid для надежных селекторов

```typescript
// Шаблон
<button data-testid="submit-btn">Отправить</button>

// Тест
it('должен отображать кнопку отправки', () => {
  fixture.detectChanges();
  
  const button = compiled.querySelector('[data-testid="submit-btn"]');
  expect(button).toBeTruthy();
});
```

**Преимущества data-testid:**
- ✅ Не зависит от CSS классов
- ✅ Не зависит от структуры DOM
- ✅ Явно указывает на тестируемые элементы

### 4. Проверка количества элементов

```typescript
it('должен отображать 3 элемента списка', () => {
  component.items = ['Item 1', 'Item 2', 'Item 3'];
  fixture.detectChanges();
  
  const listItems = compiled.querySelectorAll('li');
  expect(listItems.length).toBe(3);
});
```

---

## Проверка содержимого

### 1. Проверка текстового содержимого

```typescript
it('должен отображать текст заголовка', () => {
  component.title = 'Мой заголовок';
  fixture.detectChanges();
  
  const heading = compiled.querySelector('h1');
  expect(heading?.textContent).toBe('Мой заголовок');
  // или
  expect(heading?.textContent).toContain('заголовок');
});
```

**Важно:** Используйте `trim()` для удаления пробелов:

```typescript
expect(heading?.textContent?.trim()).toBe('Мой заголовок');
```

### 2. Проверка интерполяции

```typescript
// Шаблон
<p>Привет, {{ userName }}!</p>

// Тест
it('должен отображать имя пользователя', () => {
  component.userName = 'Иван';
  fixture.detectChanges();
  
  const paragraph = compiled.querySelector('p');
  expect(paragraph?.textContent).toBe('Привет, Иван!');
});
```

### 3. Проверка форматированных данных

```typescript
// Компонент
get formattedDate(): string {
  return this.date.toLocaleDateString('ru-RU');
}

// Тест
it('должен отображать форматированную дату', () => {
  component.date = new Date('2024-01-15');
  fixture.detectChanges();
  
  const dateElement = compiled.querySelector('[data-testid="date"]');
  expect(dateElement?.textContent).toContain('2024');
});
```

### 4. Проверка innerHTML vs textContent

```typescript
// textContent - получает только текст (безопасно)
const text = element?.textContent; // "Hello World"

// innerHTML - получает HTML разметку (осторожно!)
const html = element?.innerHTML; // "<strong>Hello</strong> World"
```

---

## Проверка атрибутов

### 1. Базовые атрибуты

```typescript
it('должен установить атрибут src изображения', () => {
  component.imageUrl = 'https://example.com/image.jpg';
  fixture.detectChanges();
  
  const img = compiled.querySelector('img');
  expect(img?.getAttribute('src')).toBe('https://example.com/image.jpg');
  // или
  expect(img?.src).toContain('example.com');
});
```

### 2. Динамические атрибуты через [attr.]

```typescript
// Шаблон
<div [attr.data-id]="userId" [attr.aria-label]="ariaLabel"></div>

// Тест
it('должен установить динамические атрибуты', () => {
  component.userId = '123';
  component.ariaLabel = 'User profile';
  fixture.detectChanges();
  
  const div = compiled.querySelector('div');
  expect(div?.getAttribute('data-id')).toBe('123');
  expect(div?.getAttribute('aria-label')).toBe('User profile');
});
```

### 3. ARIA атрибуты для доступности

```typescript
it('должен добавить ARIA атрибуты', () => {
  component.isExpanded = true;
  fixture.detectChanges();
  
  const button = compiled.querySelector('[data-testid="expand-btn"]');
  expect(button?.getAttribute('aria-expanded')).toBe('true');
  expect(button?.getAttribute('aria-label')).toBeTruthy();
});
```

### 4. Свойства элементов формы

```typescript
it('должен установить состояние checkbox', () => {
  component.isChecked = true;
  fixture.detectChanges();
  
  const checkbox = compiled.querySelector('input[type="checkbox"]') as HTMLInputElement;
  expect(checkbox.checked).toBe(true);
});

it('должен установить значение input', () => {
  component.inputValue = 'Test value';
  fixture.detectChanges();
  
  const input = compiled.querySelector('input') as HTMLInputElement;
  expect(input.value).toBe('Test value');
});

it('должен отключить кнопку', () => {
  component.isDisabled = true;
  fixture.detectChanges();
  
  const button = compiled.querySelector('button') as HTMLButtonElement;
  expect(button.disabled).toBe(true);
});
```

---

## Условный рендеринг

### 1. Директива @if (Angular 17+)

```typescript
// Шаблон
@if (isLoggedIn) {
  <div data-testid="user-menu">Меню пользователя</div>
} @else {
  <div data-testid="login-btn">Войти</div>
}

// Тесты
describe('Условный рендеринг', () => {
  it('должен показать меню для авторизованных', () => {
    component.isLoggedIn = true;
    fixture.detectChanges();
    
    expect(compiled.querySelector('[data-testid="user-menu"]')).toBeTruthy();
    expect(compiled.querySelector('[data-testid="login-btn"]')).toBeFalsy();
  });
  
  it('должен показать кнопку входа для неавторизованных', () => {
    component.isLoggedIn = false;
    fixture.detectChanges();
    
    expect(compiled.querySelector('[data-testid="user-menu"]')).toBeFalsy();
    expect(compiled.querySelector('[data-testid="login-btn"]')).toBeTruthy();
  });
});
```

### 2. Старая директива *ngIf

```typescript
// Шаблон
<div *ngIf="showMessage" data-testid="message">Сообщение</div>

// Тест
it('должен показать сообщение когда showMessage=true', () => {
  component.showMessage = true;
  fixture.detectChanges();
  
  expect(compiled.querySelector('[data-testid="message"]')).toBeTruthy();
});
```

### 3. Условные классы [class.]

```typescript
// Шаблон
<div [class.active]="isActive" [class.disabled]="isDisabled">

// Тест
it('должен применить условные классы', () => {
  component.isActive = true;
  component.isDisabled = false;
  fixture.detectChanges();
  
  const div = compiled.querySelector('div');
  expect(div?.classList.contains('active')).toBe(true);
  expect(div?.classList.contains('disabled')).toBe(false);
});
```

### 4. Директива [hidden]

```typescript
// Шаблон
<div [hidden]="isHidden" data-testid="content">Контент</div>

// Тест
it('должен скрыть элемент через hidden', () => {
  component.isHidden = true;
  fixture.detectChanges();
  
  const div = compiled.querySelector('[data-testid="content"]') as HTMLElement;
  // Элемент есть в DOM, но скрыт
  expect(div).toBeTruthy();
  expect(div.hidden).toBe(true);
});
```

**Разница между *ngIf и [hidden]:**
- `*ngIf` - удаляет элемент из DOM
- `[hidden]` - скрывает элемент через CSS (display: none)

---

## Списки и циклы

### 1. Директива @for (Angular 17+)

```typescript
// Шаблон
<ul>
  @for (item of items; track item.id) {
    <li [attr.data-testid]="'item-' + item.id">{{ item.name }}</li>
  }
</ul>

// Тесты
describe('Рендеринг списка', () => {
  it('должен отобразить все элементы', () => {
    component.items = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
      { id: 3, name: 'Item 3' }
    ];
    fixture.detectChanges();
    
    const listItems = compiled.querySelectorAll('li');
    expect(listItems.length).toBe(3);
  });
  
  it('должен отобразить правильный текст для каждого элемента', () => {
    component.items = [
      { id: 1, name: 'First' },
      { id: 2, name: 'Second' }
    ];
    fixture.detectChanges();
    
    const first = compiled.querySelector('[data-testid="item-1"]');
    const second = compiled.querySelector('[data-testid="item-2"]');
    
    expect(first?.textContent).toBe('First');
    expect(second?.textContent).toBe('Second');
  });
});
```

### 2. Пустой список

```typescript
// Шаблон
@if (items.length === 0) {
  <p data-testid="empty-message">Список пуст</p>
} @else {
  <ul>
    @for (item of items; track item.id) {
      <li>{{ item.name }}</li>
    }
  </ul>
}

// Тест
it('должен показать сообщение для пустого списка', () => {
  component.items = [];
  fixture.detectChanges();
  
  const emptyMsg = compiled.querySelector('[data-testid="empty-message"]');
  expect(emptyMsg).toBeTruthy();
  expect(emptyMsg?.textContent).toBe('Список пуст');
});
```

### 3. Динамическое добавление элементов

```typescript
it('должен добавить новый элемент в список', () => {
  component.items = [{ id: 1, name: 'Item 1' }];
  fixture.detectChanges();
  
  expect(compiled.querySelectorAll('li').length).toBe(1);
  
  // Добавляем новый элемент
  component.items.push({ id: 2, name: 'Item 2' });
  fixture.detectChanges();
  
  expect(compiled.querySelectorAll('li').length).toBe(2);
});
```

---

## Продвинутые техники

### 1. Проверка CSS стилей

```typescript
it('должен применить правильные стили', () => {
  component.color = 'red';
  fixture.detectChanges();
  
  const element = compiled.querySelector('[data-testid="colored-box"]') as HTMLElement;
  const computedStyle = window.getComputedStyle(element);
  
  expect(computedStyle.backgroundColor).toBe('rgb(255, 0, 0)'); // red в RGB
});
```

### 2. Проверка вложенной структуры

```typescript
it('должен иметь правильную структуру DOM', () => {
  fixture.detectChanges();
  
  const container = compiled.querySelector('.container');
  expect(container).toBeTruthy();
  
  const header = container?.querySelector('.header');
  expect(header).toBeTruthy();
  
  const title = header?.querySelector('h1');
  expect(title?.textContent).toBe('Title');
});
```

### 3. Проверка порядка элементов

```typescript
it('должен отображать элементы в правильном порядке', () => {
  component.items = ['First', 'Second', 'Third'];
  fixture.detectChanges();
  
  const listItems = Array.from(compiled.querySelectorAll('li'));
  const texts = listItems.map(item => item.textContent?.trim());
  
  expect(texts).toEqual(['First', 'Second', 'Third']);
});
```

### 4. Использование DebugElement для сложных запросов

```typescript
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

it('должен найти элемент по директиве', () => {
  fixture.detectChanges();
  
  // Найти по CSS
  const element = fixture.debugElement.query(By.css('[data-testid="my-element"]'));
  expect(element).toBeTruthy();
  
  // Найти по директиве
  const directive = fixture.debugElement.query(By.directive(MyDirective));
  expect(directive).toBeTruthy();
  
  // Найти все элементы
  const all = fixture.debugElement.queryAll(By.css('li'));
  expect(all.length).toBe(3);
});
```

### 5. Проверка событий в шаблоне

```typescript
it('должен вызвать метод при клике', () => {
  spyOn(component, 'onClick');
  fixture.detectChanges();
  
  const button = compiled.querySelector('button') as HTMLButtonElement;
  button.click();
  
  expect(component.onClick).toHaveBeenCalled();
});
```

### 6. Тестирование пайпов в шаблоне

```typescript
// Шаблон
<p>{{ price | currency:'RUB' }}</p>

// Тест
it('должен отформатировать цену через пайп', () => {
  component.price = 1000;
  fixture.detectChanges();
  
  const paragraph = compiled.querySelector('p');
  expect(paragraph?.textContent).toContain('₽'); // Символ рубля
  expect(paragraph?.textContent).toContain('1'); // Число
});
```

---

## Лучшие практики

### ✅ DO: Используйте data-testid

```typescript
// Хорошо
<button data-testid="submit-btn">Submit</button>
const btn = compiled.querySelector('[data-testid="submit-btn"]');

// Плохо
<button class="btn btn-primary">Submit</button>
const btn = compiled.querySelector('.btn-primary'); // Может измениться при рефакторинге стилей
```

### ✅ DO: Проверяйте важные атрибуты доступности

```typescript
it('должен иметь правильные ARIA атрибуты', () => {
  fixture.detectChanges();
  
  const button = compiled.querySelector('button');
  expect(button?.getAttribute('aria-label')).toBeTruthy();
  expect(button?.getAttribute('role')).toBeTruthy();
});
```

### ✅ DO: Группируйте связанные тесты

```typescript
describe('Рендеринг списка задач', () => {
  describe('когда список пуст', () => {
    it('должен показать сообщение');
    it('не должен показывать элементы');
  });
  
  describe('когда есть задачи', () => {
    it('должен отобразить все задачи');
    it('должен применить правильные классы');
  });
});
```

### ❌ DON'T: Не зависьте от конкретных CSS классов

```typescript
// Плохо
expect(element?.classList.contains('btn-primary')).toBe(true);

// Хорошо
expect(element?.getAttribute('data-testid')).toBe('primary-button');
```

### ❌ DON'T: Не забывайте detectChanges()

```typescript
// Плохо - изменения не применятся
component.title = 'New Title';
const element = compiled.querySelector('h1');
expect(element?.textContent).toBe('New Title'); // FAIL!

// Хорошо
component.title = 'New Title';
fixture.detectChanges(); // ✅
const element = compiled.querySelector('h1');
expect(element?.textContent).toBe('New Title'); // PASS!
```

---

## Чеклист для проверки рендеринга

- [ ] Все важные элементы отображаются
- [ ] Текстовое содержимое корректно
- [ ] Атрибуты установлены правильно
- [ ] Условный рендеринг работает
- [ ] Списки отображаются полностью
- [ ] CSS классы применяются динамически
- [ ] ARIA атрибуты присутствуют
- [ ] Пустые состояния обрабатываются
- [ ] Длинный контент не ломает верстку
- [ ] XSS защита работает (HTML экранируется)

---

## Полезные утилиты

### Вспомогательная функция для поиска элементов

```typescript
function getByTestId(testId: string, parent: HTMLElement = compiled): HTMLElement | null {
  return parent.querySelector(`[data-testid="${testId}"]`);
}

// Использование
const button = getByTestId('submit-btn');
expect(button).toBeTruthy();
```

### Функция для получения всех элементов

```typescript
function getAllByTestId(testId: string, parent: HTMLElement = compiled): HTMLElement[] {
  return Array.from(parent.querySelectorAll(`[data-testid="${testId}"]`));
}

// Использование
const items = getAllByTestId('list-item');
expect(items.length).toBe(5);
```

---

## Резюме

| Что проверять | Метод | Пример |
|---------------|-------|--------|
| Наличие элемента | `querySelector()` | `expect(element).toBeTruthy()` |
| Текст | `.textContent` | `expect(el?.textContent).toBe('Text')` |
| Атрибуты | `.getAttribute()` | `expect(el?.getAttribute('href')).toBe('/')` |
| Классы | `.classList` | `expect(el?.classList.contains('active')).toBe(true)` |
| Свойства форм | `.checked`, `.value`, `.disabled` | `expect(input.checked).toBe(true)` |
| Количество | `.querySelectorAll().length` | `expect(items.length).toBe(3)` |

**Помните:** Всегда вызывайте `fixture.detectChanges()` после изменения данных компонента!

