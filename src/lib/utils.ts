import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const BENGALI_MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

/**
 * Converts English digits to Bengali digits
 */
export function toBengaliNumber(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return '০';
  const str = String(num);
  return str.replace(/\d/g, (d) => BENGALI_DIGITS[parseInt(d, 10)] || d);
}

/**
 * Formats a date string (YYYY-MM-DD or ISO) into Bengali format: "১৮ অক্টোবর ২০২৬"
 */
export function formatBengaliDate(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return '—';
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);

    const day = toBengaliNumber(d.getDate());
    const month = BENGALI_MONTHS[d.getMonth()];
    const year = toBengaliNumber(d.getFullYear());

    return `${day} ${month} ${year}`;
  } catch {
    return String(dateInput);
  }
}

/**
 * Formats time into Bengali 12-hour format: "১০:৩০ AM"
 */
export function formatBengaliTime(timeStr?: string): string {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  if (!h || !m) return timeStr;
  const hourNum = parseInt(h, 10);
  const period = hourNum >= 12 ? 'PM' : 'AM';
  const displayHour = hourNum % 12 || 12;
  return `${toBengaliNumber(displayHour)}:${toBengaliNumber(m)} ${period}`;
}

/**
 * Generates UTF-8 BOM CSV data string to ensure Excel displays Bengali characters cleanly
 */
export function generateUtf8Csv(headers: string[], rows: (string | number)[][]): string {
  const BOM = '\uFEFF';
  const escapeCell = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const headerRow = headers.map(escapeCell).join(',');
  const dataRows = rows.map((row) => row.map(escapeCell).join(',')).join('\n');

  return BOM + headerRow + '\n' + dataRows;
}
