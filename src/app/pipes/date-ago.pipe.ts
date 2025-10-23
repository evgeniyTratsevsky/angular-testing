import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe для отображения времени в формате "X назад"
 *
 * Использование:
 * {{ date | dateAgo }}
 *
 * Примеры вывода:
 * - "только что" (меньше минуты)
 * - "5 минут назад"
 * - "2 часа назад"
 * - "3 дня назад"
 */
@Pipe({
  name: 'dateAgo',
  standalone: true
})
export class DateAgoPipe implements PipeTransform {
  /**
   * Преобразует дату в относительное время
   *
   * @param value - дата для преобразования
   * @returns строка с относительным временем
   */
  transform(value: Date | string | number): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Меньше минуты
    if (seconds < 60) {
      return 'только что';
    }

    // Минуты
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return this.pluralize(minutes, 'минуту', 'минуты', 'минут') + ' назад';
    }

    // Часы
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return this.pluralize(hours, 'час', 'часа', 'часов') + ' назад';
    }

    // Дни
    const days = Math.floor(hours / 24);
    if (days < 30) {
      return this.pluralize(days, 'день', 'дня', 'дней') + ' назад';
    }

    // Месяцы
    const months = Math.floor(days / 30);
    if (months < 12) {
      return this.pluralize(months, 'месяц', 'месяца', 'месяцев') + ' назад';
    }

    // Годы
    const years = Math.floor(months / 12);
    return this.pluralize(years, 'год', 'года', 'лет') + ' назад';
  }

  /**
   * Возвращает правильную форму множественного числа для русского языка
   *
   * @param count - количество
   * @param one - форма для 1 (1 минута)
   * @param few - форма для 2-4 (2 минуты)
   * @param many - форма для 5+ (5 минут)
   */
  private pluralize(count: number, one: string, few: string, many: string): string {
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod10 === 1 && mod100 !== 11) {
      return `${count} ${one}`;
    }
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
      return `${count} ${few}`;
    }
    return `${count} ${many}`;
  }
}

