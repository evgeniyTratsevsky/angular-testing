import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserSettings {
  theme: 'light' | 'dark';
  language: string;
  notifications: boolean;
}

/**
 * Сервис для управления настройками пользователя
 * Демонстрирует геттеры/сеттеры для тестирования с spyOnProperty
 */
@Injectable({
  providedIn: 'root'
})
export class UserSettingsService {
  private _settings: UserSettings = {
    theme: 'light',
    language: 'en',
    notifications: true
  };

  private _settings$ = new BehaviorSubject<UserSettings>(this._settings);

  // ====== Геттеры ======

  /**
   * Геттер для текущей темы
   */
  get theme(): 'light' | 'dark' {
    return this._settings.theme;
  }

  /**
   * Геттер для текущего языка
   */
  get language(): string {
    return this._settings.language;
  }

  /**
   * Геттер для статуса уведомлений
   */
  get notificationsEnabled(): boolean {
    return this._settings.notifications;
  }

  /**
   * Геттер для Observable настроек
   */
  get settings$(): Observable<UserSettings> {
    return this._settings$.asObservable();
  }

  /**
   * Геттер для текущих настроек
   */
  get currentSettings(): UserSettings {
    return { ...this._settings };
  }

  // ====== Сеттеры ======

  /**
   * Сеттер для темы
   */
  set theme(value: 'light' | 'dark') {
    this._settings.theme = value;
    this.notifyChanges();
  }

  /**
   * Сеттер для языка
   */
  set language(value: string) {
    this._settings.language = value;
    this.notifyChanges();
  }

  /**
   * Сеттер для уведомлений
   */
  set notificationsEnabled(value: boolean) {
    this._settings.notifications = value;
    this.notifyChanges();
  }

  // ====== Методы ======

  /**
   * Обновить все настройки
   */
  updateSettings(settings: Partial<UserSettings>): void {
    this._settings = { ...this._settings, ...settings };
    this.notifyChanges();
  }

  /**
   * Сбросить настройки к значениям по умолчанию
   */
  resetToDefaults(): void {
    this._settings = {
      theme: 'light',
      language: 'en',
      notifications: true
    };
    this.notifyChanges();
  }

  /**
   * Сохранить настройки в localStorage
   */
  saveToStorage(): void {
    localStorage.setItem('userSettings', JSON.stringify(this._settings));
  }

  /**
   * Загрузить настройки из localStorage
   */
  loadFromStorage(): void {
    const stored = localStorage.getItem('userSettings');
    if (stored) {
      this._settings = JSON.parse(stored);
      this.notifyChanges();
    }
  }

  /**
   * Проверить, является ли тема тёмной
   */
  isDarkTheme(): boolean {
    return this.theme === 'dark';
  }

  // ====== Приватные методы ======

  /**
   * Уведомить подписчиков об изменениях
   */
  private notifyChanges(): void {
    this._settings$.next(this._settings);
  }
}

