'use client';

import React, { useState, useMemo } from 'react';
import DirectoryToolbar from './DirectoryToolbar';
import BroadcastNotificationModal from './BroadcastNotificationModal';
import ExportModal, { ColumnDef } from './ExportModal';
import { exportToCsv } from '@/utils/exportCsv';
import { useToast } from './ToastProvider';
import { Bell, Megaphone, Clock, CheckCheck } from 'lucide-react';

interface NotificationsDirectoryClientProps {
  notifications: any[];
  patients: any[];
  onBroadcast: (formData: FormData) => Promise<void>;
}

export default function NotificationsDirectoryClient({
  notifications,
  patients,
  onBroadcast,
}: NotificationsDirectoryClientProps) {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const categoryOptions = [
    { label: 'Announcements', value: 'announcement' },
    { label: 'Booking Alerts', value: 'booking_alert' },
    { label: 'Payment Alerts', value: 'payment_alert' },
    { label: 'Reminders', value: 'reminder' },
  ];

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // Category filter
      if (categoryFilter !== 'all' && n.type !== categoryFilter) return false;

      // Search text
      if (search.trim()) {
        const q = search.toLowerCase();
        const titleMatch = (n.title || '').toLowerCase().includes(q);
        const bodyMatch = (n.body || '').toLowerCase().includes(q);
        const recipientMatch = n.userId?.mobile?.toLowerCase().includes(q) || n.userId?.name?.toLowerCase().includes(q);
        if (!titleMatch && !bodyMatch && !recipientMatch) return false;
      }

      return true;
    });
  }, [notifications, search, categoryFilter]);

  const handleExport = () => {
    const exportRows = filteredNotifications.map((n) => ({
      'Title': n.title || 'N/A',
      'Body Message': n.body || 'N/A',
      'Category': n.type || 'announcement',
      'Recipient': n.userId?.mobile || 'Broadcast / User',
      'Dispatched At': n.createdAt ? new Date(n.createdAt).toLocaleString() : 'N/A',
      'Read Status': n.isRead ? 'Read' : 'Delivered',
    }));
    exportToCsv('Notification_Dispatch_Log', exportRows);
    toast.success('Export Complete', `Exported ${exportRows.length} notification logs.`);
  };

  const exportColumns: ColumnDef[] = [
    { key: 'title', label: 'Notification Title', accessor: (n) => n.title || 'N/A' },
    { key: 'body', label: 'Message Body', accessor: (n) => n.body || 'N/A' },
    { key: 'type', label: 'Category', accessor: (n) => n.type || 'announcement' },
    { key: 'recipient', label: 'Recipient Mobile / User', accessor: (n) => n.userId?.mobile || 'Broadcast' },
    { key: 'createdAt', label: 'Dispatched At', accessor: (n) => n.createdAt ? new Date(n.createdAt).toLocaleString() : 'N/A' },
    { key: 'isRead', label: 'Read Status', accessor: (n) => n.isRead ? 'Read' : 'Delivered' },
  ];

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'announcement':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'booking_alert':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'payment_alert':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'reminder':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Search, Filter, Export & Broadcast Modal Toolbar */}
      <DirectoryToolbar
        label="Notification Center"
        totalCount={notifications.length}
        filteredCount={filteredNotifications.length}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search notifications by title, content or recipient..."
        filterOptions={categoryOptions}
        filterValue={categoryFilter}
        onFilterChange={setCategoryFilter}
        filterLabel="Category"
        onExport={handleExport}
        onCustomExport={() => setIsExportModalOpen(true)}
        actionButton={<BroadcastNotificationModal patients={patients} onBroadcast={onBroadcast} />}
        showViewToggle={false}
      />

      {/* Custom Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Notifications Dispatch Log CSV with Custom Values"
        data={notifications}
        dateField="createdAt"
        availableColumns={exportColumns}
        filename="Notification_Dispatch_Log"
      />

      {/* Directory Content (Full Width Table) */}
      {filteredNotifications.length === 0 ? (
        <div className="w-full bg-white p-12 rounded-3xl border border-slate-200/80 shadow-xs text-center">
          <Bell className="mx-auto text-slate-300 w-12 h-12 mb-4" />
          <h3 className="font-bold text-slate-800 text-lg">No dispatched notifications found</h3>
          <p className="text-slate-400 text-xs mt-1">Try adjusting your search criteria or category filter.</p>
        </div>
      ) : (
        <div className="w-full bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-5">Notification Title & Content</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Recipient</th>
                  <th className="py-3.5 px-4">Dispatched Date & Time</th>
                  <th className="py-3.5 px-5 text-right">Delivery Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredNotifications.map((n: any) => (
                  <tr key={String(n._id)} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-900 text-sm">{n.title}</div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 max-w-lg mt-0.5" title={n.body}>
                        {n.body}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getTypeBadge(n.type)}`}>
                        {n.type ? n.type.replace('_', ' ') : 'ALERT'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">
                        {n.userId?.mobile || 'Broadcast / Patient'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-slate-400 shrink-0" />
                        <span>
                          {n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }) : 'Recent'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {n.isRead ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                          <CheckCheck size={12} /> Read
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                          Sent
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

