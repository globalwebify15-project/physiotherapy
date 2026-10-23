'use client';

import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Printer, ChevronDown } from 'lucide-react';

interface ReportDownloaderProps {
  filename: string;
  data: Record<string, any>[];
  buttonText?: string;
}

export default function ReportDownloader({
  filename,
  data,
  buttonText = 'Export Report',
}: ReportDownloaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const downloadCSV = () => {
    setDropdownOpen(false);
    if (!data || data.length === 0) {
      alert('No data available to export.');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of data) {
      const values = headers.map((header) => {
        const val = row[header] ?? '';
        const escaped = ('' + val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadExcel = () => {
    setDropdownOpen(false);
    if (!data || data.length === 0) {
      alert('No data available to export.');
      return;
    }

    const headers = Object.keys(data[0]);
    let excelContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>QuickPhysio Report</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
        <style>
          th { background-color: #0F766E; color: #FFFFFF; font-weight: bold; border: 1px solid #CBD5E1; padding: 8px; }
          td { border: 1px solid #E2E8F0; padding: 6px; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              ${headers.map((h) => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data
              .map(
                (row) => `
              <tr>
                ${headers.map((h) => `<td>${row[h] ?? ''}</td>`).join('')}
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printReport = () => {
    setDropdownOpen(false);
    if (!data || data.length === 0) {
      alert('No data available to export.');
      return;
    }

    const headers = Object.keys(data[0]);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${filename} - QuickPhysio Clinic Report</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #1E293B; }
            h1 { font-size: 20px; font-weight: bold; color: #0F766E; margin-bottom: 4px; }
            p { font-size: 12px; color: #64748B; margin-top: 0; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th { background: #F1F5F9; border: 1px solid #CBD5E1; padding: 8px; text-align: left; font-weight: bold; }
            td { border: 1px solid #E2E8F0; padding: 8px; }
            tr:nth-child(even) { background: #F8FAFC; }
          </style>
        </head>
        <body>
          <h1>QuickPhysio24.com — Clinical Report</h1>
          <p>Exported: ${new Date().toLocaleString()} | Total Records: ${data.length}</p>
          <table>
            <thead>
              <tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${data
                .map(
                  (r) =>
                    `<tr>${headers.map((h) => `<td>${r[h] ?? ''}</td>`).join('')}</tr>`
                )
                .join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-xs"
      >
        <Download size={14} />
        <span>{buttonText}</span>
        <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {dropdownOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-2xl shadow-xl bg-white ring-1 ring-black/5 divide-y divide-slate-100 focus:outline-none z-50 animate-scale-up">
          <div className="py-1">
            <button
              onClick={downloadExcel}
              className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700 flex items-center gap-2.5"
            >
              <FileSpreadsheet size={15} className="text-emerald-600" />
              <span>Export as Excel (.xls)</span>
            </button>
            <button
              onClick={downloadCSV}
              className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700 flex items-center gap-2.5"
            >
              <FileText size={15} className="text-teal-600" />
              <span>Export as CSV (.csv)</span>
            </button>
            <button
              onClick={printReport}
              className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700 flex items-center gap-2.5"
            >
              <Printer size={15} className="text-slate-500" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
