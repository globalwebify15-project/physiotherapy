'use client';

import React, { useState, useMemo } from 'react';
import DirectoryToolbar from './DirectoryToolbar';
import AddStaffModal from './AddStaffModal';
import ExportModal, { ColumnDef } from './ExportModal';
import { exportToCsv } from '@/utils/exportCsv';
import { useToast } from './ToastProvider';
import { Users, ShieldCheck, Mail, Phone, Lock, CheckCircle2, XCircle } from 'lucide-react';

interface StaffDirectoryClientProps {
  staffUsers: any[];
  onAdd: (formData: FormData) => Promise<void>;
  onUpdate: (formData: FormData) => Promise<void>;
}

export default function StaffDirectoryClient({
  staffUsers,
  onAdd,
  onUpdate,
}: StaffDirectoryClientProps) {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const roleOptions = [
    { label: 'Super Administrator', value: 'superadmin' },
    { label: 'Clinic Administrator', value: 'admin' },
    { label: 'Receptionist', value: 'receptionist' },
    { label: 'Physiotherapist', value: 'therapist' },
  ];

  const statusOptions = [
    { label: 'Active Accounts', value: 'active' },
    { label: 'Inactive / Suspended', value: 'inactive' },
  ];

  const filteredStaff = useMemo(() => {
    return staffUsers.filter((u) => {
      // Role filter
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;

      // Status filter
      if (statusFilter === 'active' && !u.isActive) return false;
      if (statusFilter === 'inactive' && u.isActive) return false;

      // Search text
      if (search.trim()) {
        const q = search.toLowerCase();
        const emailMatch = (u.email || '').toLowerCase().includes(q);
        const mobileMatch = (u.mobile || '').toLowerCase().includes(q);
        const roleMatch = (u.role || '').toLowerCase().includes(q);
        if (!emailMatch && !mobileMatch && !roleMatch) return false;
      }

      return true;
    });
  }, [staffUsers, search, roleFilter, statusFilter]);

  const handleExport = () => {
    const exportRows = filteredStaff.map((u) => ({
      'Email': u.email || 'N/A',
      'Mobile Phone': u.mobile || 'N/A',
      'Assigned Role': u.role?.toUpperCase() || 'RECEPTIONIST',
      'Status': u.isActive ? 'Active' : 'Suspended',
      'Created At': u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : 'N/A',
    }));
    exportToCsv('Clinic_Staff_Roles', exportRows);
    toast.success('Export Complete', `Exported ${exportRows.length} staff records.`);
  };

  const exportColumns: ColumnDef[] = [
    { key: 'email', label: 'Email Address', accessor: (u) => u.email || 'N/A' },
    { key: 'mobile', label: 'Mobile Number', accessor: (u) => u.mobile || 'N/A' },
    { key: 'role', label: 'Assigned Role', accessor: (u) => u.role?.toUpperCase() || 'STAFF' },
    { key: 'status', label: 'Account Status', accessor: (u) => u.isActive ? 'ACTIVE' : 'SUSPENDED' },
    { key: 'createdAt', label: 'Registered Date', accessor: (u) => u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : 'N/A' },
  ];

  const handleStatusUpdate = async (formData: FormData, email: string) => {
    try {
      await onUpdate(formData);
      toast.success('Staff Account Updated', `Access permissions updated for ${email}.`);
    } catch (err: any) {
      toast.error('Update Failed', err?.message || 'Could not update staff account.');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'admin':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'therapist':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'receptionist':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Search, Filter, Export & Provision Modal Toolbar */}
      <DirectoryToolbar
        label="Staff Directory"
        totalCount={staffUsers.length}
        filteredCount={filteredStaff.length}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search staff by email, mobile number or role..."
        filterOptions={roleOptions}
        filterValue={roleFilter}
        onFilterChange={setRoleFilter}
        filterLabel="Role"
        secondaryFilterOptions={statusOptions}
        secondaryFilterValue={statusFilter}
        onSecondaryFilterChange={setStatusFilter}
        secondaryFilterLabel="Status"
        onExport={handleExport}
        onCustomExport={() => setIsExportModalOpen(true)}
        actionButton={<AddStaffModal onAdd={onAdd} />}
        showViewToggle={false}
      />

      {/* Custom Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Staff & Roles CSV with Custom Values"
        data={staffUsers}
        dateField="createdAt"
        availableColumns={exportColumns}
        filename="Staff_Directory"
      />

      {/* Directory Content (Full Width Table) */}
      {filteredStaff.length === 0 ? (
        <div className="w-full bg-white p-12 rounded-3xl border border-slate-200/80 shadow-xs text-center">
          <Users className="mx-auto text-slate-300 w-12 h-12 mb-4" />
          <h3 className="font-bold text-slate-800 text-lg">No matching staff accounts found</h3>
          <p className="text-slate-400 text-xs mt-1">Try adjusting your search criteria or filters.</p>
        </div>
      ) : (
        <div className="w-full bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-5">Staff Member</th>
                  <th className="py-3.5 px-4">Contact Mobile</th>
                  <th className="py-3.5 px-4">Role & Access Tier</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-5 text-right">Role Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredStaff.map((u: any) => (
                  <tr key={String(u._id)} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 font-extrabold flex items-center justify-center text-xs border border-teal-100 uppercase shrink-0">
                          {u.email ? u.email.charAt(0) : 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{u.email}</div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: {String(u._id).slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{u.mobile || 'Not registered'}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold border uppercase tracking-wider ${getRoleBadge(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          <CheckCircle2 size={12} className="text-emerald-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                          <XCircle size={12} className="text-rose-500" />
                          Suspended
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-2">
                        {/* Role update form */}
                        <form
                          action={async (fd) => {
                            await handleStatusUpdate(fd, u.email || 'staff');
                          }}
                          className="inline-flex items-center gap-1.5"
                        >
                          <input type="hidden" name="userId" value={String(u._id)} />
                          <input type="hidden" name="actionType" value="update_role" />
                          <select
                            name="newRole"
                            defaultValue={u.role}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-700 focus:outline-none focus:border-teal-500"
                          >
                            <option value="receptionist">Receptionist</option>
                            <option value="admin">Admin</option>
                            <option value="therapist">Therapist</option>
                            <option value="superadmin">Superadmin</option>
                          </select>
                          <button
                            type="submit"
                            className="bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md transition-colors shadow-2xs cursor-pointer"
                          >
                            Set
                          </button>
                        </form>

                        {/* Status toggle form */}
                        <form
                          action={async (fd) => {
                            await handleStatusUpdate(fd, u.email || 'staff');
                          }}
                          className="inline-block"
                        >
                          <input type="hidden" name="userId" value={String(u._id)} />
                          <input type="hidden" name="actionType" value="toggle_status" />
                          <button
                            type="submit"
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                              u.isActive
                                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </form>
                      </div>
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

