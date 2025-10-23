/**
 * Примеры использования Jasmine Spy методов
 *
 * Этот файл демонстрирует продвинутые техники работы со шпионами (spies)
 * для детального тестирования и отслеживания вызовов методов.
 *
 * Рассматриваемые методы и свойства:
 * - spy.calls.args() - получение всех аргументов всех вызовов
 * - spy.calls.argsFor(index) - получение аргументов конкретного вызова
 * - spy.calls.object - получение контекста (this) при вызове
 * - spy.calls.returnValue - получение возвращаемого значения
 * - and.stub() - создание заглушки без действий
 * - and.identity() - возврат первого аргумента как есть
 */

import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TodoService } from '../services/todo.service';
import { Todo } from '../models/todo.model';

describe('Spy Methods Examples - Примеры методов spy', () => {

  /**
   * ==========================================
   * ПРИМЕР 1: spy.calls.args()
   * ==========================================
   * Получение массива всех аргументов всех вызовов метода
   */
  describe('spy.calls.args() - Отслеживание всех аргументов', () => {

    it('должен отслеживать аргументы всех вызовов метода', () => {
      // Создаем мок сервиса с методом addTodo
      const todoService = jasmine.createSpyObj('TodoService', ['addTodo']);

      // Настраиваем возврат значений для каждого вызова
      const mockTodo1: Todo = { id: 1, title: 'Первая задача', completed: false, createdAt: new Date() };
      const mockTodo2: Todo = { id: 2, title: 'Вторая задача', completed: false, createdAt: new Date() };
      const mockTodo3: Todo = { id: 3, title: 'Третья задача', completed: false, createdAt: new Date() };

      todoService.addTodo.and.returnValues(
        of(mockTodo1),
        of(mockTodo2),
        of(mockTodo3)
      );

      // Вызываем метод несколько раз с разными аргументами
      todoService.addTodo('Первая задача');
      todoService.addTodo('Вторая задача');
      todoService.addTodo('Третья задача');

      // Получаем массив всех аргументов всех вызовов
      const allArgs = todoService.addTodo.calls.args();

      // Проверяем структуру: массив массивов аргументов
      expect(allArgs).toEqual([
        ['Первая задача'],
        ['Вторая задача'],
        ['Третья задача']
      ]);

      // Проверяем количество вызовов
      expect(todoService.addTodo.calls.count()).toBe(3);
    });

    it('должен отслеживать аргументы при множественных параметрах', () => {
      // Создаем spy для метода с несколькими параметрами
      const apiService = jasmine.createSpyObj('ApiService', ['request']);

      apiService.request('GET', '/users', { page: 1 });
      apiService.request('POST', '/todos', { title: 'Test' });
      apiService.request('DELETE', '/todos/1');

      // Получаем все аргументы
      const allArgs = apiService.request.calls.args();

      // Проверяем что каждый вызов сохранил все свои аргументы
      expect(allArgs[0]).toEqual(['GET', '/users', { page: 1 }]);
      expect(allArgs[1]).toEqual(['POST', '/todos', { title: 'Test' }]);
      expect(allArgs[2]).toEqual(['DELETE', '/todos/1']);
    });

    it('должен получать аргументы конкретного вызова через argsFor()', () => {
      const service = jasmine.createSpyObj('DataService', ['saveData']);

      service.saveData('item1', { value: 100 });
      service.saveData('item2', { value: 200 });
      service.saveData('item3', { value: 300 });

      // Получаем аргументы конкретного вызова по индексу (начиная с 0)
      expect(service.saveData.calls.argsFor(0)).toEqual(['item1', { value: 100 }]);
      expect(service.saveData.calls.argsFor(1)).toEqual(['item2', { value: 200 }]);
      expect(service.saveData.calls.argsFor(2)).toEqual(['item3', { value: 300 }]);

      // Альтернативный способ - через first() и mostRecent()
      expect(service.saveData.calls.first().args).toEqual(['item1', { value: 100 }]);
      expect(service.saveData.calls.mostRecent().args).toEqual(['item3', { value: 300 }]);
    });
  });

  /**
   * ==========================================
   * ПРИМЕР 2: spy.calls.object
   * ==========================================
   * Получение контекста (this) при котором был вызван метод
   */
  describe('spy.calls.object - Отслеживание контекста вызова', () => {

    it('должен отслеживать контекст (this) при вызове метода', () => {
      // Создаем объект с методом
      const myObject = {
        name: 'Test Object',
        count: 0,
        increment: function() {
          this.count++;
          return this.count;
        }
      };

      // Создаем spy на метод объекта
      const incrementSpy = spyOn(myObject, 'increment').and.callThrough();

      // Вызываем метод в контексте объекта
      myObject.increment();

      // Проверяем, что метод был вызван в контексте myObject
      expect(incrementSpy.calls.first().object).toBe(myObject);
      expect(incrementSpy.calls.mostRecent().object).toBe(myObject);
    });

    it('должен отслеживать разные контексты при биндинге', () => {
      const service = {
        processData: function(data: string) {
          return data;
        }
      };

      const processDataSpy = spyOn(service, 'processData').and.callThrough();

      // Вызываем в контексте service
      service.processData('test1');

      // Вызываем с другим контекстом через call
      const anotherContext = { name: 'another' };
      service.processData.call(anotherContext, 'test2');

      // Проверяем контексты вызовов
      expect(processDataSpy.calls.argsFor(0)).toEqual(['test1']);
      expect(processDataSpy.calls.argsFor(1)).toEqual(['test2']);

      // Первый вызов был в контексте service
      expect(processDataSpy.calls.all()[0].object).toBe(service);
    });

    it('должен проверять контекст в методах компонента', () => {
      // Симулируем компонент
      const component = {
        todos: [] as Todo[],
        loadTodos: function() {
          // this.todos будет работать только если контекст правильный
          return this.todos;
        }
      };

      const loadTodosSpy = spyOn(component, 'loadTodos').and.callThrough();

      // Вызываем метод
      component.loadTodos();

      // Проверяем что метод был вызван в контексте компонента
      const call = loadTodosSpy.calls.first();
      expect(call.object).toBe(component);
      expect((call.object as any).todos).toBeDefined();
    });
  });

  /**
   * ==========================================
   * ПРИМЕР 3: spy.calls.returnValue
   * ==========================================
   * Получение возвращаемых значений каждого вызова
   */
  describe('spy.calls.returnValue - Отслеживание возвращаемых значений', () => {

    it('должен отслеживать возвращаемые значения каждого вызова', () => {
      const calculator = {
        add: (a: number, b: number) => a + b,
        multiply: (a: number, b: number) => a * b
      };

      // Создаем spy который вызывает реальную функцию
      const addSpy = spyOn(calculator, 'add').and.callThrough();

      // Делаем несколько вызовов
      calculator.add(2, 3);
      calculator.add(5, 7);
      calculator.add(10, 20);

      // Проверяем возвращаемые значения каждого вызова
      expect(addSpy.calls.first().returnValue).toBe(5);
      expect(addSpy.calls.all()[1].returnValue).toBe(12);
      expect(addSpy.calls.mostRecent().returnValue).toBe(30);
    });

    it('должен работать с Observable возвращаемыми значениями', (done) => {
      const todoService = jasmine.createSpyObj('TodoService', ['getTodos']);
      const mockTodos: Todo[] = [
        { id: 1, title: 'Test', completed: false, createdAt: new Date() }
      ];

      // Настраиваем возврат Observable
      const observable = of(mockTodos);
      todoService.getTodos.and.returnValue(observable);

      // Вызываем метод
      const result = todoService.getTodos();

      // Проверяем возвращаемое значение
      expect(todoService.getTodos.calls.first().returnValue).toBe(observable);

      // Проверяем что Observable работает
      result.subscribe((todos: Todo[]) => {
        expect(todos).toEqual(mockTodos);
        done();
      });
    });

    it('должен отслеживать разные возвращаемые значения', () => {
      const service = jasmine.createSpyObj('StatusService', ['getStatus']);

      // Настраиваем разные возвращаемые значения для последовательных вызовов
      service.getStatus.and.returnValues('pending', 'loading', 'success', 'error');

      // Делаем вызовы
      service.getStatus();
      service.getStatus();
      service.getStatus();
      service.getStatus();

      // Проверяем каждое возвращаемое значение
      expect(service.getStatus.calls.all()[0].returnValue).toBe('pending');
      expect(service.getStatus.calls.all()[1].returnValue).toBe('loading');
      expect(service.getStatus.calls.all()[2].returnValue).toBe('success');
      expect(service.getStatus.calls.all()[3].returnValue).toBe('error');
    });

    it('должен проверять возвращаемые значения при ошибках', () => {
      const service = jasmine.createSpyObj('ErrorService', ['validateData']);

      // Настраиваем возврат разных значений включая null и undefined
      service.validateData.and.returnValues(true, false, null, undefined);

      service.validateData({ valid: true });
      service.validateData({ valid: false });
      service.validateData(null);
      service.validateData(undefined);

      // Проверяем все возвращаемые значения
      expect(service.validateData.calls.argsFor(0)).toEqual([{ valid: true }]);
      expect(service.validateData.calls.all()[0].returnValue).toBe(true);

      expect(service.validateData.calls.argsFor(1)).toEqual([{ valid: false }]);
      expect(service.validateData.calls.all()[1].returnValue).toBe(false);

      expect(service.validateData.calls.all()[2].returnValue).toBeNull();
      expect(service.validateData.calls.all()[3].returnValue).toBeUndefined();
    });
  });

  /**
   * ==========================================
   * ПРИМЕР 4: and.stub()
   * ==========================================
   * Создание заглушки без действий (поведение по умолчанию)
   */
  describe('and.stub() - Заглушка без действий', () => {

    it('должен создать заглушку которая ничего не возвращает', () => {
      const service = jasmine.createSpyObj('UserService', ['getUser']);

      // По умолчанию spy уже работает как stub (возвращает undefined)
      const result = service.getUser(1);

      expect(service.getUser).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });

    it('должен явно установить stub поведение', () => {
      const notificationService = jasmine.createSpyObj('NotificationService', ['notify']);

      // Явно устанавливаем stub поведение
      notificationService.notify.and.stub();

      const result = notificationService.notify('Test message');

      // Метод был вызван, но ничего не вернул
      expect(notificationService.notify).toHaveBeenCalledWith('Test message');
      expect(result).toBeUndefined();
    });

    it('должен сбросить spy обратно к stub после настройки', () => {
      const service = jasmine.createSpyObj('LogService', ['log']);

      // Сначала настраиваем возврат значения
      service.log.and.returnValue(true);
      expect(service.log('test1')).toBe(true);

      // Затем сбрасываем обратно к stub
      service.log.and.stub();
      expect(service.log('test2')).toBeUndefined();

      // Проверяем что оба вызова были зарегистрированы
      expect(service.log.calls.count()).toBe(2);
      expect(service.log.calls.argsFor(0)).toEqual(['test1']);
      expect(service.log.calls.argsFor(1)).toEqual(['test2']);
    });

    it('должен использовать stub для изоляции тестов', () => {
      const externalService = jasmine.createSpyObj('ExternalService', [
        'fetchData',
        'sendData',
        'clearCache'
      ]);

      // Все методы работают как stubs - не выполняют реальную логику
      externalService.fetchData.and.stub();
      externalService.sendData.and.stub();
      externalService.clearCache.and.stub();

      // Вызываем методы - они не делают ничего, но мы можем проверить вызовы
      externalService.fetchData('/api/data');
      externalService.sendData({ id: 1 });
      externalService.clearCache();

      // Проверяем что методы были вызваны с правильными аргументами
      expect(externalService.fetchData).toHaveBeenCalledWith('/api/data');
      expect(externalService.sendData).toHaveBeenCalledWith({ id: 1 });
      expect(externalService.clearCache).toHaveBeenCalled();

      // Все возвращают undefined
      expect(externalService.fetchData.calls.mostRecent().returnValue).toBeUndefined();
    });

    it('должен переключаться между stub и другими стратегиями', () => {
      const service = jasmine.createSpyObj('FlexibleService', ['process']);

      // Начинаем со stub
      service.process.and.stub();
      expect(service.process('data1')).toBeUndefined();

      // Переключаемся на returnValue
      service.process.and.returnValue('processed');
      expect(service.process('data2')).toBe('processed');

      // Возвращаемся к stub
      service.process.and.stub();
      expect(service.process('data3')).toBeUndefined();

      // Все три вызова зарегистрированы
      expect(service.process.calls.count()).toBe(3);
    });
  });

  /**
   * ==========================================
   * ПРИМЕР 5: and.identity()
   * ==========================================
   * Возврат первого аргумента как есть (pass-through)
   */
  describe('and.identity() - Возврат первого аргумента', () => {

    it('должен вернуть первый аргумент без изменений', () => {
      const transformer: any = jasmine.createSpy('transform').and.callFake((x: any) => x);

      const input = { id: 1, name: 'Test', value: 100 };
      const result = transformer(input);

      // Результат - это тот же объект без изменений
      expect(result).toBe(input);
      expect(transformer).toHaveBeenCalledWith(input);
    });

    it('должен работать с примитивными типами', () => {
      const echo: any = jasmine.createSpy('echo').and.callFake((x: any) => x);

      expect(echo('hello')).toBe('hello');
      expect(echo(42)).toBe(42);
      expect(echo(true)).toBe(true);
      expect(echo(null)).toBeNull();
      expect(echo(undefined)).toBeUndefined();

      // Проверяем что все вызовы зарегистрированы
      expect(echo.calls.count()).toBe(5);
    });

    it('должен возвращать только первый аргумент при нескольких', () => {
      const multiArg: any = jasmine.createSpy('multiArg').and.callFake((x: any) => x);

      const result = multiArg('first', 'second', 'third');

      // Возвращается только первый аргумент
      expect(result).toBe('first');

      // Но все аргументы зарегистрированы
      expect(multiArg.calls.first().args).toEqual(['first', 'second', 'third']);
    });

    it('должен использоваться для pass-through функций', () => {
      const processor = jasmine.createSpyObj('DataProcessor', ['normalize', 'validate']);

      // normalize просто возвращает данные как есть
      processor.normalize.and.identity();

      // validate проверяет данные и возвращает boolean
      processor.validate.and.returnValue(true);

      const data = { id: 1, value: 'test' };

      // normalize возвращает данные без изменений
      const normalized = processor.normalize(data);
      expect(normalized).toBe(data);

      // validate проверяет и возвращает результат
      const isValid = processor.validate(normalized);
      expect(isValid).toBe(true);

      // Проверяем цепочку вызовов
      expect(processor.normalize).toHaveBeenCalledWith(data);
      expect(processor.validate).toHaveBeenCalledWith(data);
    });

    it('должен работать с массивами и объектами', () => {
      const arrayProcessor: any = jasmine.createSpy('processArray').and.callFake((x: any) => x);
      const objectProcessor: any = jasmine.createSpy('processObject').and.callFake((x: any) => x);

      const testArray = [1, 2, 3, 4, 5];
      const testObject = { name: 'Test', items: testArray };

      // Оба возвращают входные данные как есть
      expect(arrayProcessor(testArray)).toBe(testArray);
      expect(objectProcessor(testObject)).toBe(testObject);

      // Проверяем аргументы
      expect(arrayProcessor.calls.first().args[0]).toEqual([1, 2, 3, 4, 5]);
      expect(objectProcessor.calls.first().args[0]).toEqual({ name: 'Test', items: testArray });
    });
  });

  /**
   * ==========================================
   * ПРИМЕР 6: Комплексный сценарий
   * ==========================================
   * Использование всех методов вместе в реальном сценарии
   */
  describe('Комплексный пример - TodoService с детальным отслеживанием', () => {

    let todoService: jasmine.SpyObj<TodoService>;
    const mockTodos: Todo[] = [
      { id: 1, title: 'Задача 1', completed: false, createdAt: new Date() },
      { id: 2, title: 'Задача 2', completed: true, createdAt: new Date() }
    ];

    beforeEach(() => {
      // Создаем spy объект с всеми методами
      todoService = jasmine.createSpyObj('TodoService', [
        'getTodos',
        'addTodo',
        'updateTodo',
        'deleteTodo',
        'getStats'
      ]);
    });

    it('должен детально отслеживать работу с задачами', (done) => {
      // Настраиваем разные стратегии для разных методов
      todoService.getTodos.and.returnValue(of(mockTodos));
      todoService.getStats.and.returnValue({ total: 2, completed: 1, pending: 1 });

      // addTodo использует identity для быстрого прототипирования
      const addSpy: any = jasmine.createSpy('addTodo').and.callFake((x: any) => x);
      const newTodo: Todo = { id: 3, title: 'Новая задача', completed: false, createdAt: new Date() };

      // updateTodo возвращает булево значение
      todoService.updateTodo.and.returnValue(true);

      // deleteTodo использует stub (по умолчанию)
      todoService.deleteTodo.and.stub();

      // Выполняем последовательность операций
      // 1. Получаем список задач
      todoService.getTodos().subscribe(todos => {
        expect(todos).toEqual(mockTodos);

        // 2. Добавляем новую задачу
        const added = addSpy(newTodo);
        expect(added).toBe(newTodo); // identity вернул объект как есть

        // 3. Обновляем задачу
        const updated = todoService.updateTodo(1, 'Обновленная задача');
        expect(updated).toBe(true);

        // 4. Удаляем задачу
        const deleted = todoService.deleteTodo(2);
        expect(deleted).toBeUndefined(); // stub вернул undefined

        // 5. Получаем статистику
        const stats = todoService.getStats();
        expect(stats.total).toBe(2);

        // ДЕТАЛЬНАЯ ПРОВЕРКА ВСЕХ ВЫЗОВОВ

        // Проверяем аргументы всех вызовов
        expect(todoService.getTodos.calls.count()).toBe(1);
        expect(addSpy.calls.argsFor(0)).toEqual([newTodo]);
        expect(todoService.updateTodo.calls.argsFor(0)).toEqual([1, 'Обновленная задача']);
        expect(todoService.deleteTodo.calls.argsFor(0)).toEqual([2]);

        // Проверяем возвращаемые значения
        expect(todoService.getTodos.calls.first().returnValue).toBeDefined();
        expect(todoService.updateTodo.calls.first().returnValue).toBe(true);
        expect(todoService.deleteTodo.calls.first().returnValue).toBeUndefined();

        // Проверяем порядок вызовов
        expect(todoService.getTodos.calls.count()).toBe(1);
        expect(addSpy.calls.count()).toBe(1);
        expect(todoService.updateTodo.calls.count()).toBe(1);
        expect(todoService.deleteTodo.calls.count()).toBe(1);
        expect(todoService.getStats.calls.count()).toBe(1);

        done();
      });
    });

    it('должен отслеживать множественные вызовы с разными результатами', () => {
      // Настраиваем возврат разных значений для последовательных вызовов
      todoService.updateTodo.and.returnValues(true, true, false, true);

      // Делаем серию обновлений
      const results = [
        todoService.updateTodo(1, 'Обновление 1'),
        todoService.updateTodo(2, 'Обновление 2'),
        todoService.updateTodo(999, 'Несуществующая'), // Вернет false
        todoService.updateTodo(3, 'Обновление 3')
      ];

      // Проверяем результаты
      expect(results).toEqual([true, true, false, true]);

      // Детальная проверка каждого вызова
      const allCalls = todoService.updateTodo.calls.all();
      expect(allCalls.length).toBe(4);

      // Проверяем аргументы и возвращаемые значения каждого вызова
      expect(allCalls[0].args).toEqual([1, 'Обновление 1']);
      expect(allCalls[0].returnValue).toBe(true);

      expect(allCalls[1].args).toEqual([2, 'Обновление 2']);
      expect(allCalls[1].returnValue).toBe(true);

      expect(allCalls[2].args).toEqual([999, 'Несуществующая']);
      expect(allCalls[2].returnValue).toBe(false);

      expect(allCalls[3].args).toEqual([3, 'Обновление 3']);
      expect(allCalls[3].returnValue).toBe(true);

      // Проверяем все аргументы
      expect(allCalls[0].args).toEqual([1, 'Обновление 1']);
      expect(allCalls[1].args).toEqual([2, 'Обновление 2']);
      expect(allCalls[2].args).toEqual([999, 'Несуществующая']);
      expect(allCalls[3].args).toEqual([3, 'Обновление 3']);
    });
  });

  /**
   * ==========================================
   * ПРИМЕР 7: Практические паттерны
   * ==========================================
   * Реальные сценарии использования в Angular приложении
   */
  describe('Практические паттерны использования spy методов', () => {

    it('паттерн: проверка последовательности операций', () => {
      const workflowService = jasmine.createSpyObj('WorkflowService', [
        'start',
        'process',
        'validate',
        'complete'
      ]);

      // Настраиваем цепочку операций
      workflowService.start.and.returnValue('started');
      workflowService.process.and.identity();
      workflowService.validate.and.returnValue(true);
      workflowService.complete.and.returnValue({ status: 'success' });

      // Выполняем workflow
      const session = workflowService.start();
      const data = workflowService.process({ value: 100 });
      const valid = workflowService.validate(data);
      const result = workflowService.complete(session);

      // Проверяем последовательность вызовов
      expect(workflowService.start.calls.count()).toBe(1);
      expect(workflowService.process.calls.count()).toBe(1);
      expect(workflowService.validate.calls.count()).toBe(1);
      expect(workflowService.complete.calls.count()).toBe(1);

      // Проверяем что process использовал identity
      expect(data).toEqual({ value: 100 });

      // Проверяем результаты
      expect(session).toBe('started');
      expect(valid).toBe(true);
      expect(result).toEqual({ status: 'success' });
    });

    it('паттерн: отладка сложных взаимодействий', () => {
      const cachingService = jasmine.createSpyObj('CachingService', [
        'get',
        'set',
        'invalidate'
      ]);

      // get возвращает разные значения: miss, hit, hit
      cachingService.get.and.returnValues(null, { data: 'cached1' }, { data: 'cached2' });
      cachingService.set.and.stub();
      cachingService.invalidate.and.stub();

      // Сценарий работы с кешем
      // 1. Первый запрос - cache miss
      const firstGet = cachingService.get('key1');
      expect(firstGet).toBeNull();
      cachingService.set('key1', { data: 'value1' });

      // 2. Второй запрос - cache hit
      const secondGet = cachingService.get('key1');
      expect(secondGet).toEqual({ data: 'cached1' });

      // 3. Инвалидация
      cachingService.invalidate('key1');

      // 4. Третий запрос после добавления нового ключа
      cachingService.set('key2', { data: 'value2' });
      const thirdGet = cachingService.get('key2');
      expect(thirdGet).toEqual({ data: 'cached2' });

      // Детальный анализ всех операций
      console.log('=== Детальный лог операций ===');

      const getAllCalls = cachingService.get.calls.all();
      getAllCalls.forEach((call: any, index: number) => {
        console.log(`get[${index}]: args=${JSON.stringify(call.args)}, returned=${JSON.stringify(call.returnValue)}`);
      });

      const setAllCalls = cachingService.set.calls.all();
      setAllCalls.forEach((call: any, index: number) => {
        console.log(`set[${index}]: args=${JSON.stringify(call.args)}, returned=${call.returnValue}`);
      });

      // Проверяем общую картину
      expect(cachingService.get.calls.count()).toBe(3);
      expect(cachingService.set.calls.count()).toBe(2);
      expect(cachingService.invalidate.calls.count()).toBe(1);
    });

    it('паттерн: тестирование retry логики', () => {
      const apiService = jasmine.createSpyObj('ApiService', ['fetchData']);

      // Первые 2 вызова - ошибки, третий - успех
      apiService.fetchData.and.returnValues(
        throwError(() => new Error('Network error')),
        throwError(() => new Error('Timeout')),
        of({ data: 'success' })
      );

      // Симулируем retry логику (упрощенно)
      let attempts = 0;
      let result: any = null;

      while (attempts < 3 && !result) {
        try {
          const response = apiService.fetchData('/api/data');
          // Проверяем тип возвращаемого значения
          if (response && typeof response.subscribe === 'function') {
            // Это Observable, подписываемся
            response.subscribe({
              next: (data: any) => result = data,
              error: () => attempts++
            });
          }
          if (result) break;
        } catch (e) {
          attempts++;
        }
      }

      // Проверяем что было сделано 3 попытки
      expect(apiService.fetchData.calls.count()).toBe(3);

      // Проверяем аргументы каждой попытки
      const fetchCalls = apiService.fetchData.calls.all();
      expect(fetchCalls[0].args).toEqual(['/api/data']);
      expect(fetchCalls[1].args).toEqual(['/api/data']);
      expect(fetchCalls[2].args).toEqual(['/api/data']);

      // Проверяем что третья попытка вернула успех
      const lastCall = apiService.fetchData.calls.mostRecent();
      expect(lastCall.returnValue).toBeDefined();
    });
  });
});

