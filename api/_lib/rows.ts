export function readStringField(
  row: unknown,
  field: string,
): string | null {
  if (!row || typeof row !== 'object') {
    return null;
  }

  if (!(field in row)) {
    return null;
  }

  const value = (row as Record<string, unknown>)[field];
  return typeof value === 'string' ? value : null;
}
