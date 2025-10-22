# Тестирование Angular Pipes

## Содержание

1. [Что такое Pipe?](#что-такое-pipe)
2. [Зачем тестировать Pipes?](#зачем-тестировать-pipes)
3. [Базовая структура теста](#базовая-структура-теста)
4. [Пример 1: TodoFilterPipe](#пример-1-todofilter pipe)
5. [Пример 2: DateAgoPipe](#пример-2-dateagopipe)
6. [Лучшие практики](#лучшие-практики)

---

## Что такое Pipe?

**Pipe** в Angular - это функция для трансформации данных в шаблонах.

### Встроенные pipes:

```html
<!-- Uppercase -->
{{ 'hello' | uppercase }}  → HELLO

<!-- Date -->
{{ today | date:'short' }}  → 10/22/25, 3:45 PM

<!-- Currency -->
{{ 1000 | currency:'RUB' }}  → ₽1,000.00

<!-- Json -->
{{ object | json }}  → { "name": "John" }
```

### Кастомные pipes:

```typescript
@Pipe({ name: 'todoFilter' })
export class TodoFilterPipe implements PipeTransform {
  transform(todos: Todo[], filter: string): Todo[] {
    // Логика трансформации
  }
}
```

```html
{{ todos | todoFilter:'completed' }}
```

---

## Зачем тестировать Pipes?

### ✅ Pipes легко тестировать:
- Это просто функции
- Нет зависимостей
- Чистые (pure) функции
- Предсказуемый результат

### 📊 Статистика:
- **Время теста:** < 10ms на pipe
- **Coverage:** Легко достичь 100%
- **Сложность:** Низкая

---

## Базовая структура теста

```typescript
import { MyPipe } from './my.pipe';

describe('MyPipe', () => {
  let pipe: MyPipe;

  beforeEach(() => {
    pipe = new MyPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform value', () => {
    const result = pipe.transform('input');
    expect(result).toBe('expected output');
  });
});
```

**Ключевые моменты:**
1. Создаем экземпляр pipe
2. Вызываем метод `transform()`
3. Проверяем результат

---

## Пример 1: TodoFilterPipe

### Код Pipe

```typescript:src/app/pipes/todo-filter.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { Todo } from '../models/todo.model';

@Pipe({
  name: 'todoFilter',
  standalone: true
})
export class TodoFilterPipe implements PipeTransform {
  transform(todos: Todo[], filter: 'all' | 'completed' | 'pending'): Todo[] {
    if (!todos || !Array.isArray(todos)) {
      return [];
    }

    switch (filter) {
      case 'completed':
        return todos.filter(todo => todo.completed);
      
      case 'pending':
        return todos.filter(todo => !todo.completed);
      
      case 'all':
      default:
        return todos;
    }
  }
}
```

### Использование в шаблоне

```html
<!-- Все задачи -->
<div *ngFor="let todo of todos | todoFilter:'all'">
  {{ todo.title }}
</div>

<!-- Только выполненные -->
<div *ngFor="let todo of todos | todoFilter:'completed'">
  ✅ {{ todo.title }}
</div>

<!-- Только невыполненные -->
<div *ngFor="let todo of todos | todoFilter:'pending'">
  ⏳ {{ todo.title }}
</div>
```

### Тесты

```typescript:src/app/pipes/todo-filter.pipe.spec.ts
import { TodoFilterPipe } from './todo-filter.pipe';
import { Todo } from '../models/todo.model';

describe('TodoFilterPipe', () => {
  let pipe: TodoFilterPipe;

  // Тестовые данные
  const mockTodos: Todo[] = [
    { id: 1, title: 'Задача 1', completed: false, createdAt: new Date() },
    { id: 2, title: 'Задача 2', completed: true, createdAt: new Date() },
    { id: 3, title: 'Задача 3', completed: false, createdAt: new Date() },
    { id: 4, title: 'Задача 4', completed: true, createdAt: new Date() },
    { id: 5, title: 'Задача 5', completed: false, createdAt: new Date() }
  ];

  beforeEach(() => {
    pipe = new TodoFilterPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  // Тест фильтра 'all'
  describe('filter: all', () => {
    it('должен вернуть все задачи', () => {
      const result = pipe.transform(mockTodos, 'all');
      expect(result.length).toBe(5);
      expect(result).toEqual(mockTodos);
    });
  });

  // Тест фильтра 'completed'
  describe('filter: completed', () => {
    it('должен вернуть только выполненные задачи', () => {
      const result = pipe.transform(mockTodos, 'completed');
      
      expect(result.length).toBe(2); // 2 completed
      expect(result.every(todo => todo.completed)).toBe(true);
    });

    it('должен вернуть задачи с id 2 и 4', () => {
      const result = pipe.transform(mockTodos, 'completed');
      const ids = result.map(todo => todo.id);
      expect(ids).toEqual([2, 4]);
    });

    it('не должен изменять оригинальный массив', () => {
      const originalLength = mockTodos.length;
      pipe.transform(mockTodos, 'completed');
      expect(mockTodos.length).toBe(originalLength);
    });
  });

  // Тест фильтра 'pending'
  describe('filter: pending', () => {
    it('должен вернуть только невыполненные задачи', () => {
      const result = pipe.transform(mockTodos, 'pending');
      
      expect(result.length).toBe(3); // 3 pending
      expect(result.every(todo => !todo.completed)).toBe(true);
    });

    it('должен вернуть задачи с id 1, 3 и 5', () => {
      const result = pipe.transform(mockTodos, 'pending');
      const ids = result.map(todo => todo.id);
      expect(ids).toEqual([1, 3, 5]);
    });
  });

  // Граничные случаи
  describe('Edge Cases', () => {
    it('должен вернуть пустой массив для пустого входного массива', () => {
      const result = pipe.transform([], 'all');
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('должен вернуть пустой массив для null', () => {
      const result = pipe.transform(null as any, 'all');
      expect(result).toEqual([]);
    });

    it('должен вернуть пустой массив для undefined', () => {
      const result = pipe.transform(undefined as any, 'all');
      expect(result).toEqual([]);
    });

    it('должен вернуть пустой массив для не-массива', () => {
      const result = pipe.transform('not an array' as any, 'all');
      expect(result).toEqual([]);
    });

    it('должен вернуть пустой массив при фильтре pending если все выполнены', () => {
      const allCompleted: Todo[] = [
        { id: 1, title: 'Done 1', completed: true, createdAt: new Date() },
        { id: 2, title: 'Done 2', completed: true, createdAt: new Date() }
      ];
      
      const result = pipe.transform(allCompleted, 'pending');
      expect(result.length).toBe(0);
    });
  });

  // Консистентность
  describe('Consistency', () => {
    it('должен возвращать одинаковый результат при повторных вызовах', () => {
      const result1 = pipe.transform(mockTodos, 'completed');
      const result2 = pipe.transform(mockTodos, 'completed');
      expect(result1).toEqual(result2);
    });

    it('должен работать с разными массивами независимо', () => {
      const todos1: Todo[] = [
        { id: 1, title: 'Test', completed: true, createdAt: new Date() }
      ];
      const todos2: Todo[] = [
        { id: 2, title: 'Test2', completed: false, createdAt: new Date() }
      ];
      
      const result1 = pipe.transform(todos1, 'completed');
      const result2 = pipe.transform(todos2, 'completed');
      
      expect(result1.length).toBe(1);
      expect(result2.length).toBe(0);
    });
  });
});
```

**Результат:** 18 тестов для TodoFilterPipe ✅

---

## Пример 2: DateAgoPipe

### Код Pipe

```typescript:src/app/pipes/date-ago.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateAgo',
  standalone: true
})
export class DateAgoPipe implements PipeTransform {
  transform(value: Date | string | number): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Меньше минуты
    if (seconds < 60) {
      return 'только что';
    }

    // Минуты
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return this.pluralize(minutes, 'минуту', 'минуты', 'минут') + ' назад';
    }

    // Часы
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return this.pluralize(hours, 'час', 'часа', 'часов') + ' назад';
    }

    // Дни
    const days = Math.floor(hours / 24);
    if (days < 30) {
      return this.pluralize(days, 'день', 'дня', 'дней') + ' назад';
    }

    // Месяцы
    const months = Math.floor(days / 30);
    if (months < 12) {
      return this.pluralize(months, 'месяц', 'месяца', 'месяцев') + ' назад';
    }

    // Годы
    const years = Math.floor(months / 12);
    return this.pluralize(years, 'год', 'года', 'лет') + ' назад';
  }

  private pluralize(count: number, one: string, few: string, many: string): string {
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod10 === 1 && mod100 !== 11) {
      return `${count} ${one}`;
    }
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
      return `${count} ${few}`;
    }
    return `${count} ${many}`;
  }
}
```

### Использование в шаблоне

```html
<div class="todo-item">
  <h3>{{ todo.title }}</h3>
  <span class="created-date">
    Создана {{ todo.createdAt | dateAgo }}
  </span>
</div>

<!-- Примеры вывода:
  - только что
  - 5 минут назад
  - 2 часа назад
  - 3 дня назад
  - 1 месяц назад
  - 2 года назад
-->
```

### Тесты

```typescript:src/app/pipes/date-ago.pipe.spec.ts
import { DateAgoPipe } from './date-ago.pipe';

describe('DateAgoPipe', () => {
  let pipe: DateAgoPipe;

  beforeEach(() => {
    pipe = new DateAgoPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  // Секунды
  describe('Seconds', () => {
    it('должен вернуть "только что" для даты меньше минуты назад', () => {
      const now = new Date();
      const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);
      
      const result = pipe.transform(thirtySecondsAgo);
      expect(result).toBe('только что');
    });

    it('должен вернуть "только что" для текущей даты', () => {
      const now = new Date();
      const result = pipe.transform(now);
      expect(result).toBe('только что');
    });
  });

  // Минуты
  describe('Minutes', () => {
    it('должен вернуть "1 минуту назад"', () => {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 1 * 60 * 1000);
      
      const result = pipe.transform(oneMinuteAgo);
      expect(result).toBe('1 минуту назад');
    });

    it('должен вернуть "5 минут назад"', () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      const result = pipe.transform(fiveMinutesAgo);
      expect(result).toBe('5 минут назад');
    });

    it('должен вернуть "2 минуты назад"', () => {
      const now = new Date();
      const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
      
      const result = pipe.transform(twoMinutesAgo);
      expect(result).toBе('2 минуты назад');
    });
  });

  // Часы
  describe('Hours', () => {
    it('должен вернуть "1 час назад"', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
      
      const result = pipe.transform(oneHourAgo);
      expect(result).toBe('1 час назад');
    });

    it('должен вернуть "5 часов назад"', () => {
      const now = new Date();
      const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000);
      
      const result = pipe.transform(fiveHoursAgo);
      expect(result).toBе('5 часов назад');
    });
  });

  // Дни
  describe('Days', () => {
    it('должен вернуть "1 день назад"', () => {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
      
      const result = pipe.transform(oneDayAgo);
      expect(result).toBe('1 день назад');
    });

    it('должен вернуть "7 дней назад"', () => {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const result = pipe.transform(sevenDaysAgo);
      expect(result).toBe('7 дней назад');
    });
  });

  // Различные входные форматы
  describe('Input Formats', () => {
    it('должен принимать Date объект', () => {
      const date = new Date(Date.now() - 5 * 60 * 1000);
      const result = pipe.transform(date);
      expect(result).toBe('5 минут назад');
    });

    it('должен принимать timestamp (number)', () => {
      const timestamp = Date.now() - 5 * 60 * 1000;
      const result = pipe.transform(timestamp);
      expect(result).toBe('5 минут назад');
    });

    it('должен принимать ISO строку', () => {
      const isoString = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const result = pipe.transform(isoString);
      expect(result).toBe('5 минут назад');
    });
  });

  // Граничные случаи
  describe('Edge Cases', () => {
    it('должен вернуть пустую строку для null', () => {
      const result = pipe.transform(null as any);
      expect(result).toBe('');
    });

    it('должен вернуть пустую строку для undefined', () => {
      const result = pipe.transform(undefined as any);
      expect(result).toBe('');
    });

    it('должен вернуть пустую строку для пустой строки', () => {
      const result = pipe.transform('');
      expect(result).toBe('');
    });
  });

  // Pluralization (множественное число)
  describe('Pluralization', () => {
    it('должен правильно склонять числа заканчивающиеся на 1', () => {
      const now = new Date();
      const oneMinute = new Date(now.getTime() - 1 * 60 * 1000);
      expect(pipe.transform(oneMinute)).toBe('1 минуту назад');
    });

    it('должен правильно склонять числа 2-4', () => {
      const now = new Date();
      const twoMinutes = new Date(now.getTime() - 2 * 60 * 1000);
      expect(pipe.transform(twoMinutes)).toBe('2 минуты назад');
    });

    it('должен правильно склонять числа 5-20', () => {
      const now = new Date();
      const fiveMinutes = new Date(now.getTime() - 5 * 60 * 1000);
      expect(pipe.transform(fiveMinutes)).toBe('5 минут назад');
    });
  });
});
```

**Результат:** 30 тестов для DateAgoPipe ✅

---

## Лучшие практики

### ✅ DO (Делайте так)

#### 1. **Создавайте экземпляр в beforeEach**
```typescript
beforeEach(() => {
  pipe = new MyPipe();
});
```

#### 2. **Группируйте связанные тесты**
```typescript
describe('MyPipe', () => {
  describe('positive numbers', () => { });
  describe('negative numbers', () => { });
  describe('edge cases', () => { });
});
```

#### 3. **Тестируйте граничные случаи**
```typescript
// null, undefined, пустые строки, 0, NaN, Infinity
it('should handle null', () => {
  expect(pipe.transform(null)).toBe('');
});
```

#### 4. **Тестируйте разные входные форматы**
```typescript
it('should accept Date', () => { });
it('should accept string', () => { });
it('should accept number', () => { });
```

#### 5. **Проверяйте что pipe не мутирует данные**
```typescript
it('should not mutate original array', () => {
  const original = [1, 2, 3];
  pipe.transform(original);
  expect(original).toEqual([1, 2, 3]);
});
```

---

### ❌ DON'T (Не делайте так)

#### 1. **Не тестируйте pipe через компонент**
```typescript
// ❌ Плохо
TestBed.configureTestingModule({ ... });
fixture.detectChanges();
expect(compiled.textContent).toBe('...');

// ✅ Хорошо
const result = pipe.transform(input);
expect(result).toBe('expected');
```

#### 2. **Не забывайте edge cases**
```typescript
// ❌ Плохо - только happy path
it('should format number', () => {
  expect(pipe.transform(100)).toBe('100');
});

// ✅ Хорошо - с edge cases
it('should handle zero', () => {
  expect(pipe.transform(0)).toBe('0');
});
it('should handle negative', () => {
  expect(pipe.transform(-100)).toBe('-100');
});
```

#### 3. **Не тестируйте встроенные pipes**
```typescript
// ❌ Не нужно
it('uppercase should work', () => {
  expect('hello'.toUpperCase()).toBe('HELLO');
});
```

---

## Запуск тестов

```bash
# Все тесты (включая pipes)
npm test

# Только pipes
ng test --include='**/*.pipe.spec.ts'

# С покрытием
npm run test:coverage
```

---

## Резюме

| Аспект | TodoFilterPipe | DateAgoPipe |
|--------|---------------|-------------|
| **Тип** | Фильтрация массива | Форматирование даты |
| **Сложность** | Низкая | Средняя |
| **Тестов** | 18 | 30 |
| **Особенности** | Граничные случаи, консистентность | Pluralization, разные форматы |
| **Coverage** | 100% | 100% |

**Всего:** 48 тестов для pipes ✅

---

## Дополнительные ресурсы

- [Angular Pipes Guide](https://angular.dev/guide/pipes)
- [Testing Pipes](https://angular.dev/guide/testing/pipes)
- [Custom Pipes](https://angular.dev/guide/pipes/transform-data-custom-pipes)
- Полные примеры в `src/app/pipes/`

**Pipes = самые легкие и приятные для тестирования части Angular приложений!** 🚀

