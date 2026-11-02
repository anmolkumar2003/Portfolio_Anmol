export function formatMonthYear(value: string): string {
  const [year, month] = value.split('-');

  if (!year) {
    return value;
  }

  if (!month) {
    return year;
  }

  const parsed = new Date(Number(year), Number(month) - 1);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
  }).format(parsed);
}

export function formatDateRange(start: string, end: string | null): string {
  const startLabel = formatMonthYear(start);

  if (end === null) {
    return `${startLabel} — Present`;
  }

  return `${startLabel} — ${formatMonthYear(end)}`;
}

export function formatOptionalDateRange(
  start: string | null,
  end: string | null,
): string | null {
  if (!start) {
    return null;
  }

  return formatDateRange(start, end);
}

export function formatPlatform(platform: string): string {
  switch (platform) {
    case 'ios':
      return 'iOS';
    case 'flutter':
      return 'Flutter';
    case 'cross-platform':
      return 'Cross-platform';
    default:
      return platform;
  }
}
