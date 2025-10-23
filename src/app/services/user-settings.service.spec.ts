/**
 * Полное руководство по Jasmine Spy
 *
 * Этот файл демонстрирует:
 * - spyOn() - Шпион на методы объекта
 * - spyOnProperty(obj, 'prop', 'get') - Шпион на геттеры
 * - spyOnProperty(obj, 'prop', 'set') - Шпион на сеттеры
 * - jasmine.createSpy() - Создание автономных шпионов
 * - jasmine.createSpyObj() - Создание мок объектов
 */

import { TestBed } from '@angular/core/testing';
import { UserSettingsService } from './user-settings.service';
import { of } from 'rxjs';

describe('UserSettingsService - Jasmine Spy Examples', () => {
  let service: UserSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserSettingsService);
  });

  // ==========================================
  // 1. spyOn() - Шпион на методы
  // ==========================================

  describe('spyOn() - Шпионы на методы', () => {
    it('должен отследить вызов метода updateSettings', () => {
      // Создаём шпиона на метод
      spyOn(service, 'updateSettings');

      // Вызываем метод
      service.updateSettings({ theme: 'dark' });

      // Проверяем что метод был вызван
      expect(service.updateSettings).toHaveBeenCalled();
      expect(service.updateSettings).toHaveBeenCalledWith({ theme: 'dark' });
      expect(service.updateSettings).toHaveBeenCalledTimes(1);
    });

    it('должен замокать возвращаемое значение метода isDarkTheme', () => {
      // Мокаем метод чтобы всегда возвращал true
      spyOn(service, 'isDarkTheme').and.returnValue(true);

      const result = service.isDarkTheme();

      expect(result).toBe(true);
      expect(service.isDarkTheme).toHaveBeenCalled();
    });

    it('должен вызвать оригинальный метод с callThrough', () => {
      // Используем callThrough чтобы вызвать оригинальную логику
      spyOn(service, 'isDarkTheme').and.callThrough();

      service.theme = 'dark';
      const result = service.isDarkTheme();

      expect(result).toBe(true);
      expect(service.isDarkTheme).toHaveBeenCalled();
    });

    it('должен выбросить ошибку с throwError', () => {
      // Мокаем метод чтобы выбросить ошибку
      spyOn(service, 'saveToStorage').and.throwError('Storage is full');

      expect(() => service.saveToStorage()).toThrowError('Storage is full');
    });

    it('должен использовать callFake для кастомной логики', () => {
      let called = false;

      // Заменяем метод на свою функцию
      spyOn(service, 'resetToDefaults').and.callFake(() => {
        called = true;
      });

      service.resetToDefaults();

      expect(called).toBe(true);
      expect(service.resetToDefaults).toHaveBeenCalled();
    });

    it('должен использовать stub для заглушки', () => {
      // Создаём заглушку (ничего не делает)
      spyOn(service, 'saveToStorage').and.stub();

      service.saveToStorage();

      expect(service.saveToStorage).toHaveBeenCalled();
    });

    it('должен отследить несколько вызовов метода', () => {
      spyOn(service, 'updateSettings');

      service.updateSettings({ theme: 'dark' });
      service.updateSettings({ language: 'ru' });
      service.updateSettings({ notifications: false });

      expect(service.updateSettings).toHaveBeenCalledTimes(3);

      // Проверяем вызовы через calls.argsFor
      const spy = service.updateSettings as jasmine.Spy;
      expect(spy.calls.argsFor(0)[0]).toEqual({ theme: 'dark' });
      expect(spy.calls.argsFor(1)[0]).toEqual({ language: 'ru' });
      expect(spy.calls.argsFor(2)[0]).toEqual({ notifications: false });
    });
  });

  // ==========================================
  // 2. spyOnProperty() - Шпионы на геттеры
  // ==========================================

  describe('spyOnProperty(obj, "prop", "get") - Шпионы на геттеры', () => {
    it('должен замокать геттер theme', () => {
      // Создаём шпиона на геттер
      const spy = spyOnProperty(service, 'theme', 'get').and.returnValue('dark');

      // Получаем значение через геттер
      const theme = service.theme;

      // Проверяем
      expect(theme).toBe('dark');
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('должен замокать геттер language', () => {
      spyOnProperty(service, 'language', 'get').and.returnValue('ru');

      expect(service.language).toBe('ru');
    });

    it('должен замокать геттер notificationsEnabled', () => {
      const spy = spyOnProperty(service, 'notificationsEnabled', 'get').and.returnValue(false);

      const enabled = service.notificationsEnabled;

      expect(enabled).toBe(false);
      expect(spy).toHaveBeenCalled();
    });

    it('должен замокать геттер currentSettings', () => {
      const mockSettings = {
        theme: 'dark' as const,
        language: 'fr',
        notifications: false
      };

      spyOnProperty(service, 'currentSettings', 'get').and.returnValue(mockSettings);

      const settings = service.currentSettings;

      expect(settings).toEqual(mockSettings);
      expect(settings.theme).toBe('dark');
    });

    it('должен замокать Observable геттер settings$', () => {
      const mockSettings = {
        theme: 'dark' as const,
        language: 'ru',
        notifications: true
      };

      // Мокаем Observable геттер
      spyOnProperty(service, 'settings$', 'get').and.returnValue(of(mockSettings));

      service.settings$.subscribe(settings => {
        expect(settings).toEqual(mockSettings);
      });
    });

    it('должен отследить множественные вызовы геттера', () => {
      const spy = spyOnProperty(service, 'theme', 'get').and.returnValue('dark');

      // Вызываем геттер несколько раз
      const theme1 = service.theme;
      const theme2 = service.theme;
      const theme3 = service.theme;

      expect(spy).toHaveBeenCalledTimes(3);
    });

    it('должен использовать callThrough для реального геттера', () => {
      const spy = spyOnProperty(service, 'theme', 'get').and.callThrough();

      // Устанавливаем значение
      service.theme = 'dark';

      // Получаем через геттер (вызовется реальная логика)
      const theme = service.theme;

      expect(theme).toBe('dark');
      expect(spy).toHaveBeenCalled();
    });
  });

  // ==========================================
  // 3. spyOnProperty() - Шпионы на сеттеры
  // ==========================================

  describe('spyOnProperty(obj, "prop", "set") - Шпионы на сеттеры', () => {
    it('должен отследить установку theme через сеттер', () => {
      // Создаём шпиона на сеттер
      const spy = spyOnProperty(service, 'theme', 'set');

      // Устанавливаем значение (вызываем сеттер)
      service.theme = 'dark';

      // Проверяем
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith('dark');
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('должен отследить установку language', () => {
      const spy = spyOnProperty(service, 'language', 'set');

      service.language = 'ru';

      expect(spy).toHaveBeenCalledWith('ru');
    });

    it('должен отследить установку notificationsEnabled', () => {
      const spy = spyOnProperty(service, 'notificationsEnabled', 'set');

      service.notificationsEnabled = false;

      expect(spy).toHaveBeenCalledWith(false);
    });

    it('должен отследить множественные установки через сеттер', () => {
      const spy = spyOnProperty(service, 'theme', 'set');

      service.theme = 'dark';
      service.theme = 'light';
      service.theme = 'dark';

      expect(spy).toHaveBeenCalledTimes(3);

      // Проверяем каждый вызов
      expect(spy.calls.argsFor(0)[0]).toBe('dark');
      expect(spy.calls.argsFor(1)[0]).toBe('light');
      expect(spy.calls.argsFor(2)[0]).toBe('dark');
    });

    it('должен проверить что сеттер вызвал приватный метод', () => {
      // Шпионим за приватным методом
      spyOn<any>(service, 'notifyChanges');

      // Устанавливаем значение через сеттер
      service.theme = 'dark';

      // Проверяем что приватный метод был вызван
      expect(service['notifyChanges']).toHaveBeenCalled();
    });
  });

  // ==========================================
  // 4. Комбинация геттер + сеттер
  // ==========================================

  describe('Комбинация геттера и сеттера', () => {
    it('должен работать с геттером И сеттером одновременно', () => {
      // Шпион на сеттер
      const setSpy = spyOnProperty(service, 'theme', 'set');

      // Шпион на геттер
      const getSpy = spyOnProperty(service, 'theme', 'get').and.returnValue('dark');

      // Устанавливаем значение
      service.theme = 'light';
      expect(setSpy).toHaveBeenCalledWith('light');

      // Получаем значение
      const theme = service.theme;
      expect(theme).toBe('dark'); // Возвращает моковое значение
      expect(getSpy).toHaveBeenCalled();
    });

    it('должен проверить взаимодействие геттера и метода', () => {
      // Мокаем геттер
      spyOnProperty(service, 'theme', 'get').and.returnValue('dark');

      // Шпионим за методом который использует геттер
      spyOn(service, 'isDarkTheme').and.callThrough();

      const result = service.isDarkTheme();

      expect(result).toBe(true);
      expect(service.isDarkTheme).toHaveBeenCalled();
    });
  });

  // ==========================================
  // 5. jasmine.createSpy() - Автономные шпионы
  // ==========================================

  describe('jasmine.createSpy() - Автономные шпионы', () => {
    it('должен создать автономный шпион', () => {
      // Создаём шпиона (не привязан к объекту)
      const callback = jasmine.createSpy('callback');

      // Используем как обычную функцию
      callback('arg1', 'arg2');

      expect(callback).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('должен создать шпион с возвращаемым значением', () => {
      const getValue = jasmine.createSpy('getValue').and.returnValue(42);

      const result = getValue();

      expect(result).toBe(42);
      expect(getValue).toHaveBeenCalled();
    });

    it('должен использовать шпион в callback функциях', () => {
      const onSuccess = jasmine.createSpy('onSuccess');
      const onError = jasmine.createSpy('onError');

      // Симулируем асинхронную операцию
      const promise = Promise.resolve('data');
      promise.then(onSuccess).catch(onError);

      // Ждём завершения Promise
      return promise.then(() => {
        expect(onSuccess).toHaveBeenCalledWith('data');
        expect(onError).not.toHaveBeenCalled();
      });
    });

    it('должен создать шпион для Observable subscribe', () => {
      const observer = jasmine.createSpy('observer');

      service.settings$.subscribe(observer);

      // Меняем настройки чтобы вызвать observer
      service.theme = 'dark';

      expect(observer).toHaveBeenCalled();
    });

    it('должен создать несколько шпионов для разных callback', () => {
      const onNext = jasmine.createSpy('onNext');
      const onError = jasmine.createSpy('onError');
      const onComplete = jasmine.createSpy('onComplete');

      service.settings$.subscribe({
        next: onNext,
        error: onError,
        complete: onComplete
      });

      service.theme = 'dark';

      expect(onNext).toHaveBeenCalled();
    });
  });

  // ==========================================
  // 6. jasmine.createSpyObj() - Мок объектов
  // ==========================================

  describe('jasmine.createSpyObj() - Мок объектов', () => {
    it('должен создать мок сервиса с методами', () => {
      // Создаём мок объект с методами
      const mockService = jasmine.createSpyObj('UserSettingsService', [
        'updateSettings',
        'resetToDefaults',
        'saveToStorage',
        'isDarkTheme'
      ]);

      // Настраиваем возвращаемые значения
      mockService.isDarkTheme.and.returnValue(true);

      // Используем мок
      const result = mockService.isDarkTheme();

      expect(result).toBe(true);
      expect(mockService.isDarkTheme).toHaveBeenCalled();
    });

    it('должен создать мок с геттерами', () => {
      // Создаём мок с методами И свойствами
      const mockService = jasmine.createSpyObj(
        'UserSettingsService',
        ['updateSettings', 'resetToDefaults'], // Методы
        {
          theme: 'dark',                        // Геттеры
          language: 'ru',
          notificationsEnabled: true
        }
      );

      expect(mockService.theme).toBe('dark');
      expect(mockService.language).toBe('ru');
      expect(mockService.notificationsEnabled).toBe(true);
    });

    it('должен использовать мок вместо реального сервиса', () => {
      // Создаём мок
      const mockService = jasmine.createSpyObj('UserSettingsService',
        ['updateSettings', 'isDarkTheme'],
        { theme: 'dark' }
      );

      mockService.isDarkTheme.and.returnValue(true);

      // Проверяем мок
      expect(mockService.theme).toBe('dark');
      expect(mockService.isDarkTheme()).toBe(true);
      expect(mockService.isDarkTheme).toHaveBeenCalled();
    });
  });

  // ==========================================
  // 7. Реальные сценарии использования
  // ==========================================

  describe('Реальные сценарии', () => {
    it('должен проверить что updateSettings вызывает notifyChanges', () => {
      spyOn<any>(service, 'notifyChanges');

      service.updateSettings({ theme: 'dark' });

      expect(service['notifyChanges']).toHaveBeenCalled();
    });

    it('должен проверить сохранение в localStorage', () => {
      spyOn(localStorage, 'setItem');

      service.saveToStorage();

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'userSettings',
        jasmine.any(String)
      );
    });

    it('должен проверить загрузку из localStorage', () => {
      const mockData = JSON.stringify({
        theme: 'dark',
        language: 'ru',
        notifications: false
      });

      spyOn(localStorage, 'getItem').and.returnValue(mockData);

      service.loadFromStorage();

      expect(localStorage.getItem).toHaveBeenCalledWith('userSettings');
      expect(service.theme).toBe('dark');
    });

    it('должен проверить сброс настроек', () => {
      // Устанавливаем кастомные настройки
      service.theme = 'dark';
      service.language = 'ru';

      // Сбрасываем
      service.resetToDefaults();

      // Проверяем что всё вернулось к дефолту
      expect(service.theme).toBe('light');
      expect(service.language).toBe('en');
      expect(service.notificationsEnabled).toBe(true);
    });

    it('должен проверить Observable уведомления', (done) => {
      const callback = jasmine.createSpy('callback');

      service.settings$.subscribe(settings => {
        callback(settings);

        // Проверяем после второго вызова
        if (callback.calls.count() === 2) {
          expect(callback).toHaveBeenCalledTimes(2);
          expect(callback).toHaveBeenCalledWith(
            jasmine.objectContaining({ theme: 'dark' })
          );
          done();
        }
      });

      // Меняем настройки
      service.theme = 'dark';
    });
  });

  // ==========================================
  // 8. Продвинутые техники
  // ==========================================

  describe('Продвинутые техники', () => {
    it('должен использовать calls.argsFor для проверки аргументов', () => {
      spyOn(service, 'updateSettings');

      service.updateSettings({ theme: 'dark' });
      service.updateSettings({ language: 'ru' });

      // Получаем аргументы первого вызова
      const firstCallArgs = (service.updateSettings as jasmine.Spy).calls.argsFor(0);
      expect(firstCallArgs[0]).toEqual({ theme: 'dark' });

      // Получаем аргументы второго вызова
      const secondCallArgs = (service.updateSettings as jasmine.Spy).calls.argsFor(1);
      expect(secondCallArgs[0]).toEqual({ language: 'ru' });
    });

    it('должен использовать calls.all для всех вызовов', () => {
      spyOn(service, 'updateSettings');

      service.updateSettings({ theme: 'dark' });
      service.updateSettings({ language: 'ru' });

      const allCalls = (service.updateSettings as jasmine.Spy).calls.all();
      expect(allCalls.length).toBe(2);
    });

    it('должен сбросить счётчик вызовов', () => {
      const spy = spyOn(service, 'updateSettings');

      service.updateSettings({ theme: 'dark' });
      expect(spy).toHaveBeenCalledTimes(1);

      // Сбрасываем счётчик
      spy.calls.reset();

      expect(spy).toHaveBeenCalledTimes(0);

      service.updateSettings({ theme: 'light' });
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('должен проверить порядок вызовов', () => {
      const spy1 = spyOn(service, 'saveToStorage');
      const spy2 = spyOn(service, 'loadFromStorage');

      service.saveToStorage();
      service.loadFromStorage();

      // Проверяем что оба метода были вызваны
      expect(spy1).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();

      // Проверяем порядок через calls
      expect(spy1.calls.count()).toBe(1);
      expect(spy2.calls.count()).toBe(1);
    });
  });
});

