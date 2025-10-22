import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Todo } from '../../models/todo.model';

/**
 * Компонент отдельного элемента задачи
 * Демонстрирует использование @Input и @Output для тестирования
 */
@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './todo-item.component.html',
  styleUrl: './todo-item.component.less'
})
export class TodoItemComponent {
  // Input: данные задачи из родительского компонента
  @Input() todo!: Todo;

  // Input: флаг выделения задачи
  @Input() isHighlighted: boolean = false;

  // Input: возможность редактирования
  @Input() canEdit: boolean = true;

  // Output: событие переключения статуса
  @Output() toggleComplete = new EventEmitter<number>();

  // Output: событие удаления
  @Output() deleteItem = new EventEmitter<number>();

  // Output: событие начала редактирования
  @Output() startEdit = new EventEmitter<Todo>();

  // Output: событие при наведении мыши
  @Output() itemHovered = new EventEmitter<{ id: number; hovered: boolean }>();

  /**
   * Обработчик переключения статуса задачи
   */
  onToggle(): void {
    this.toggleComplete.emit(this.todo.id);
  }

  /**
   * Обработчик удаления задачи
   */
  onDelete(): void {
    this.deleteItem.emit(this.todo.id);
  }

  /**
   * Обработчик начала редактирования
   */
  onEdit(): void {
    if (this.canEdit) {
      this.startEdit.emit(this.todo);
    }
  }

  /**
   * Обработчик наведения мыши
   */
  onMouseEnter(): void {
    this.itemHovered.emit({ id: this.todo.id, hovered: true });
  }

  /**
   * Обработчик ухода мыши
   */
  onMouseLeave(): void {
    this.itemHovered.emit({ id: this.todo.id, hovered: false });
  }

  /**
   * Получить CSS классы для элемента
   */
  getItemClasses(): { [key: string]: boolean } {
    return {
      'todo-item': true,
      'completed': this.todo.completed,
      'highlighted': this.isHighlighted,
      'read-only': !this.canEdit
    };
  }

  /**
   * Получить статус задачи в текстовом виде
   */
  getStatusText(): string {
    return this.todo.completed ? 'Выполнено' : 'В процессе';
  }

  /**
   * Получить дату создания в читаемом формате
   */
  getFormattedDate(): string {
    const date = new Date(this.todo.createdAt);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

