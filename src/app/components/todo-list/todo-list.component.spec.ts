/**
 * Тесты для TodoListComponent
 *
 * Этот файл содержит интеграционные тесты компонента, которые проверяют:
 * - Инициализацию компонента и его зависимостей
 * - Рендеринг шаблона и отображение данных
 * - Взаимодействие пользователя (клики, ввод текста)
 * - Интеграцию с сервисом (через моки)
 * - Обработку асинхронных операций
 * - Управление состоянием (загрузка, редактирование, ошибки)
 */

import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { of, throwError, delay } from 'rxjs';
import { TodoListComponent } from './todo-list.component';
import { TodoService } from '../../services/todo.service';
import { Todo } from '../../models/todo.model';

describe('TodoListComponent', () => {
  let component: TodoListComponent;
  let fixture: ComponentFixture<TodoListComponent>;
  let todoService: jasmine.SpyObj<TodoService>;
  let compiled: HTMLElement;

  // Тестовые данные: массив задач для моков
  const mockTodos: Todo[] = [
    { id: 1, title: 'Test Todo 1', completed: false, createdAt: new Date() },
    { id: 2, title: 'Test Todo 2', completed: true, createdAt: new Date() },
    { id: 3, title: 'Test Todo 3', completed: false, createdAt: new Date() }
  ];

  // Выполняется перед каждым тестом
  // Настраивает тестовое окружение с моками
  beforeEach(async () => {
    // Создаем spy объект (мок) для TodoService
    // Это позволяет контролировать поведение сервиса и проверять вызовы
    const todoServiceSpy = jasmine.createSpyObj('TodoService', [
      'getTodos',
      'getTodoById',
      'addTodo',
      'toggleTodo',
      'deleteTodo',
      'updateTodo',
      'getStats',
      'clearCompleted'
    ]);

    // Конфигурируем тестовый модуль
    await TestBed.configureTestingModule({
      imports: [TodoListComponent, FormsModule],
      providers: [
        { provide: TodoService, useValue: todoServiceSpy } // Подменяем реальный сервис моком
      ]
    }).compileComponents();

    // Получаем ссылку на мок сервиса
    todoService = TestBed.inject(TodoService) as jasmine.SpyObj<TodoService>;

    // Настраиваем поведение моков по умолчанию
    todoService.getTodos.and.returnValue(of(mockTodos));
    todoService.getStats.and.returnValue({ total: 3, completed: 1, pending: 2 });

    // Создаем экземпляр компонента для тестирования
    fixture = TestBed.createComponent(TodoListComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
  });

  // Базовый тест: проверяет что компонент создается
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Тесты инициализации компонента
   * Проверяют начальное состояние и вызовы методов при создании
   */
  describe('Component Initialization', () => {
    // Проверяет что при инициализации вызывается метод получения задач
    it('should call getTodos on init', () => {
      fixture.detectChanges(); // Запускает ngOnInit
      expect(todoService.getTodos).toHaveBeenCalled();
    });

    // Проверяет что статистика инициализируется при запуске
    it('should initialize stats on init', () => {
      fixture.detectChanges();
      expect(component.stats).toEqual({ total: 3, completed: 1, pending: 2 });
    });

    // Проверяет начальное состояние поля ввода
    it('should have empty newTodoTitle initially', () => {
      expect(component.newTodoTitle).toBe('');
    });

    // Проверяет что изначально не активен режим редактирования
    it('should not be in editing mode initially', () => {
      expect(component.editingTodoId).toBeNull();
    });
  });

  /**
   * Тесты рендеринга шаблона
   * Проверяют отображение элементов UI на основе данных компонента
   */
  describe('Template Rendering', () => {
    // Проверяет отображение заголовка страницы
    it('should display the title', () => {
      fixture.detectChanges();
      const h1 = compiled.querySelector('h1');
      expect(h1?.textContent).toContain('Todo List with Testing');
    });

    // Проверяет правильное отображение статистики
    it('should display stats correctly', () => {
      fixture.detectChanges();

      // Ищем элементы статистики по data-testid
      const totalCount = compiled.querySelector('[data-testid="total-count"]');
      const completedCount = compiled.querySelector('[data-testid="completed-count"]');
      const pendingCount = compiled.querySelector('[data-testid="pending-count"]');

      // Проверяем значения
      expect(totalCount?.textContent).toBe('3');
      expect(completedCount?.textContent).toBe('1');
      expect(pendingCount?.textContent).toBe('2');
    });

    // Проверяет рендеринг списка задач
    it('should render todo items', () => {
      fixture.detectChanges();

      // Находим все элементы задач
      const todoItems = compiled.querySelectorAll('[data-testid^="todo-item-"]');
      expect(todoItems.length).toBe(3);
    });

    // Проверяет отображение заголовков задач
    it('should display todo titles', () => {
      fixture.detectChanges();

      const firstTitle = compiled.querySelector('[data-testid="title-1"]');
      const secondTitle = compiled.querySelector('[data-testid="title-2"]');

      expect(firstTitle?.textContent?.trim()).toBe('Test Todo 1');
      expect(secondTitle?.textContent?.trim()).toBe('Test Todo 2');
    });

    // Проверяет применение CSS класса к выполненным задачам
    it('should apply completed class to completed todos', () => {
      fixture.detectChanges();

      const todo1 = compiled.querySelector('[data-testid="todo-item-1"]');
      const todo2 = compiled.querySelector('[data-testid="todo-item-2"]');

      expect(todo1?.classList.contains('completed')).toBe(false);
      expect(todo2?.classList.contains('completed')).toBe(true);
    });

    // Проверяет отображение пустого состояния
    it('should display empty state when no todos', () => {
      // Мокируем пустой список
      todoService.getTodos.and.returnValue(of([]));
      fixture.detectChanges();

      const emptyState = compiled.querySelector('[data-testid="empty-state"]');
      expect(emptyState).toBeTruthy();
      expect(emptyState?.textContent).toContain('No todos yet');
    });

    // Проверяет отображение кнопки очистки когда есть выполненные задачи
    it('should show clear completed button when there are completed todos', () => {
      fixture.detectChanges();

      const clearButton = compiled.querySelector('[data-testid="clear-completed-button"]');
      expect(clearButton).toBeTruthy();
    });

    // Проверяет скрытие кнопки очистки когда нет выполненных задач
    it('should not show clear completed button when no completed todos', () => {
      todoService.getStats.and.returnValue({ total: 2, completed: 0, pending: 2 });
      fixture.detectChanges();

      const clearButton = compiled.querySelector('[data-testid="clear-completed-button"]');
      expect(clearButton).toBeFalsy();
    });
  });

  /**
   * Тесты метода addTodo
   * Проверяют добавление новых задач и валидацию
   */
  describe('addTodo', () => {
    // Проверяет успешное добавление задачи с валидным заголовком
    it('should add a todo when title is valid', fakeAsync(() => {
      const newTodo: Todo = { id: 4, title: 'New Todo', completed: false, createdAt: new Date() };
      // Мокируем асинхронный ответ сервиса
      todoService.addTodo.and.returnValue(of(newTodo).pipe(delay(100)));

      component.newTodoTitle = 'New Todo';
      component.addTodo();

      // Проверяем что установлен флаг загрузки
      expect(component.isLoading).toBe(true);

      // Симулируем прохождение 100мс
      tick(100);

      // Проверяем результат
      expect(todoService.addTodo).toHaveBeenCalledWith('New Todo');
      expect(component.newTodoTitle).toBe(''); // Поле очищено
      expect(component.isLoading).toBe(false); // Загрузка завершена
    }));

    // Проверяет валидацию: пустой заголовок
    it('should show error when title is empty', () => {
      component.newTodoTitle = '';
      component.addTodo();

      expect(component.errorMessage).toBe('Please enter a todo title');
      expect(todoService.addTodo).not.toHaveBeenCalled();
    });

    // Проверяет валидацию: слишком короткий заголовок
    it('should show error when title is too short', () => {
      component.newTodoTitle = 'ab';
      component.addTodo();

      expect(component.errorMessage).toBe('Title must be at least 3 characters');
      expect(todoService.addTodo).not.toHaveBeenCalled();
    });

    // Проверяет что пробелы обрезаются
    it('should trim whitespace from title', fakeAsync(() => {
      const newTodo: Todo = { id: 4, title: 'Valid Title', completed: false, createdAt: new Date() };
      todoService.addTodo.and.returnValue(of(newTodo).pipe(delay(100)));

      component.newTodoTitle = '  Valid Title  ';
      component.addTodo();
      tick(100);

      // Проверяем что пробелы удалены
      expect(todoService.addTodo).toHaveBeenCalledWith('Valid Title');
    }));

    // Проверяет обновление статистики после добавления
    it('should update stats after adding todo', fakeAsync(() => {
      const newTodo: Todo = { id: 4, title: 'New Todo', completed: false, createdAt: new Date() };
      todoService.addTodo.and.returnValue(of(newTodo).pipe(delay(100)));

      component.newTodoTitle = 'New Todo';
      component.addTodo();
      tick(100);

      expect(todoService.getStats).toHaveBeenCalled();
    }));

    // Проверяет обработку ошибки при добавлении
    it('should handle error when adding todo fails', fakeAsync(() => {
      // Мокируем ошибку
      todoService.addTodo.and.returnValue(throwError(() => new Error('Failed')));

      component.newTodoTitle = 'New Todo';
      component.addTodo();
      tick();

      // Проверяем обработку ошибки
      expect(component.errorMessage).toBe('Failed to add todo');
      expect(component.isLoading).toBe(false);
    }));
  });

  /**
   * Тесты взаимодействия пользователя
   * Проверяют обработку кликов, ввода текста и других событий
   */
  describe('User Interactions', () => {
    // Проверяет вызов addTodo при клике на кнопку
    it('should call addTodo when add button is clicked', () => {
      spyOn(component, 'addTodo');
      fixture.detectChanges();

      const addButton = compiled.querySelector('[data-testid="add-button"]') as HTMLButtonElement;
      addButton.click();

      expect(component.addTodo).toHaveBeenCalled();
    });

    // Проверяет вызов addTodo при нажатии Enter
    it('should call addTodo when Enter key is pressed in input', () => {
      spyOn(component, 'addTodo');
      fixture.detectChanges();

      const input = compiled.querySelector('[data-testid="todo-input"]') as HTMLInputElement;
      const event = new KeyboardEvent('keyup', { key: 'Enter' });
      input.dispatchEvent(event);

      expect(component.addTodo).toHaveBeenCalled();
    });

    // Проверяет установку флага загрузки во время добавления задачи
    it('should set loading flag when adding todo', fakeAsync(() => {
      const newTodo: Todo = { id: 4, title: 'New Todo', completed: false, createdAt: new Date() };
      todoService.addTodo.and.returnValue(of(newTodo).pipe(delay(100)));

      component.newTodoTitle = 'New Todo';

      // Перед вызовом addTodo флаг загрузки false
      expect(component.isLoading).toBe(false);

      // Вызываем addTodo который устанавливает isLoading = true
      component.addTodo();

      // Проверяем что флаг загрузки установлен
      expect(component.isLoading).toBe(true);

      // Завершаем асинхронную операцию
      tick(100);

      // После завершения загрузки флаг сбрасывается
      expect(component.isLoading).toBe(false);
      expect(component.newTodoTitle).toBe(''); // Поле очищено
    }));
  });

  /**
   * Тесты метода toggleTodo
   * Проверяют переключение статуса выполнения задачи
   */
  describe('toggleTodo', () => {
    // Проверяет вызов метода сервиса с правильным ID
    it('should call todoService.toggleTodo with correct id', () => {
      todoService.toggleTodo.and.returnValue(true);

      component.toggleTodo(1);

      expect(todoService.toggleTodo).toHaveBeenCalledWith(1);
    });

    // Проверяет обновление статистики после переключения
    it('should update stats after toggling', () => {
      todoService.toggleTodo.and.returnValue(true);

      component.toggleTodo(1);

      expect(todoService.getStats).toHaveBeenCalled();
    });

    // Проверяет переключение при клике на checkbox
    it('should toggle when checkbox is clicked', () => {
      spyOn(component, 'toggleTodo');
      fixture.detectChanges();

      const checkbox = compiled.querySelector('[data-testid="toggle-1"]') as HTMLInputElement;
      checkbox.click();

      expect(component.toggleTodo).toHaveBeenCalledWith(1);
    });
  });

  /**
   * Тесты метода deleteTodo
   * Проверяют удаление задач
   */
  describe('deleteTodo', () => {
    // Проверяет вызов метода сервиса с правильным ID
    it('should call todoService.deleteTodo with correct id', () => {
      todoService.deleteTodo.and.returnValue(true);

      component.deleteTodo(1);

      expect(todoService.deleteTodo).toHaveBeenCalledWith(1);
    });

    // Проверяет обновление статистики после удаления
    it('should update stats after deletion', () => {
      todoService.deleteTodo.and.returnValue(true);

      component.deleteTodo(1);

      expect(todoService.getStats).toHaveBeenCalled();
    });

    // Проверяет удаление при клике на кнопку
    it('should delete when delete button is clicked', () => {
      spyOn(component, 'deleteTodo');
      fixture.detectChanges();

      const deleteButton = compiled.querySelector('[data-testid="delete-button-1"]') as HTMLButtonElement;
      deleteButton.click();

      expect(component.deleteTodo).toHaveBeenCalledWith(1);
    });
  });

  /**
   * Тесты функциональности редактирования
   * Проверяют переход в режим редактирования, сохранение и отмену
   */
  describe('Edit Functionality', () => {
    // Проверяет вход в режим редактирования
    it('should enter edit mode when edit button is clicked', () => {
      fixture.detectChanges();

      const editButton = compiled.querySelector('[data-testid="edit-button-1"]') as HTMLButtonElement;
      editButton.click();
      fixture.detectChanges();

      // Проверяем что установлен ID редактируемой задачи
      expect(component.editingTodoId).toBe(1);
      expect(component.editingTitle).toBe('Test Todo 1');
    });

    // Проверяет отображение поля ввода в режиме редактирования
    it('should show edit input in edit mode', () => {
      fixture.detectChanges();
      component.startEdit(mockTodos[0]);
      fixture.detectChanges();

      const editInput = compiled.querySelector('[data-testid="edit-input-1"]');
      expect(editInput).toBeTruthy();
    });

    // Проверяет сохранение изменений
    it('should save edit when save button is clicked', () => {
      todoService.updateTodo.and.returnValue(true);
      fixture.detectChanges();

      component.startEdit(mockTodos[0]);
      component.editingTitle = 'Updated Title';
      component.saveEdit(1);

      // Проверяем что вызван метод обновления
      expect(todoService.updateTodo).toHaveBeenCalledWith(1, 'Updated Title');
      // Проверяем выход из режима редактирования
      expect(component.editingTodoId).toBeNull();
    });

    // Проверяет валидацию при сохранении
    it('should not save edit if title is too short', () => {
      component.editingTodoId = 1;
      component.editingTitle = 'ab';
      component.saveEdit(1);

      // Проверяем что сохранение не произошло
      expect(todoService.updateTodo).not.toHaveBeenCalled();
      // Остаемся в режиме редактирования
      expect(component.editingTodoId).toBe(1);
    });

    // Проверяет отмену редактирования
    it('should cancel edit when cancel button is clicked', () => {
      fixture.detectChanges();
      component.startEdit(mockTodos[0]);
      fixture.detectChanges();

      const cancelButton = compiled.querySelector('[data-testid="cancel-edit-button"]') as HTMLButtonElement;
      cancelButton.click();

      // Проверяем выход из режима редактирования
      expect(component.editingTodoId).toBeNull();
      expect(component.editingTitle).toBe('');
    });
  });

  /**
   * Тесты метода clearCompleted
   * Проверяют удаление всех выполненных задач
   */
  describe('clearCompleted', () => {
    // Проверяет вызов метода сервиса
    it('should call todoService.clearCompleted', () => {
      todoService.clearCompleted.and.returnValue(1);

      component.clearCompleted();

      expect(todoService.clearCompleted).toHaveBeenCalled();
    });

    // Проверяет обновление статистики после очистки
    it('should update stats after clearing', () => {
      todoService.clearCompleted.and.returnValue(1);

      component.clearCompleted();

      expect(todoService.getStats).toHaveBeenCalled();
    });

    // Проверяет очистку при клике на кнопку
    it('should clear when clear completed button is clicked', () => {
      spyOn(component, 'clearCompleted');
      fixture.detectChanges();

      const clearButton = compiled.querySelector('[data-testid="clear-completed-button"]') as HTMLButtonElement;
      clearButton.click();

      expect(component.clearCompleted).toHaveBeenCalled();
    });
  });

  /**
   * Тесты обработки ошибок
   * Проверяют отображение сообщений об ошибках
   */
  describe('Error Handling', () => {
    // Проверяет отображение сообщения об ошибке
    it('should display error message when present', () => {
      component.errorMessage = 'Test error message';
      fixture.detectChanges();

      const errorElement = compiled.querySelector('[data-testid="error-message"]');
      expect(errorElement).toBeTruthy();
      expect(errorElement?.textContent).toContain('Test error message');
    });

    // Проверяет скрытие сообщения когда ошибки нет
    it('should not display error message when empty', () => {
      component.errorMessage = '';
      fixture.detectChanges();

      const errorElement = compiled.querySelector('[data-testid="error-message"]');
      expect(errorElement).toBeFalsy();
    });
  });

  /**
   * Тесты функции TrackBy
   * Проверяют оптимизацию рендеринга списков
   */
  describe('TrackBy Function', () => {
    // Проверяет что функция возвращает ID задачи
    it('should return todo id for trackBy', () => {
      const result = component.trackByTodoId(0, mockTodos[0]);
      expect(result).toBe(1);
    });

    // Проверяет эффективность отслеживания элементов Angular
    it('should help Angular track todos efficiently', () => {
      fixture.detectChanges();
      const initialElements = compiled.querySelectorAll('[data-testid^="todo-item-"]');

      // Обновляем задачи
      const updatedTodos = [...mockTodos];
      updatedTodos[0] = { ...mockTodos[0], title: 'Updated' };
      todoService.getTodos.and.returnValue(of(updatedTodos));

      fixture.detectChanges();
      const updatedElements = compiled.querySelectorAll('[data-testid^="todo-item-"]');

      // Количество элементов должно остаться прежним
      expect(updatedElements.length).toBe(initialElements.length);
    });
  });
});
