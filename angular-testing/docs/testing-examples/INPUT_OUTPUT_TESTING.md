# Тестирование @Input и @Output в Angular

## Содержание

1. [Введение](#введение)
2. [Тестирование @Input свойств](#тестирование-input-свойств)
3. [Тестирование @Output событий](#тестирование-output-событий)
4. [Тестирование рендеринга](#тестирование-рендеринга)
5. [Тестирование CSS классов](#тестирование-css-классов)
6. [Интеграция с родительским компонентом](#интеграция-с-родительским-компонентом)

---

## Введение

В Angular компоненты общаются друг с другом через:
- **@Input** - для передачи данных от родителя к ребенку
- **@Output** - для отправки событий от ребенка к родителю

Правильное тестирование этих механизмов критически важно для надежности приложения.

### Пример компонента

```typescript
@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './todo-item.component.html'
})
export class TodoItemComponent {
  // Input свойства
  @Input() todo!: Todo;
  @Input() isHighlighted: boolean = false;
  @Input() canEdit: boolean = true;
  
  // Output события
  @Output() toggleComplete = new EventEmitter<number>();
  @Output() deleteItem = new EventEmitter<number>();
  @Output() startEdit = new EventEmitter<Todo>();
  
  onToggle(): void {
    this.toggleComplete.emit(this.todo.id);
  }
  
  onDelete(): void {
    this.deleteItem.emit(this.todo.id);
  }
}
```

---

## Тестирование @Input свойств

### 1. Базовое тестирование @Input

**Цель**: Проверить, что компонент принимает и корректно использует входные данные.

```typescript
describe('@Input Properties', () => {
  it('должен принять и отобразить объект todo', () => {
    // Arrange: устанавливаем входное свойство
    component.todo = mockTodo;
    
    // Act: запускаем обнаружение изменений
    fixture.detectChanges();
    
    // Assert: проверяем что данные отобразились
    const titleElement = compiled.querySelector('[data-testid="title-1"]');
    expect(titleElement?.textContent?.trim()).toBe('Тестовая задача');
  });
});
```

**Ключевые моменты:**
- Устанавливаем значение через `component.propertyName`
- Вызываем `fixture.detectChanges()` для рендеринга
- Проверяем результат в DOM

### 2. Тестирование опциональных @Input с значениями по умолчанию

```typescript
it('должен иметь значения по умолчанию для опциональных Input', () => {
  // Проверяем значения до инициализации
  expect(component.isHighlighted).toBe(false);
  expect(component.canEdit).toBe(true);
});
```

### 3. Тестирование условного рендеринга на основе @Input

```typescript
it('должен отобразить индикатор выделения когда isHighlighted=true', () => {
  component.todo = mockTodo;
  component.isHighlighted = true;
  fixture.detectChanges();
  
  // Проверяем наличие условно отображаемого элемента
  const indicator = compiled.querySelector('[data-testid="highlight-indicator"]');
  expect(indicator).toBeTruthy();
  expect(indicator?.textContent).toContain('Выделено');
});

it('не должен отображать индикатор выделения когда isHighlighted=false', () => {
  component.todo = mockTodo;
  component.isHighlighted = false;
  fixture.detectChanges();
  
  const indicator = compiled.querySelector('[data-testid="highlight-indicator"]');
  expect(indicator).toBeFalsy(); // Элемент отсутствует в DOM
});
```

**Шаблон для условного рендеринга:**
```html
@if (isHighlighted) {
  <div data-testid="highlight-indicator">⭐ Выделено</div>
}
```

### 4. Тестирование динамического изменения @Input

```typescript
it('должен обновить отображение при изменении Input свойств', () => {
  // Начальное состояние
  component.todo = mockTodo;
  component.isHighlighted = false;
  fixture.detectChanges();
  
  let item = compiled.querySelector('[data-testid="todo-item"]');
  expect(item?.classList.contains('highlighted')).toBe(false);
  
  // Изменяем Input свойство (симулируя изменение от родителя)
  component.isHighlighted = true;
  fixture.detectChanges();
  
  // Проверяем что отображение обновилось
  item = compiled.querySelector('[data-testid="todo-item"]');
  expect(item?.classList.contains('highlighted')).toBe(true);
});
```

---

## Тестирование @Output событий

### 1. Базовое тестирование эмиссии событий

**Цель**: Проверить, что компонент эмитирует события с правильными данными.

```typescript
describe('@Output Events', () => {
  it('должен эмитить toggleComplete с id задачи при клике на checkbox', () => {
    // Arrange: подготавливаем шпиона для отслеживания события
    spyOn(component.toggleComplete, 'emit');
    component.todo = mockTodo;
    fixture.detectChanges();
    
    // Act: кликаем на checkbox
    const checkbox = compiled.querySelector('[data-testid="checkbox-1"]') as HTMLInputElement;
    checkbox.click();
    
    // Assert: проверяем что событие было эмитировано
    expect(component.toggleComplete.emit).toHaveBeenCalledWith(1);
    expect(component.toggleComplete.emit).toHaveBeenCalledTimes(1);
  });
});
```

**Ключевые моменты:**
- Используем `spyOn()` для отслеживания вызовов `emit()`
- Проверяем параметры через `toHaveBeenCalledWith()`
- Проверяем количество вызовов через `toHaveBeenCalledTimes()`

### 2. Тестирование эмиссии сложных объектов

```typescript
it('должен эмитить startEdit с полным объектом todo', () => {
  spyOn(component.startEdit, 'emit');
  component.todo = mockTodo;
  component.canEdit = true;
  fixture.detectChanges();
  
  const editBtn = compiled.querySelector('[data-testid="edit-btn-1"]') as HTMLButtonElement;
  editBtn.click();
  
  // Проверяем что эмитируется весь объект
  expect(component.startEdit.emit).toHaveBeenCalledWith(mockTodo);
});
```

### 3. Тестирование условной эмиссии событий

```typescript
it('не должен эмитить startEdit когда canEdit=false', () => {
  spyOn(component.startEdit, 'emit');
  component.todo = mockTodo;
  component.canEdit = false;
  
  // Вызываем метод напрямую
  component.onEdit();
  
  // Событие не должно быть эмитировано
  expect(component.startEdit.emit).not.toHaveBeenCalled();
});
```

### 4. Тестирование подписки на события (как это делает родитель)

```typescript
it('родитель должен получить событие через подписку', (done) => {
  component.todo = mockTodo;
  
  // Подписываемся на событие как это делает родительский компонент
  component.toggleComplete.subscribe(id => {
    expect(id).toBe(1);
    done(); // Сигнализируем что асинхронный тест завершен
  });
  
  // Эмитируем событие
  component.onToggle();
});
```

**Важно:** Используйте параметр `done` для асинхронных тестов с подписками.

### 5. Тестирование событий DOM (mouseenter, mouseleave)

```typescript
it('должен эмитить itemHovered при наведении мыши', () => {
  spyOn(component.itemHovered, 'emit');
  component.todo = mockTodo;
  fixture.detectChanges();
  
  const item = compiled.querySelector('[data-testid="todo-item"]') as HTMLElement;
  
  // Симулируем событие mouseenter
  item.dispatchEvent(new MouseEvent('mouseenter'));
  
  expect(component.itemHovered.emit).toHaveBeenCalledWith({
    id: 1,
    hovered: true
  });
});
```

---

## Тестирование рендеринга

### 1. Проверка наличия элементов в DOM

```typescript
describe('Template Rendering', () => {
  it('должен рендерить заголовок задачи', () => {
    component.todo = mockTodo;
    fixture.detectChanges();
    
    const title = compiled.querySelector('.todo-title');
    expect(title).toBeTruthy(); // Элемент существует
    expect(title?.textContent?.trim()).toBe('Тестовая задача');
  });
});
```

### 2. Тестирование состояния элементов формы

```typescript
it('должен рендерить checkbox с правильным состоянием checked', () => {
  component.todo = completedTodo; // completed: true
  fixture.detectChanges();
  
  const checkbox = compiled.querySelector('[data-testid="checkbox-2"]') as HTMLInputElement;
  expect(checkbox.checked).toBe(true);
});

it('checkbox должен быть unchecked для невыполненной задачи', () => {
  component.todo = mockTodo; // completed: false
  fixture.detectChanges();
  
  const checkbox = compiled.querySelector('[data-testid="checkbox-1"]') as HTMLInputElement;
  expect(checkbox.checked).toBe(false);
});
```

### 3. Тестирование ARIA атрибутов для доступности

```typescript
it('должен добавлять ARIA атрибуты для доступности', () => {
  component.todo = mockTodo;
  fixture.detectChanges();
  
  const checkbox = compiled.querySelector('[data-testid="checkbox-1"]');
  const ariaLabel = checkbox?.getAttribute('aria-label');
  
  expect(ariaLabel).toContain('Отметить задачу');
  expect(ariaLabel).toContain(mockTodo.title);
});
```

**Шаблон:**
```html
<input 
  type="checkbox"
  [attr.aria-label]="'Отметить задачу: ' + todo.title"
/>
```

### 4. Тестирование форматирования данных

```typescript
it('должен отображать форматированную дату создания', () => {
  component.todo = mockTodo; // createdAt: new Date('2024-01-15')
  fixture.detectChanges();
  
  const date = compiled.querySelector('[data-testid="date-1"]');
  expect(date).toBeTruthy();
  expect(date?.textContent).toContain('2024');
  expect(date?.textContent).toContain('январ'); // Локализованная дата
});
```

### 5. Тестирование условного отображения кнопок

```typescript
it('должен показать кнопку редактирования когда canEdit=true', () => {
  component.todo = mockTodo;
  component.canEdit = true;
  fixture.detectChanges();
  
  const editBtn = compiled.querySelector('[data-testid="edit-btn-1"]');
  expect(editBtn).toBeTruthy();
});

it('не должен показывать кнопку редактирования когда canEdit=false', () => {
  component.todo = mockTodo;
  component.canEdit = false;
  fixture.detectChanges();
  
  const editBtn = compiled.querySelector('[data-testid="edit-btn-1"]');
  expect(editBtn).toBeFalsy();
});
```

---

## Тестирование CSS классов

### 1. Проверка динамических CSS классов

```typescript
describe('CSS Classes and Styling', () => {
  it('должен всегда иметь базовый класс todo-item', () => {
    component.todo = mockTodo;
    fixture.detectChanges();
    
    const item = compiled.querySelector('[data-testid="todo-item"]');
    expect(item?.classList.contains('todo-item')).toBe(true);
  });
  
  it('должен добавить класс completed для выполненной задачи', () => {
    component.todo = completedTodo; // completed: true
    fixture.detectChanges();
    
    const item = compiled.querySelector('[data-testid="todo-item"]');
    expect(item?.classList.contains('completed')).toBe(true);
  });
});
```

### 2. Тестирование ngClass

```typescript
it('метод getItemClasses должен возвращать правильный объект классов', () => {
  component.todo = completedTodo;
  component.isHighlighted = true;
  component.canEdit = false;
  
  const classes = component.getItemClasses();
  
  expect(classes['todo-item']).toBe(true);
  expect(classes['completed']).toBe(true);
  expect(classes['highlighted']).toBe(true);
  expect(classes['read-only']).toBe(true);
});
```

**Метод компонента:**
```typescript
getItemClasses(): { [key: string]: boolean } {
  return {
    'todo-item': true,
    'completed': this.todo.completed,
    'highlighted': this.isHighlighted,
    'read-only': !this.canEdit
  };
}
```

**Шаблон:**
```html
<div [ngClass]="getItemClasses()">
  <!-- контент -->
</div>
```

---

## Интеграция с родительским компонентом

### 1. Комплексный тест взаимодействия

```typescript
describe('Parent Component Integration', () => {
  it('должен правильно работать в контексте родительского компонента', () => {
    // Симулируем настройку из родительского компонента
    component.todo = mockTodo;
    component.isHighlighted = true;
    component.canEdit = true;
    
    // Подписываемся на события как родитель
    let toggledId: number | undefined;
    let deletedId: number | undefined;
    
    component.toggleComplete.subscribe(id => toggledId = id);
    component.deleteItem.subscribe(id => deletedId = id);
    
    fixture.detectChanges();
    
    // Проверяем рендеринг
    expect(compiled.querySelector('.todo-title')?.textContent).toContain('Тестовая задача');
    expect(compiled.querySelector('.highlighted')).toBeTruthy();
    
    // Проверяем взаимодействие
    component.onToggle();
    component.onDelete();
    
    expect(toggledId).toBe(1);
    expect(deletedId).toBe(1);
  });
});
```

### 2. Тестирование множественных подписок

```typescript
it('должен поддерживать множественные подписки на Output события', () => {
  component.todo = mockTodo;
  
  let subscriber1Called = false;
  let subscriber2Called = false;
  
  // Две подписки на одно событие (типично для Angular)
  component.toggleComplete.subscribe(() => subscriber1Called = true);
  component.toggleComplete.subscribe(() => subscriber2Called = true);
  
  // Эмитируем событие
  component.onToggle();
  
  // Обе подписки должны сработать
  expect(subscriber1Called).toBe(true);
  expect(subscriber2Called).toBe(true);
});
```

---

## Граничные случаи

### 1. Обработка длинного контента

```typescript
describe('Edge Cases', () => {
  it('должен корректно отображать длинный заголовок', () => {
    const longTitle = 'Очень длинный заголовок задачи который может не поместиться в одну строку';
    component.todo = { ...mockTodo, title: longTitle };
    fixture.detectChanges();
    
    const title = compiled.querySelector('.todo-title');
    expect(title?.textContent).toContain(longTitle);
  });
});
```

### 2. Безопасность: защита от XSS

```typescript
it('должен корректно экранировать HTML в заголовке', () => {
  const xssTitle = '<script>alert("XSS")</script>';
  component.todo = { ...mockTodo, title: xssTitle };
  fixture.detectChanges();
  
  const title = compiled.querySelector('.todo-title');
  // Angular автоматически экранирует HTML
  expect(title?.textContent).toContain(xssTitle);
  // Скрипт НЕ должен быть выполнен
  expect(compiled.querySelector('script')).toBeFalsy();
});
```

---

## Полный пример теста

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodoItemComponent } from './todo-item.component';
import { Todo } from '../../models/todo.model';

describe('TodoItemComponent', () => {
  let component: TodoItemComponent;
  let fixture: ComponentFixture<TodoItemComponent>;
  let compiled: HTMLElement;

  const mockTodo: Todo = {
    id: 1,
    title: 'Тестовая задача',
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('@Input Properties', () => {
    it('должен принять и отобразить todo', () => {
      component.todo = mockTodo;
      fixture.detectChanges();
      
      const title = compiled.querySelector('[data-testid="title-1"]');
      expect(title?.textContent?.trim()).toBe('Тестовая задача');
    });
  });

  describe('@Output Events', () => {
    it('должен эмитить toggleComplete при клике', () => {
      spyOn(component.toggleComplete, 'emit');
      component.todo = mockTodo;
      fixture.detectChanges();
      
      const checkbox = compiled.querySelector('[data-testid="checkbox-1"]') as HTMLInputElement;
      checkbox.click();
      
      expect(component.toggleComplete.emit).toHaveBeenCalledWith(1);
    });
  });
});
```

---

## Лучшие практики

### 1. Используйте data-testid для селекторов

```html
<!-- ✅ Хорошо -->
<div data-testid="todo-item">
  <h3 data-testid="todo-title">{{ todo.title }}</h3>
</div>

<!-- ❌ Плохо -->
<div class="item">
  <h3 class="title">{{ todo.title }}</h3>
</div>
```

**Причина:** CSS классы могут меняться при рефакторинге стилей.

### 2. Проверяйте тип данных в событиях

```typescript
// ✅ Хорошо
expect(component.toggleComplete.emit).toHaveBeenCalledWith(1);

// ❌ Недостаточно
expect(component.toggleComplete.emit).toHaveBeenCalled();
```

### 3. Тестируйте важные граничные случаи

```typescript
// Пустые строки
component.todo = { ...mockTodo, title: '' };

// Специальные символы
component.todo = { ...mockTodo, title: '<>&"' };

// Очень длинные строки
component.todo = { ...mockTodo, title: 'a'.repeat(1000) };
```

### 4. Группируйте тесты логически

```typescript
describe('TodoItemComponent', () => {
  describe('@Input Properties', () => { /* ... */ });
  describe('@Output Events', () => { /* ... */ });
  describe('Template Rendering', () => { /* ... */ });
  describe('CSS Classes', () => { /* ... */ });
});
```

---

## Резюме

| Что тестировать | Как тестировать | Инструменты |
|-----------------|-----------------|-------------|
| **@Input** | Устанавливайте значения и проверяйте рендеринг | `component.property = value` + `fixture.detectChanges()` |
| **@Output** | Используйте шпионов для отслеживания эмиссии | `spyOn()`, `toHaveBeenCalledWith()` |
| **Рендеринг** | Проверяйте наличие и содержимое элементов DOM | `querySelector()`, `textContent` |
| **CSS классы** | Проверяйте динамическое применение классов | `classList.contains()` |
| **Интеграция** | Симулируйте взаимодействие родитель-ребенок | `.subscribe()`, множественные Input/Output |

---

## Дополнительные ресурсы

- [Официальная документация Angular Testing](https://angular.dev/guide/testing)
- [Jasmine Documentation](https://jasmine.github.io/)
- [Testing Best Practices](https://angular.dev/guide/testing/best-practices)
- Полный пример: `src/app/components/todo-item/todo-item.component.spec.ts`

