/**
 * Тесты для TodoItemComponent
 *
 * Этот файл демонстрирует тестирование компонента с @Input и @Output:
 * - Тестирование входных свойств (@Input)
 * - Тестирование выходных событий (@Output)
 * - Тестирование условного рендеринга
 * - Тестирование CSS классов и стилей
 * - Тестирование пользовательских взаимодействий
 * - Тестирование форматирования данных
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TodoItemComponent } from './todo-item.component';
import { Todo } from '../../models/todo.model';

describe('TodoItemComponent', () => {
  let component: TodoItemComponent;
  let fixture: ComponentFixture<TodoItemComponent>;
  let compiled: HTMLElement;

  // Тестовые данные
  const mockTodo: Todo = {
    id: 1,
    title: 'Тестовая задача',
    completed: false,
    createdAt: new Date('2024-01-15')
  };

  const completedTodo: Todo = {
    id: 2,
    title: 'Выполненная задача',
    completed: true,
    createdAt: new Date('2024-01-10')
  };

  // Настройка перед каждым тестом
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoItemComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TodoItemComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
  });

  // Базовая проверка создания компонента
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Тесты @Input свойств
   * Проверяют как компонент реагирует на входные данные
   */
  describe('@Input Properties', () => {
    // Тест: компонент принимает и отображает todo
    it('должен принять и отобразить объект todo', () => {
      // Arrange: устанавливаем входное свойство
      component.todo = mockTodo;

      // Act: запускаем обнаружение изменений
      fixture.detectChanges();

      // Assert: проверяем что данные отобразились
      const titleElement = compiled.querySelector('[data-testid="title-1"]');
      expect(titleElement?.textContent?.trim()).toBe('Тестовая задача');
    });

    // Тест: проверка входного свойства isHighlighted
    it('должен отобразить индикатор выделения когда isHighlighted=true', () => {
      component.todo = mockTodo;
      component.isHighlighted = true;
      fixture.detectChanges();

      // Проверяем наличие индикатора выделения
      const indicator = compiled.querySelector('[data-testid="highlight-indicator"]');
      expect(indicator).toBeTruthy();
      expect(indicator?.textContent).toContain('Выделено');
    });

    // Тест: скрытие индикатора когда isHighlighted=false
    it('не должен отображать индикатор выделения когда isHighlighted=false', () => {
      component.todo = mockTodo;
      component.isHighlighted = false;
      fixture.detectChanges();

      const indicator = compiled.querySelector('[data-testid="highlight-indicator"]');
      expect(indicator).toBeFalsy();
    });

    // Тест: проверка входного свойства canEdit
    it('должен показать кнопку редактирования когда canEdit=true', () => {
      component.todo = mockTodo;
      component.canEdit = true;
      fixture.detectChanges();

      const editBtn = compiled.querySelector('[data-testid="edit-btn-1"]');
      expect(editBtn).toBeTruthy();
    });

    // Тест: скрытие кнопки редактирования когда canEdit=false
    it('не должен показывать кнопку редактирования когда canEdit=false', () => {
      component.todo = mockTodo;
      component.canEdit = false;
      fixture.detectChanges();

      const editBtn = compiled.querySelector('[data-testid="edit-btn-1"]');
      expect(editBtn).toBeFalsy();
    });

    // Тест: значения по умолчанию для Input свойств
    it('должен иметь значения по умолчанию для опциональных Input', () => {
      expect(component.isHighlighted).toBe(false);
      expect(component.canEdit).toBe(true);
    });
  });

  /**
   * Тесты @Output событий
   * Проверяют эмиссию событий из компонента
   */
  describe('@Output Events', () => {
    // Тест: эмиссия события toggleComplete
    it('должен эмитить toggleComplete с id задачи при клике на checkbox', () => {
      // Arrange: подготавливаем шпиона для отслеживания события
      spyOn(component.toggleComplete, 'emit');
      component.todo = mockTodo;
      fixture.detectChanges();

      // Act: кликаем на checkbox
      const checkbox = compiled.querySelector('[data-testid="checkbox-1"]') as HTMLInputElement;
      checkbox.click();

      // Assert: проверяем что событие было эмитировано с правильным id
      expect(component.toggleComplete.emit).toHaveBeenCalledWith(1);
      expect(component.toggleComplete.emit).toHaveBeenCalledTimes(1);
    });

    // Тест: эмиссия события deleteItem
    it('должен эмитить deleteItem с id задачи при клике на кнопку удаления', () => {
      spyOn(component.deleteItem, 'emit');
      component.todo = mockTodo;
      fixture.detectChanges();

      const deleteBtn = compiled.querySelector('[data-testid="delete-btn-1"]') as HTMLButtonElement;
      deleteBtn.click();

      expect(component.deleteItem.emit).toHaveBeenCalledWith(1);
    });

    // Тест: эмиссия события startEdit
    it('должен эмитить startEdit с объектом todo при клике на кнопку редактирования', () => {
      spyOn(component.startEdit, 'emit');
      component.todo = mockTodo;
      component.canEdit = true;
      fixture.detectChanges();

      const editBtn = compiled.querySelector('[data-testid="edit-btn-1"]') as HTMLButtonElement;
      editBtn.click();

      // Проверяем что эмитируется весь объект todo
      expect(component.startEdit.emit).toHaveBeenCalledWith(mockTodo);
    });

    // Тест: блокировка эмиссии startEdit когда canEdit=false
    it('не должен эмитить startEdit когда canEdit=false', () => {
      spyOn(component.startEdit, 'emit');
      component.todo = mockTodo;
      component.canEdit = false;

      // Вызываем метод напрямую
      component.onEdit();

      expect(component.startEdit.emit).not.toHaveBeenCalled();
    });

    // Тест: эмиссия события itemHovered при наведении мыши
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

    // Тест: эмиссия события itemHovered при уходе мыши
    it('должен эмитить itemHovered при уходе мыши', () => {
      spyOn(component.itemHovered, 'emit');
      component.todo = mockTodo;
      fixture.detectChanges();

      const item = compiled.querySelector('[data-testid="todo-item"]') as HTMLElement;

      // Симулируем событие mouseleave
      item.dispatchEvent(new MouseEvent('mouseleave'));

      expect(component.itemHovered.emit).toHaveBeenCalledWith({
        id: 1,
        hovered: false
      });
    });

    // Тест: подписка на Output события из родительского компонента
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
  });

  /**
   * Тесты рендеринга элементов
   * Проверяют правильность отображения DOM элементов
   */
  describe('Template Rendering', () => {
    // Тест: рендеринг заголовка задачи
    it('должен рендерить заголовок задачи', () => {
      component.todo = mockTodo;
      fixture.detectChanges();

      const title = compiled.querySelector('.todo-title');
      expect(title).toBeTruthy();
      expect(title?.textContent?.trim()).toBe('Тестовая задача');
    });

    // Тест: рендеринг статуса задачи
    it('должен отображать правильный статус для невыполненной задачи', () => {
      component.todo = mockTodo;
      fixture.detectChanges();

      const status = compiled.querySelector('[data-testid="status-1"]');
      expect(status?.textContent?.trim()).toBe('В процессе');
    });

    // Тест: рендеринг статуса выполненной задачи
    it('должен отображать правильный статус для выполненной задачи', () => {
      component.todo = completedTodo;
      fixture.detectChanges();

      const status = compiled.querySelector('[data-testid="status-2"]');
      expect(status?.textContent?.trim()).toBe('Выполнено');
    });

    // Тест: рендеринг даты создания
    it('должен отображать форматированную дату создания', () => {
      component.todo = mockTodo;
      fixture.detectChanges();

      const date = compiled.querySelector('[data-testid="date-1"]');
      expect(date).toBeTruthy();
      // Проверяем что дата отформатирована (содержит год)
      expect(date?.textContent).toContain('2024');
    });

    // Тест: рендеринг checkbox с правильным состоянием
    it('должен рендерить checkbox с правильным состоянием checked', () => {
      component.todo = completedTodo;
      fixture.detectChanges();

      const checkbox = compiled.querySelector('[data-testid="checkbox-2"]') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    // Тест: рендеринг checkbox для невыполненной задачи
    it('checkbox должен быть unchecked для невыполненной задачи', () => {
      component.todo = mockTodo;
      fixture.detectChanges();

      const checkbox = compiled.querySelector('[data-testid="checkbox-1"]') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
    });

    // Тест: наличие кнопки удаления всегда
    it('кнопка удаления должна быть всегда видна', () => {
      component.todo = mockTodo;
      component.canEdit = false; // Даже когда редактирование запрещено
      fixture.detectChanges();

      const deleteBtn = compiled.querySelector('[data-testid="delete-btn-1"]');
      expect(deleteBtn).toBeTruthy();
    });

    // Тест: рендеринг ARIA атрибутов для доступности
    it('должен добавлять ARIA атрибуты для доступности', () => {
      component.todo = mockTodo;
      fixture.detectChanges();

      const checkbox = compiled.querySelector('[data-testid="checkbox-1"]');
      const ariaLabel = checkbox?.getAttribute('aria-label');

      expect(ariaLabel).toContain('Отметить задачу');
      expect(ariaLabel).toContain(mockTodo.title);
    });
  });

  /**
   * Тесты CSS классов и стилей
   * Проверяют динамическое применение CSS классов
   */
  describe('CSS Classes and Styling', () => {
    // Тест: базовый класс todo-item всегда присутствует
    it('должен всегда иметь базовый класс todo-item', () => {
      component.todo = mockTodo;
      fixture.detectChanges();

      const item = compiled.querySelector('[data-testid="todo-item"]');
      expect(item?.classList.contains('todo-item')).toBe(true);
    });

    // Тест: класс completed для выполненной задачи
    it('должен добавить класс completed для выполненной задачи', () => {
      component.todo = completedTodo;
      fixture.detectChanges();

      const item = compiled.querySelector('[data-testid="todo-item"]');
      expect(item?.classList.contains('completed')).toBe(true);
    });

    // Тест: отсутствие класса completed для невыполненной задачи
    it('не должен добавлять класс completed для невыполненной задачи', () => {
      component.todo = mockTodo;
      fixture.detectChanges();

      const item = compiled.querySelector('[data-testid="todo-item"]');
      expect(item?.classList.contains('completed')).toBe(false);
    });

    // Тест: класс highlighted при выделении
    it('должен добавить класс highlighted когда isHighlighted=true', () => {
      component.todo = mockTodo;
      component.isHighlighted = true;
      fixture.detectChanges();

      const item = compiled.querySelector('[data-testid="todo-item"]');
      expect(item?.classList.contains('highlighted')).toBe(true);
    });

    // Тест: класс read-only когда редактирование запрещено
    it('должен добавить класс read-only когда canEdit=false', () => {
      component.todo = mockTodo;
      component.canEdit = false;
      fixture.detectChanges();

      const item = compiled.querySelector('[data-testid="todo-item"]');
      expect(item?.classList.contains('read-only')).toBe(true);
    });

    // Тест: метод getItemClasses возвращает правильные классы
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

    // Тест: динамическое изменение классов при изменении Input
    it('должен обновить классы при изменении Input свойств', () => {
      component.todo = mockTodo;
      component.isHighlighted = false;
      fixture.detectChanges();

      let item = compiled.querySelector('[data-testid="todo-item"]');
      expect(item?.classList.contains('highlighted')).toBe(false);

      // Изменяем Input свойство
      component.isHighlighted = true;
      fixture.detectChanges();

      item = compiled.querySelector('[data-testid="todo-item"]');
      expect(item?.classList.contains('highlighted')).toBe(true);
    });
  });

  /**
   * Тесты методов компонента
   * Проверяют логику работы публичных методов
   */
  describe('Component Methods', () => {
    // Тест: метод getStatusText
    it('getStatusText должен возвращать "В процессе" для невыполненной задачи', () => {
      component.todo = mockTodo;
      expect(component.getStatusText()).toBe('В процессе');
    });

    it('getStatusText должен возвращать "Выполнено" для выполненной задачи', () => {
      component.todo = completedTodo;
      expect(component.getStatusText()).toBe('Выполнено');
    });

    // Тест: метод getFormattedDate
    it('getFormattedDate должен форматировать дату в читаемый вид', () => {
      component.todo = mockTodo;
      const formatted = component.getFormattedDate();

      // Проверяем что дата содержит основные элементы
      expect(formatted).toContain('2024');
      expect(formatted).toContain('январ'); // Часть слова "января"
      expect(formatted).toContain('15');
    });

    // Тест: методы обработчиков событий
    it('onToggle должен эмитить событие с id задачи', () => {
      spyOn(component.toggleComplete, 'emit');
      component.todo = mockTodo;

      component.onToggle();

      expect(component.toggleComplete.emit).toHaveBeenCalledWith(1);
    });

    it('onDelete должен эмитить событие с id задачи', () => {
      spyOn(component.deleteItem, 'emit');
      component.todo = mockTodo;

      component.onDelete();

      expect(component.deleteItem.emit).toHaveBeenCalledWith(1);
    });

    it('onEdit должен эмитить событие только когда canEdit=true', () => {
      spyOn(component.startEdit, 'emit');
      component.todo = mockTodo;

      // Когда разрешено редактирование
      component.canEdit = true;
      component.onEdit();
      expect(component.startEdit.emit).toHaveBeenCalledWith(mockTodo);

      // Сбрасываем счетчик
      (component.startEdit.emit as jasmine.Spy).calls.reset();

      // Когда запрещено редактирование
      component.canEdit = false;
      component.onEdit();
      expect(component.startEdit.emit).not.toHaveBeenCalled();
    });
  });

  /**
   * Тесты интеграции с родительским компонентом
   * Проверяют как компонент взаимодействует с родителем
   */
  describe('Parent Component Integration', () => {
    // Тест: симуляция использования в родительском компоненте
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

    // Тест: изменение Input свойств после инициализации
    it('должен реагировать на изменение Input свойств после инициализации', () => {
      // Начальное состояние
      component.todo = mockTodo;
      component.isHighlighted = false;
      fixture.detectChanges();

      expect(compiled.querySelector('.highlight-indicator')).toBeFalsy();

      // Изменяем через родительский компонент
      component.isHighlighted = true;
      fixture.detectChanges();

      // Проверяем что отображение обновилось
      expect(compiled.querySelector('.highlight-indicator')).toBeTruthy();
    });

    // Тест: множественные подписки на Output события
    it('должен поддерживать множественные подписки на Output события', () => {
      component.todo = mockTodo;

      let subscriber1Called = false;
      let subscriber2Called = false;

      // Две подписки на одно событие
      component.toggleComplete.subscribe(() => subscriber1Called = true);
      component.toggleComplete.subscribe(() => subscriber2Called = true);

      // Эмитируем событие
      component.onToggle();

      // Обе подписки должны сработать
      expect(subscriber1Called).toBe(true);
      expect(subscriber2Called).toBe(true);
    });
  });

  /**
   * Тесты граничных случаев и обработки ошибок
   */
  describe('Edge Cases', () => {
    // Тест: обработка длинных заголовков
    it('должен корректно отображать длинный заголовок', () => {
      const longTitle = 'Очень длинный заголовок задачи который может не поместиться в одну строку и требует переноса';
      component.todo = { ...mockTodo, title: longTitle };
      fixture.detectChanges();

      const title = compiled.querySelector('.todo-title');
      expect(title?.textContent).toContain(longTitle);
    });

    // Тест: обработка специальных символов в заголовке
    it('должен корректно отображать специальные символы', () => {
      const specialTitle = '<script>alert("XSS")</script> & "quotes"';
      component.todo = { ...mockTodo, title: specialTitle };
      fixture.detectChanges();

      const title = compiled.querySelector('.todo-title');
      // Angular автоматически экранирует HTML
      expect(title?.textContent).toContain(specialTitle);
      // Проверяем что скрипт НЕ был выполнен (просто отображен как текст)
      expect(compiled.querySelector('script')).toBeFalsy();
    });

    // Тест: обработка будущих дат
    it('должен корректно отображать будущую дату', () => {
      const futureDate = new Date('2099-12-31');
      component.todo = { ...mockTodo, createdAt: futureDate };
      fixture.detectChanges();

      const formattedDate = component.getFormattedDate();
      expect(formattedDate).toContain('2099');
    });
  });
});

