// Generic HH:MM time helpers. Business rules stay in modules, not here.

export function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

