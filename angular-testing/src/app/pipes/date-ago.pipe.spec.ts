/**
 * Тесты для DateAgoPipe
 *
 * Демонстрирует тестирование pipe с:
 * - Работой со временем
 * - Условной логикой
 * - Pluralization (множественное число)
 * - Различными входными форматами
 */

import { DateAgoPipe } from './date-ago.pipe';

describe('DateAgoPipe', () => {
  let pipe: DateAgoPipe;

  beforeEach(() => {
    pipe = new DateAgoPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  /**
   * Группа тестов: секунды
   */
  describe('Seconds', () => {
    it('должен вернуть "только что" для даты меньше минуты назад', () => {
      const now = new Date();
      const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);

      const result = pipe.transform(thirtySecondsAgo);
      expect(result).toBe('только что');
    });

    it('должен вернуть "только что" для текущей даты', () => {
      const now = new Date();
      const result = pipe.transform(now);
      expect(result).toBe('только что');
    });
  });

  /**
   * Группа тестов: минуты
   */
  describe('Minutes', () => {
    it('должен вернуть "1 минуту назад"', () => {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 1 * 60 * 1000);

      const result = pipe.transform(oneMinuteAgo);
      expect(result).toBe('1 минуту назад');
    });

    it('должен вернуть "5 минут назад"', () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      const result = pipe.transform(fiveMinutesAgo);
      expect(result).toBe('5 минут назад');
    });

    it('должен вернуть "2 минуты назад"', () => {
      const now = new Date();
      const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);

      const result = pipe.transform(twoMinutesAgo);
      expect(result).toBe('2 минуты назад');
    });

    it('должен вернуть "59 минут назад"', () => {
      const now = new Date();
      const fiftyNineMinutesAgo = new Date(now.getTime() - 59 * 60 * 1000);

      const result = pipe.transform(fiftyNineMinutesAgo);
      expect(result).toBe('59 минут назад');
    });
  });

  /**
   * Группа тестов: часы
   */
  describe('Hours', () => {
    it('должен вернуть "1 час назад"', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);

      const result = pipe.transform(oneHourAgo);
      expect(result).toBe('1 час назад');
    });

    it('должен вернуть "3 часа назад"', () => {
      const now = new Date();
      const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);

      const result = pipe.transform(threeHoursAgo);
      expect(result).toBe('3 часа назад');
    });

    it('должен вернуть "5 часов назад"', () => {
      const now = new Date();
      const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000);

      const result = pipe.transform(fiveHoursAgo);
      expect(result).toBe('5 часов назад');
    });

    it('должен вернуть "23 часа назад"', () => {
      const now = new Date();
      const twentyThreeHoursAgo = new Date(now.getTime() - 23 * 60 * 60 * 1000);

      const result = pipe.transform(twentyThreeHoursAgo);
      expect(result).toBe('23 часа назад');
    });
  });

  /**
   * Группа тестов: дни
   */
  describe('Days', () => {
    it('должен вернуть "1 день назад"', () => {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

      const result = pipe.transform(oneDayAgo);
      expect(result).toBe('1 день назад');
    });

    it('должен вернуть "3 дня назад"', () => {
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

      const result = pipe.transform(threeDaysAgo);
      expect(result).toBe('3 дня назад');
    });

    it('должен вернуть "7 дней назад"', () => {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const result = pipe.transform(sevenDaysAgo);
      expect(result).toBe('7 дней назад');
    });
  });

  /**
   * Группа тестов: месяцы
   */
  describe('Months', () => {
    it('должен вернуть "1 месяц назад"', () => {
      const now = new Date();
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const result = pipe.transform(oneMonthAgo);
      expect(result).toBe('1 месяц назад');
    });

    it('должен вернуть "3 месяца назад"', () => {
      const now = new Date();
      const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

      const result = pipe.transform(threeMonthsAgo);
      expect(result).toBe('3 месяца назад');
    });

    it('должен вернуть "6 месяцев назад"', () => {
      const now = new Date();
      const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

      const result = pipe.transform(sixMonthsAgo);
      expect(result).toBe('6 месяцев назад');
    });
  });

  /**
   * Группа тестов: годы
   */
  describe('Years', () => {
    it('должен вернуть "1 год назад"', () => {
      const now = new Date();
      const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

      const result = pipe.transform(oneYearAgo);
      expect(result).toBe('1 год назад');
    });

    it('должен вернуть "2 года назад"', () => {
      const now = new Date();
      const twoYearsAgo = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000);

      const result = pipe.transform(twoYearsAgo);
      expect(result).toBe('2 года назад');
    });

    it('должен вернуть "5 лет назад"', () => {
      const now = new Date();
      const fiveYearsAgo = new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000);

      const result = pipe.transform(fiveYearsAgo);
      expect(result).toBe('5 лет назад');
    });
  });

  /**
   * Группа тестов: различные входные форматы
   */
  describe('Input Formats', () => {
    it('должен принимать Date объект', () => {
      const date = new Date(Date.now() - 5 * 60 * 1000);
      const result = pipe.transform(date);
      expect(result).toBe('5 минут назад');
    });

    it('должен принимать timestamp (number)', () => {
      const timestamp = Date.now() - 5 * 60 * 1000;
      const result = pipe.transform(timestamp);
      expect(result).toBe('5 минут назад');
    });

    it('должен принимать ISO строку', () => {
      const isoString = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const result = pipe.transform(isoString);
      expect(result).toBe('5 минут назад');
    });
  });

  /**
   * Группа тестов: граничные случаи
   */
  describe('Edge Cases', () => {
    it('должен вернуть пустую строку для null', () => {
      const result = pipe.transform(null as any);
      expect(result).toBe('');
    });

    it('должен вернуть пустую строку для undefined', () => {
      const result = pipe.transform(undefined as any);
      expect(result).toBe('');
    });

    it('должен вернуть пустую строку для пустой строки', () => {
      const result = pipe.transform('');
      expect(result).toBe('');
    });
  });

  /**
   * Группа тестов: pluralization (множественное число)
   */
  describe('Pluralization', () => {
    it('должен правильно склонять числа заканчивающиеся на 1', () => {
      const now = new Date();

      // 1, 21, 31, 41... минуту
      const oneMinute = new Date(now.getTime() - 1 * 60 * 1000);
      expect(pipe.transform(oneMinute)).toBe('1 минуту назад');
    });

    it('должен правильно склонять числа 2-4', () => {
      const now = new Date();

      // 2, 3, 4 минуты
      const twoMinutes = new Date(now.getTime() - 2 * 60 * 1000);
      expect(pipe.transform(twoMinutes)).toBe('2 минуты назад');

      const threeMinutes = new Date(now.getTime() - 3 * 60 * 1000);
      expect(pipe.transform(threeMinutes)).toBe('3 минуты назад');

      const fourMinutes = new Date(now.getTime() - 4 * 60 * 1000);
      expect(pipe.transform(fourMinutes)).toBe('4 минуты назад');
    });

    it('должен правильно склонять числа 5-20', () => {
      const now = new Date();

      // 5, 6, ..., 20 минут
      const fiveMinutes = new Date(now.getTime() - 5 * 60 * 1000);
      expect(pipe.transform(fiveMinutes)).toBe('5 минут назад');

      const elevenMinutes = new Date(now.getTime() - 11 * 60 * 1000);
      expect(pipe.transform(elevenMinutes)).toBe('11 минут назад');
    });
  });
});

