import { Pipe, PipeTransform } from '@angular/core';
import { Todo } from '../models/todo.model';

/**
 * Pipe для фильтрации списка задач
 *
 * Использование:
 * {{ todos | todoFilter:'completed' }}
 * {{ todos | todoFilter:'pending' }}
 * {{ todos | todoFilter:'all' }}
 */
@Pipe({
  name: 'todoFilter',
  standalone: true
})
export class TodoFilterPipe implements PipeTransform {
  /**
   * Фильтрует массив задач по статусу
   *
   * @param todos - массив задач
   * @param filter - фильтр: 'all' | 'completed' | 'pending'
   * @returns отфильтрованный массив задач
   */
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

