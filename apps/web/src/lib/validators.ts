/** Shared form validators — smoke-test touch by Anand */

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function required(value: string, label = "This field"): string | null {
  return value.trim() ? null : `${label} is required`;
}

export function minLength(value: string, min: number, label = "This field"): string | null {
  return value.trim().length >= min ? null : `${label} must be at least ${min} characters`;
}
