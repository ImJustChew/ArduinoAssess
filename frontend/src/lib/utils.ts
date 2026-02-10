// Utility functions for ArduinoAssess frontend
// Based on shadcn/ui utilities

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names with Tailwind merge support
 * Used throughout the app for conditional styling
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format milliseconds to human-readable time
 */
export function formatTime(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

/**
 * Format dimension name for display
 */
export function formatDimensionName(dimension: string): string {
  const names: Record<string, string> = {
    lowLevelBinary: 'Low-Level & Binary',
    controlFlow: 'Control Flow & Logic',
    hardwareIO: 'Hardware I/O',
    codeReading: 'Code Reading & Debugging',
    decomposition: 'Problem Decomposition',
  };
  return names[dimension] || dimension;
}

/**
 * Get difficulty level label
 */
export function getDifficultyLabel(level: number): string {
  const labels = ['', 'Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'];
  return labels[level] || 'Unknown';
}

/**
 * Get dimension color class
 */
export function getDimensionColor(dimension: string): string {
  const colors: Record<string, string> = {
    lowLevelBinary: 'text-blue-600 border-blue-600',
    controlFlow: 'text-green-600 border-green-600',
    hardwareIO: 'text-orange-600 border-orange-600',
    codeReading: 'text-purple-600 border-purple-600',
    decomposition: 'text-red-600 border-red-600',
  };
  return colors[dimension] || 'text-gray-600 border-gray-600';
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Debounce function for input handling
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Safely parse JSON with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Get ordinal suffix for numbers (1st, 2nd, 3rd, etc.)
 */
export function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
