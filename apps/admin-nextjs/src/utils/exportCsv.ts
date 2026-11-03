/**
 * Client-side CSV Exporter Utility
 * Automatically converts an array of objects into a properly escaped CSV file and initiates a browser download.
 * Supports both signatures: exportToCsv(filename, rows) and exportToCsv(rows, filename).
 */
export function exportToCsv(
  firstArg: string | Record<string, any>[],
  secondArg?: Record<string, any>[] | string
) {
  let filename = 'export';
  let rows: Record<string, any>[] = [];

  if (typeof firstArg === 'string') {
    filename = firstArg;
    rows = (secondArg as Record<string, any>[]) || [];
  } else if (Array.isArray(firstArg)) {
    rows = firstArg;
    if (typeof secondArg === 'string') {
      filename = secondArg;
    }
  }

  if (!rows || rows.length === 0) {
    alert('No data available to export.');
    return;
  }

  const cleanFilename = filename.endsWith('.csv') ? filename.slice(0, -4) : filename;
  const headers = Object.keys(rows[0]);
  const csvLines: string[] = [];

  // 1. Header row
  csvLines.push(headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','));

  // 2. Data rows
  for (const row of rows) {
    const line = headers.map(header => {
      let val = row[header];
      if (val === null || val === undefined) {
        val = '';
      } else if (typeof val === 'object') {
        val = JSON.stringify(val);
      } else {
        val = String(val);
      }
      return `"${val.replace(/"/g, '""')}"`;
    });
    csvLines.push(line.join(','));
  }

  const csvContent = csvLines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${cleanFilename}_${dateStr}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
