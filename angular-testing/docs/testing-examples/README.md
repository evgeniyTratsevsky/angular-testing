# Примеры тестирования Angular компонентов

Эта папка содержит подробные руководства и примеры для тестирования различных аспектов Angular компонентов.

## 📚 Доступные руководства

### 1. [Тестирование @Input и @Output](./INPUT_OUTPUT_TESTING.md)
**Полное руководство по тестированию взаимодействия компонентов**

Включает:
- ✅ Тестирование входных свойств (@Input)
- ✅ Тестирование выходных событий (@Output)
- ✅ Проверка эмиссии событий с помощью spyOn
- ✅ Тестирование условного рендеринга на основе Input
- ✅ Интеграционное тестирование родитель-ребенок
- ✅ Обработка граничных случаев

**Примеры:**
```typescript
// Тестирование @Input
it('должен принять и отобразить todo', () => {
  component.todo = mockTodo;
  fixture.detectChanges();
  expect(compiled.querySelector('.title')?.textContent).toBe('Задача');
});

// Тестирование @Output
it('должен эмитить событие при клике', () => {
  spyOn(component.deleteItem, 'emit');
  component.onDelete();
  expect(component.deleteItem.emit).toHaveBeenCalledWith(1);
});
```

---

### 2. [Проверка рендеринга](./RENDERING_TESTS.md)
**Полное руководство по тестированию отображения компонентов**

Включает:
- ✅ Проверка наличия элементов в DOM
- ✅ Проверка текстового содержимого
- ✅ Проверка атрибутов и свойств
- ✅ Условный рендеринг (@if, *ngIf)
- ✅ Рендеринг списков (@for, *ngFor)
- ✅ Тестирование CSS классов и стилей
- ✅ ARIA атрибуты для доступности

**Примеры:**
```typescript
// Проверка рендеринга
it('должен отображать заголовок', () => {
  component.title = 'Hello';
  fixture.detectChanges();
  const h1 = compiled.querySelector('h1');
  expect(h1?.textContent).toBe('Hello');
});

// Условный рендеринг
it('должен показать элемент когда условие true', () => {
  component.showMessage = true;
  fixture.detectChanges();
  expect(compiled.querySelector('[data-testid="message"]')).toBeTruthy();
});
```

---

## 🎯 Практический пример: TodoItemComponent

В проекте есть полностью протестированный компонент `TodoItemComponent`, который демонстрирует все концепции:

**Расположение:**
- Компонент: `src/app/components/todo-item/todo-item.component.ts`
- Тесты: `src/app/components/todo-item/todo-item.component.spec.ts` (41 тест)

**Что демонстрирует:**
```typescript
@Component({
  selector: 'app-todo-item'
})
export class TodoItemComponent {
  // @Input примеры
  @Input() todo!: Todo;
  @Input() isHighlighted: boolean = false;
  @Input() canEdit: boolean = true;
  
  // @Output примеры
  @Output() toggleComplete = new EventEmitter<number>();
  @Output() deleteItem = new EventEmitter<number>();
  @Output() startEdit = new EventEmitter<Todo>();
  @Output() itemHovered = new EventEmitter<{ id: number; hovered: boolean }>();
  
  // Методы для тестирования
  onToggle(): void { /* ... */ }
  onDelete(): void { /* ... */ }
  getItemClasses(): { [key: string]: boolean } { /* ... */ }
  getFormattedDate(): string { /* ... */ }
}
```

**109 тестов включают:**
- 7 тестов @Input свойств
- 7 тестов @Output событий
- 9 тестов рендеринга шаблона
- 7 тестов CSS классов
- 8 тестов методов компонента
- 3 теста интеграции с родителем
- 3 теста граничных случаев

---

## 📖 Быстрый старт

### 1. Базовая структура теста

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyComponent } from './my.component';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### 2. Тестирование @Input

```typescript
it('должен принять входное значение', () => {
  // 1. Установить значение
  component.myInput = 'test value';
  
  // 2. Запустить обнаружение изменений
  fixture.detectChanges();
  
  // 3. Проверить результат
  expect(component.myInput).toBe('test value');
  expect(compiled.querySelector('.display')?.textContent).toBe('test value');
});
```

### 3. Тестирование @Output

```typescript
it('должен эмитить событие', () => {
  // 1. Создать шпиона
  spyOn(component.myOutput, 'emit');
  
  // 2. Вызвать действие
  component.triggerEvent();
  
  // 3. Проверить эмиссию
  expect(component.myOutput.emit).toHaveBeenCalledWith('expected value');
  expect(component.myOutput.emit).toHaveBeenCalledTimes(1);
});
```

### 4. Тестирование рендеринга

```typescript
it('должен отобразить элемент', () => {
  // 1. Установить данные
  component.items = ['Item 1', 'Item 2'];
  
  // 2. Запустить рендеринг
  fixture.detectChanges();
  
  // 3. Проверить DOM
  const items = compiled.querySelectorAll('li');
  expect(items.length).toBe(2);
  expect(items[0].textContent).toBe('Item 1');
});
```

---

## 🛠️ Инструменты и утилиты

### Полезные селекторы

```typescript
// По data-testid (рекомендуется)
compiled.querySelector('[data-testid="my-element"]')

// По классу
compiled.querySelector('.my-class')

// По тегу
compiled.querySelector('button')

// По атрибуту
compiled.querySelector('[type="submit"]')

// Множественный выбор
compiled.querySelectorAll('li')
```

### Проверка элементов

```typescript
// Наличие элемента
expect(element).toBeTruthy();
expect(element).toBeFalsy();
expect(element).toBeNull();

// Текстовое содержимое
expect(element?.textContent).toBe('Expected text');
expect(element?.textContent).toContain('part of text');
expect(element?.textContent?.trim()).toBe('No spaces');

// Атрибуты
expect(element?.getAttribute('href')).toBe('/home');
expect(element?.getAttribute('aria-label')).toBeTruthy();

// CSS классы
expect(element?.classList.contains('active')).toBe(true);

// Свойства элементов
expect(inputElement.value).toBe('input value');
expect(checkboxElement.checked).toBe(true);
expect(buttonElement.disabled).toBe(false);
```

---

## 🎓 Лучшие практики

### ✅ DO (Делайте так)

1. **Используйте data-testid для селекторов**
   ```html
   <button data-testid="submit-btn">Submit</button>
   ```

2. **Группируйте связанные тесты**
   ```typescript
   describe('MyComponent', () => {
     describe('@Input Properties', () => { /* ... */ });
     describe('@Output Events', () => { /* ... */ });
   });
   ```

3. **Проверяйте граничные случаи**
   ```typescript
   it('должен обработать пустой массив', () => { /* ... */ });
   it('должен обработать очень длинную строку', () => { /* ... */ });
   ```

4. **Тестируйте доступность**
   ```typescript
   expect(button?.getAttribute('aria-label')).toBeTruthy();
   ```

### ❌ DON'T (Не делайте так)

1. **Не зависьте от CSS классов в тестах**
   ```typescript
   // Плохо
   compiled.querySelector('.btn-primary')
   
   // Хорошо
   compiled.querySelector('[data-testid="primary-btn"]')
   ```

2. **Не забывайте detectChanges()**
   ```typescript
   // Плохо
   component.title = 'New';
   expect(compiled.querySelector('h1')?.textContent).toBe('New'); // FAIL!
   
   // Хорошо
   component.title = 'New';
   fixture.detectChanges();
   expect(compiled.querySelector('h1')?.textContent).toBe('New'); // PASS!
   ```

3. **Не тестируйте реализацию, тестируйте поведение**
   ```typescript
   // Плохо - тестирует внутреннюю реализацию
   expect(component['privateMethod']).toHaveBeenCalled();
   
   // Хорошо - тестирует публичное поведение
   expect(compiled.querySelector('.result')?.textContent).toBe('Expected');
   ```

---

## 📊 Статистика проекта

**Текущее покрытие тестами:**
- Всего тестов: **109**
- Тесты сервисов: 15
- Тесты компонентов: 68 (TodoListComponent) + 41 (TodoItemComponent)
- Тесты приложения: 3

**Запуск тестов:**
```bash
# Все тесты
npm test

# Headless режим
npm run test:headless

# С покрытием кода
npm run test:coverage

# CI режим
npm run test:ci
```

---

## 🔗 Дополнительные ресурсы

### Документация Angular
- [Testing Guide](https://angular.dev/guide/testing)
- [Component Testing](https://angular.dev/guide/testing/components)
- [Testing Utilities](https://angular.dev/api/core/testing)

### Jasmine
- [Jasmine Documentation](https://jasmine.github.io/)
- [Matchers](https://jasmine.github.io/api/edge/matchers.html)
- [Spies](https://jasmine.github.io/tutorials/your_first_suite#section-Spies)

### Karma
- [Karma Configuration](https://karma-runner.github.io/latest/config/configuration-file.html)
- [Karma Browsers](https://karma-runner.github.io/latest/config/browsers.html)

---

## 💡 Советы

1. **Начните с простых тестов** - сначала проверьте создание компонента, потом добавляйте сложную логику
2. **Используйте describe для группировки** - это улучшает читаемость и организацию
3. **Пишите понятные названия тестов** - должно быть ясно что тестируется и каков ожидаемый результат
4. **Следуйте паттерну Arrange-Act-Assert** - подготовка, действие, проверка
5. **Избегайте дублирования кода** - используйте beforeEach для общей настройки
6. **Тестируйте edge cases** - пустые значения, null, undefined, очень большие числа и т.д.

---

## 🤝 Контрибьюция

Если вы нашли ошибку или хотите улучшить примеры:
1. Изучите существующий код в `src/app/components/todo-item/`
2. Добавьте свои примеры
3. Убедитесь что все тесты проходят: `npm test`
4. Обновите документацию

---

**Последнее обновление:** 22 октября 2025

**Версия Angular:** 19.2.0  
**Версия Jasmine:** 5.6.0  
**Версия Karma:** 6.4.0

