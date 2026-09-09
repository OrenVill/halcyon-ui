export type ClassValue = string | false | null | undefined

/** Joins truthy class names with a space. Order is preserved. */
export function cx(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ')
}
