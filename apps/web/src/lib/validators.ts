/** Shared form validators — TransitOps client-side mirrors of API rules */

export function isValidEmail(value: string): boolean {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value.trim());
}

export function email(value: string, label = "Email"): string | null {
  const trimmed = value.trim();
  if (!trimmed) return `${label} is required`;
  return isValidEmail(trimmed) ? null : `${label} must be a valid email address`;
}

export function required(value: string, label = "This field"): string | null {
  return value.trim() ? null : `${label} is required`;
}

export function minLength(value: string, min: number, label = "This field"): string | null {
  return value.trim().length >= min ? null : `${label} must be at least ${min} characters`;
}

/** Mirrors API UserCreate: password 8–128 chars with complexity constraints */
export function password(value: string, label = "Password"): string | null {
  if (!value) return `${label} is required`;
  if (value.length < 8) return `${label} must be at least 8 characters`;
  if (value.length > 128) return `${label} must be at most 128 characters`;

  const hasUppercase = /[A-Z]/.test(value);
  const hasLowercase = /[a-z]/.test(value);
  const hasDigit = /[0-9]/.test(value);
  const hasSpecial = /[^A-Za-z0-9]/.test(value);

  if (!hasUppercase) return `${label} must contain at least one uppercase letter`;
  if (!hasLowercase) return `${label} must contain at least one lowercase letter`;
  if (!hasDigit) return `${label} must contain at least one number`;
  if (!hasSpecial) return `${label} must contain at least one special character`;

  return null;
}


export function positiveNumber(value: string | number, label = "This field"): string | null {
  const raw = typeof value === "number" ? String(value) : value.trim();
  if (!raw) return `${label} is required`;

  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return `${label} must be a number`;
  if (parsed <= 0) return `${label} must be greater than zero`;
  return null;
}

export function cargoWithinMaxLoad(cargoKg: number, maxLoadKg: number): string | null {
  if (!Number.isFinite(cargoKg) || cargoKg <= 0) {
    return "Cargo weight must be greater than zero";
  }
  if (!Number.isFinite(maxLoadKg) || maxLoadKg <= 0) {
    return "Vehicle max load is invalid";
  }
  if (cargoKg > maxLoadKg) {
    return `Cargo weight ${cargoKg} kg exceeds vehicle capacity ${maxLoadKg} kg`;
  }
  return null;
}

/** Mirrors API: Final odometer cannot be less than current vehicle odometer */
export function odometerNotBelowCurrent(finalOdometer: number, currentOdometer: number): string | null {
  if (!Number.isFinite(finalOdometer) || finalOdometer < 0) {
    return "Final odometer must be zero or greater";
  }
  if (finalOdometer < currentOdometer) {
    return "Final odometer cannot be less than current vehicle odometer";
  }
  return null;
}

export function licenseNotExpired(
  expiryIso: string,
  referenceDate: Date = new Date(),
  driverName = "Driver",
): string | null {
  const trimmed = expiryIso.trim();
  if (!trimmed) return "License expiry date is required";

  const expiry = new Date(trimmed);
  if (Number.isNaN(expiry.getTime())) return "License expiry date is invalid";

  const today = new Date(referenceDate);
  today.setUTCHours(0, 0, 0, 0);
  expiry.setUTCHours(0, 0, 0, 0);

  if (expiry >= today) return null;
  const isoDate = trimmed.slice(0, 10);
  return `Driver '${driverName}' has an expired license (${isoDate})`;
}
