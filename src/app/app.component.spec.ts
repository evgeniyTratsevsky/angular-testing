/**
 * Тесты для AppComponent
 *
 * Этот файл содержит тесты корневого компонента приложения:
 * - Проверка создания компонента
 * - Проверка инициализации свойств
 * - Проверка интеграции дочерних компонентов
 */

import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { TodoListComponent } from './components/todo-list/todo-list.component';
import { TodoService } from './services/todo.service';

describe('AppComponent', () => {
  // Выполняется перед каждым тестом
  // Настраивает тестовое окружение для корневого компонента
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent], // Импортируем standalone компонент
      providers: [TodoService]  // Предоставляем реальный сервис
    }).compileComponents();
  });

  // Проверяет что компонент приложения успешно создается
  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  // Проверяет что свойство title имеет правильное значение
  it(`should have the 'angular-testing' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('angular-testing');
  });

  // Проверяет что компонент todo-list рендерится в шаблоне
  it('should render the todo-list component', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges(); // Запускаем обнаружение изменений
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('app-todo-list')).toBeTruthy();
  });
});
