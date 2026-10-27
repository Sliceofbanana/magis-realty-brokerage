export type CsvCell = string | number | boolean | Date | null | undefined;

/**
 * Characters a spreadsheet treats as the start of a formula. Cells holding
 * visitor-supplied text (names, messages) could otherwise run as one when an
 * admin opens the export in Excel or Sheets — "=HYPERLINK(...)" and the like.
 */
const FORMULA_START = /^[=+\-@\t\r]/;

function cell(value: CsvCell): string {
  if (value === null || value === undefined) return "";
  let text = value instanceof Date ? value.toISOString() : String(value);
  if (typeof value === "string" && FORMULA_START.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** RFC 4180 CSV with a UTF-8 BOM so Excel reads names like "Peña" correctly. */
export function toCsv(header: string[], rows: CsvCell[][]): string {
  return "﻿" + [header, ...rows].map((row) => row.map(cell).join(",")).join("\r\n") + "\r\n";
}
