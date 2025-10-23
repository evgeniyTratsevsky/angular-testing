import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService } from '../../services/todo.service';
import { Todo, TodoStats } from '../../models/todo.model';
import { Observable } from 'rxjs';
import { TodoFilterPipe } from '../../pipes/todo-filter.pipe';

@Component({
  selector: 'app-todo-list',
  imports: [CommonModule, FormsModule, TodoFilterPipe],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.less'
})
export class TodoListComponent implements OnInit {
  todos$!: Observable<Todo[]>;
  stats: TodoStats = { total: 0, completed: 0, pending: 0 };
  newTodoTitle = '';
  editingTodoId: number | null = null;
  editingTitle = '';
  isLoading = false;
  errorMessage = '';
  currentFilter: 'all' | 'completed' | 'pending' = 'all';

  constructor(private todoService: TodoService) {}

  ngOnInit(): void {
    this.todos$ = this.todoService.getTodos();
    this.updateStats();
  }

  addTodo(): void {
    const title = this.newTodoTitle.trim();

    if (!title) {
      this.errorMessage = 'Please enter a todo title';
      return;
    }

    if (title.length < 3) {
      this.errorMessage = 'Title must be at least 3 characters';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.todoService.addTodo(title).subscribe({
      next: () => {
        this.newTodoTitle = '';
        this.isLoading = false;
        this.updateStats();
      },
      error: (err) => {
        this.errorMessage = 'Failed to add todo';
        this.isLoading = false;
      }
    });
  }

  toggleTodo(id: number): void {
    this.todoService.toggleTodo(id);
    this.updateStats();
  }

  deleteTodo(id: number): void {
    this.todoService.deleteTodo(id);
    this.updateStats();
  }

  startEdit(todo: Todo): void {
    this.editingTodoId = todo.id;
    this.editingTitle = todo.title;
  }

  cancelEdit(): void {
    this.editingTodoId = null;
    this.editingTitle = '';
  }

  saveEdit(id: number): void {
    const title = this.editingTitle.trim();

    if (title && title.length >= 3) {
      this.todoService.updateTodo(id, title);
      this.cancelEdit();
    }
  }

  clearCompleted(): void {
    const count = this.todoService.clearCompleted();
    this.updateStats();

    if (count > 0) {
      console.log(`Cleared ${count} completed todo(s)`);
    }
  }

  private updateStats(): void {
    this.stats = this.todoService.getStats();
  }

  trackByTodoId(index: number, todo: Todo): number {
    return todo.id;
  }

  setFilter(filter: 'all' | 'completed' | 'pending'): void {
    this.currentFilter = filter;
  }
}

