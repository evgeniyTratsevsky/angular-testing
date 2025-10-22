import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, delay, of } from 'rxjs';
import { Todo, TodoStats } from '../models/todo.model';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private todos: Todo[] = [
    { id: 1, title: 'Learn Angular', completed: true, createdAt: new Date('2024-01-01') },
    { id: 2, title: 'Learn Testing', completed: false, createdAt: new Date('2024-01-02') },
    { id: 3, title: 'Build an App', completed: false, createdAt: new Date('2024-01-03') }
  ];

  private todosSubject = new BehaviorSubject<Todo[]>(this.todos);
  public todos$ = this.todosSubject.asObservable();

  private nextId = 4;

  constructor() { }

  /**
   * Get all todos
   */
  getTodos(): Observable<Todo[]> {
    return this.todosSubject.asObservable();
  }

  /**
   * Get a single todo by id
   */
  getTodoById(id: number): Todo | undefined {
    return this.todos.find(todo => todo.id === id);
  }

  /**
   * Add a new todo
   */
  addTodo(title: string): Observable<Todo> {
    const newTodo: Todo = {
      id: this.nextId++,
      title,
      completed: false,
      createdAt: new Date()
    };

    this.todos.push(newTodo);
    this.todosSubject.next([...this.todos]);

    // Simulate async operation
    return of(newTodo).pipe(delay(100));
  }

  /**
   * Toggle todo completion status
   */
  toggleTodo(id: number): boolean {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.todosSubject.next([...this.todos]);
      return true;
    }
    return false;
  }

  /**
   * Delete a todo
   */
  deleteTodo(id: number): boolean {
    const index = this.todos.findIndex(t => t.id === id);
    if (index !== -1) {
      this.todos.splice(index, 1);
      this.todosSubject.next([...this.todos]);
      return true;
    }
    return false;
  }

  /**
   * Update a todo's title
   */
  updateTodo(id: number, title: string): boolean {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.title = title;
      this.todosSubject.next([...this.todos]);
      return true;
    }
    return false;
  }

  /**
   * Get todo statistics
   */
  getStats(): TodoStats {
    const total = this.todos.length;
    const completed = this.todos.filter(t => t.completed).length;
    const pending = total - completed;

    return { total, completed, pending };
  }

  /**
   * Clear all completed todos
   */
  clearCompleted(): number {
    const initialLength = this.todos.length;
    this.todos = this.todos.filter(t => !t.completed);
    const removedCount = initialLength - this.todos.length;

    if (removedCount > 0) {
      this.todosSubject.next([...this.todos]);
    }

    return removedCount;
  }
}

