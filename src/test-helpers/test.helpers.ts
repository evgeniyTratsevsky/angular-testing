/**
 * Test Helper Utilities
 *
 * Common utilities and helpers for testing Angular applications
 */

import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

/**
 * Query a single element by CSS selector
 */
export function queryByCss<T>(
  fixture: ComponentFixture<T>,
  selector: string
): HTMLElement | null {
  return fixture.nativeElement.querySelector(selector);
}

/**
 * Query multiple elements by CSS selector
 */
export function queryAllByCss<T>(
  fixture: ComponentFixture<T>,
  selector: string
): HTMLElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll(selector));
}

/**
 * Query element by test ID attribute
 */
export function queryByTestId<T>(
  fixture: ComponentFixture<T>,
  testId: string
): HTMLElement | null {
  return queryByCss(fixture, `[data-testid="${testId}"]`);
}

/**
 * Query all elements by test ID attribute
 */
export function queryAllByTestId<T>(
  fixture: ComponentFixture<T>,
  testId: string
): HTMLElement[] {
  return queryAllByCss(fixture, `[data-testid="${testId}"]`);
}

/**
 * Click an element
 */
export function click(element: HTMLElement | null): void {
  if (!element) {
    throw new Error('Element not found for click');
  }
  element.click();
}

/**
 * Set input value and dispatch input event
 */
export function setInputValue(
  input: HTMLInputElement | null,
  value: string
): void {
  if (!input) {
    throw new Error('Input element not found');
  }
  input.value = value;
  input.dispatchEvent(new Event('input'));
  input.dispatchEvent(new Event('change'));
}

/**
 * Trigger a keyboard event
 */
export function triggerKeyboardEvent(
  element: HTMLElement | null,
  eventType: 'keyup' | 'keydown' | 'keypress',
  key: string
): void {
  if (!element) {
    throw new Error('Element not found for keyboard event');
  }
  const event = new KeyboardEvent(eventType, { key });
  element.dispatchEvent(event);
}

/**
 * Get text content of an element
 */
export function getTextContent(element: HTMLElement | null): string {
  if (!element) {
    return '';
  }
  return element.textContent?.trim() || '';
}

/**
 * Check if element has a specific class
 */
export function hasClass(element: HTMLElement | null, className: string): boolean {
  if (!element) {
    return false;
  }
  return element.classList.contains(className);
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean,
  timeout: number = 3000
): Promise<void> {
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}

/**
 * Create a mock for a service with specified methods
 */
export function createSpyObj<T>(
  baseName: string,
  methodNames: (keyof T)[]
): jasmine.SpyObj<T> {
  return jasmine.createSpyObj(baseName, methodNames as string[]);
}

/**
 * Mock data generators
 */
export class MockDataFactory {
  /**
   * Generate a random string
   */
  static randomString(length: number = 10): string {
    return Math.random().toString(36).substring(2, length + 2);
  }

  /**
   * Generate a random number
   */
  static randomNumber(min: number = 0, max: number = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generate a random boolean
   */
  static randomBoolean(): boolean {
    return Math.random() > 0.5;
  }

  /**
   * Generate a random date
   */
  static randomDate(start: Date = new Date(2020, 0, 1), end: Date = new Date()): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }
}

/**
 * Assertion helpers
 */
export class TestAssertions {
  /**
   * Assert that an element exists
   */
  static expectElementToExist(element: HTMLElement | null): void {
    expect(element).toBeTruthy();
    expect(element).not.toBeNull();
  }

  /**
   * Assert that an element does not exist
   */
  static expectElementNotToExist(element: HTMLElement | null): void {
    expect(element).toBeFalsy();
  }

  /**
   * Assert element has text
   */
  static expectElementToHaveText(element: HTMLElement | null, expectedText: string): void {
    this.expectElementToExist(element);
    const actualText = getTextContent(element);
    expect(actualText).toBe(expectedText);
  }

  /**
   * Assert element contains text
   */
  static expectElementToContainText(element: HTMLElement | null, expectedText: string): void {
    this.expectElementToExist(element);
    const actualText = getTextContent(element);
    expect(actualText).toContain(expectedText);
  }

  /**
   * Assert element has class
   */
  static expectElementToHaveClass(element: HTMLElement | null, className: string): void {
    this.expectElementToExist(element);
    expect(hasClass(element, className)).toBe(true);
  }

  /**
   * Assert element is visible
   */
  static expectElementToBeVisible(element: HTMLElement | null): void {
    this.expectElementToExist(element);
    expect(element!.offsetParent).not.toBeNull();
  }

  /**
   * Assert element is disabled
   */
  static expectElementToBeDisabled(element: HTMLElement | null): void {
    this.expectElementToExist(element);
    expect((element as HTMLButtonElement | HTMLInputElement).disabled).toBe(true);
  }
}

/**
 * Example usage in tests:
 *
 * describe('MyComponent', () => {
 *   let fixture: ComponentFixture<MyComponent>;
 *
 *   it('should display title', () => {
 *     const titleElement = queryByTestId(fixture, 'title');
 *     TestAssertions.expectElementToHaveText(titleElement, 'Expected Title');
 *   });
 *
 *   it('should handle click', () => {
 *     const button = queryByTestId(fixture, 'submit-button');
 *     click(button);
 *     // assertions...
 *   });
 *
 *   it('should handle input', () => {
 *     const input = queryByTestId(fixture, 'email-input') as HTMLInputElement;
 *     setInputValue(input, 'test@example.com');
 *     fixture.detectChanges();
 *     // assertions...
 *   });
 * });
 */

