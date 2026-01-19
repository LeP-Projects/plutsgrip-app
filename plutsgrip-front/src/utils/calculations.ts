/**
 * Calculation utilities for dashboard statistics
 */

/**
 * Calculate the percentage change between two values
 * @param current - Current value
 * @param previous - Previous value for comparison
 * @returns Percentage change (can be positive or negative)
 */
export function calculatePercentageChange(
  current: number,
  previous: number
): number {
  // Avoid division by zero
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }
  return ((current - previous) / previous) * 100;
}

/**
 * Calculate budget usage percentage
 * @param spent - Amount spent
 * @param budget - Total budget allocated
 * @returns Usage percentage (0-100+)
 */
export function calculateBudgetUsage(spent: number, budget: number): number {
  if (budget === 0) {
    return spent === 0 ? 0 : 100;
  }
  return (spent / budget) * 100;
}

/**
 * Format a number as a percentage string
 * @param value - Numeric value (e.g., 2.5 for +2.5%)
 * @param decimalPlaces - Number of decimal places (default: 1)
 * @returns Formatted string (e.g., "+2.5%" or "-5.0%")
 */
export function formatPercentage(value: number, decimalPlaces: number = 1): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimalPlaces)}%`;
}

/**
 * Determine if a change is positive or negative
 * @param value - Percentage value
 * @returns 'positive', 'negative', or 'neutral'
 */
export function getChangeType(value: number): 'positive' | 'negative' | 'neutral' {
  if (value > 0) return 'positive';
  if (value < 0) return 'negative';
  return 'neutral';
}

/**
 * Sum an array of numbers
 * @param numbers - Array of numbers
 * @returns Sum of all numbers
 */
export function sum(numbers: number[]): number {
  return numbers.reduce((acc, num) => acc + (num || 0), 0);
}

/**
 * Calculate average of an array
 * @param numbers - Array of numbers
 * @returns Average value
 */
export function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return sum(numbers) / numbers.length;
}
