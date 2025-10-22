import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { Todo } from '../models/todo.model';

/**
 * Сервис для работы с Todo API через HTTP
 * Демонстрирует реальные HTTP запросы для тестирования с HttpTestingController
 */
@Injectable({
  providedIn: 'root'
})
export class TodoApiService {
  private apiUrl = 'https://api.example.com/todos';

  constructor(private http: HttpClient) {}

  /**
   * Получить все задачи
   * GET /todos
   */
  getTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.apiUrl).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  /**
   * Получить задачу по ID
   * GET /todos/:id
   */
  getTodoById(id: number): Observable<Todo> {
    return this.http.get<Todo>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Создать новую задачу
   * POST /todos
   */
  createTodo(todo: Partial<Todo>): Observable<Todo> {
    return this.http.post<Todo>(this.apiUrl, todo).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Обновить задачу
   * PUT /todos/:id
   */
  updateTodo(id: number, todo: Partial<Todo>): Observable<Todo> {
    return this.http.put<Todo>(`${this.apiUrl}/${id}`, todo).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Частичное обновление задачи
   * PATCH /todos/:id
   */
  patchTodo(id: number, changes: Partial<Todo>): Observable<Todo> {
    return this.http.patch<Todo>(`${this.apiUrl}/${id}`, changes).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Удалить задачу
   * DELETE /todos/:id
   */
  deleteTodo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Поиск задач
   * GET /todos/search?q=query
   */
  searchTodos(query: string): Observable<Todo[]> {
    return this.http.get<Todo[]>(`${this.apiUrl}/search`, {
      params: { q: query }
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Получить задачи с пагинацией
   * GET /todos?page=1&limit=10
   */
  getTodosWithPagination(page: number, limit: number): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.apiUrl, {
      params: {
        page: page.toString(),
        limit: limit.toString()
      }
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Массовое обновление
   * PUT /todos/batch
   */
  batchUpdate(todos: Todo[]): Observable<Todo[]> {
    return this.http.put<Todo[]>(`${this.apiUrl}/batch`, todos).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Получить статистику с заголовками
   * GET /todos/stats
   */
  getStats(): Observable<{ data: any; headers: any }> {
    return this.http.get(`${this.apiUrl}/stats`, {
      observe: 'response'
    }).pipe(
      map(response => ({
        data: response.body,
        headers: {
          'x-total-count': response.headers.get('x-total-count'),
          'x-completed-count': response.headers.get('x-completed-count')
        }
      })),
      catchError(this.handleError)
    );
  }

  /**
   * Обработка ошибок HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Клиентская ошибка
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Серверная ошибка
      errorMessage = `Server Error: ${error.status} - ${error.message}`;
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

