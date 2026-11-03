import React from 'react';
import { connectDB, User } from 'database';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import StaffDirectoryClient from '@/components/StaffDirectoryClient';
import { 
  ShieldCheck, 
  CheckCircle2, 
  ShieldAlert,
  SlidersHorizontal,
  Lock,
  XCircle
} from 'lucide-react';

export const revalidate = 0; // Dynamic real-time fetch

// Server Action: Create new clinic staff account or promote existing account
async function createStaffAction(formData: FormData) {
  'use server';
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  let mobile = (formData.get('mobile') as string)?.trim() || '';
  const password = formData.get('password') as string;
  const role = (formData.get('role') as string) || 'receptionist';

  if (!email || !mobile || !password) {
    redirect('/admin/roles?error=' + encodeURIComponent('Please provide email, mobile number, and password.'));
  }

  // Normalize mobile format: strip whitespace, dashes, parens
  mobile = mobile.replace(/[\s\-\(\)]/g, '');
  if (!mobile.startsWith('+') && mobile.length === 10) {
    mobile = '+91' + mobile;
  }

  await connectDB();
  const existing = await User.findOne({ $or: [{ email }, { mobile }] });
  
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  if (existing) {
    existing.role = role;
    existing.email = email;
    existing.mobile = mobile;
    existing.passwordHash = passwordHash;
    existing.isActive = true;
    await existing.save();

    revalidatePath('/admin/roles');
    redirect('/admin/roles?success=' + encodeURIComponent(`Account (${email}) already existed and has been successfully upgraded to ${role.toUpperCase()} with the new credentials.`));
  } else {
    await User.create({
      email,
      mobile,
      role,
      passwordHash,
      isActive: true,
    });

    revalidatePath('/admin/roles');
    redirect('/admin/roles?success=' + encodeURIComponent(`New staff account (${email}) successfully provisioned as ${role.toUpperCase()}.`));
  }
}

// Server Action: Update user role or toggle status
async function updateStaffAction(formData: FormData) {
  'use server';
  const userId = formData.get('userId') as string;
  const actionType = formData.get('actionType') as string;
  const newRole = formData.get('newRole') as string;

  if (!userId) return;

  await connectDB();
  const user = await User.findById(userId);
  if (!user) return;

  if (actionType === 'toggle_status') {
    user.isActive = !user.isActive;
  } else if (actionType === 'update_role' && newRole) {
    user.role = newRole;
  }

  await user.save();
  revalidatePath('/admin/roles');
}

export default async function RolesPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string }>;
}) {
  await connectDB();

  const params = searchParams ? await searchParams : {};
  const successMsg = params.success;
  const errorMsg = params.error;

  // Fetch all staff users (exclude patient accounts)
  const staffUsers = await User.find({
    role: { $in: ['superadmin', 'admin', 'receptionist', 'therapist'] },
  }).sort({ createdAt: -1 }).lean();

  const PERMISSION_MATRIX = [
    { module: 'Dashboard & Financial Analytics', superadmin: true, admin: true, receptionist: false, therapist: false },
    { module: 'Appointments & Rescheduling', superadmin: true, admin: true, receptionist: true, therapist: true },
    { module: 'Patient Management & Medical History', superadmin: true, admin: true, receptionist: true, therapist: true },
    { module: 'Physiotherapy Services (CRUD)', superadmin: true, admin: true, receptionist: false, therapist: false },
    { module: 'Therapist Management', superadmin: true, admin: true, receptionist: false, therapist: false },
    { module: 'Payment Records & Refunds', superadmin: true, admin: true, receptionist: false, therapist: false },
    { module: 'Push Notification Broadcasts', superadmin: true, admin: true, receptionist: true, therapist: false },
    { module: 'Review Moderation & CMS', superadmin: true, admin: true, receptionist: false, therapist: false },
    { module: 'Role & Staff Access Control', superadmin: true, admin: false, receptionist: false, therapist: false },
  ];

  return (
    <div className="space-y-6 animate-fade-in w-full">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
          <ShieldCheck className="text-teal-600" size={28} />
          Role & Staff Permission Management (RBAC)
        </h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">
          Manage staff credentials, define access tiers, and configure role-based permissions.
        </p>
      </div>

      {/* Action Feedback Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center gap-3 text-emerald-900 shadow-xs animate-fade-in">
          <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0" />
          <div className="flex-1 text-xs font-bold leading-relaxed">{successMsg}</div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200/80 rounded-2xl flex items-center gap-3 text-rose-900 shadow-xs animate-fade-in">
          <ShieldAlert size={20} className="text-rose-600 flex-shrink-0" />
          <div className="flex-1 text-xs font-bold leading-relaxed">{errorMsg}</div>
        </div>
      )}

      {/* Full-width Active Staff Directory with Search, Filters, CSV Export & Provision Modal */}
      <StaffDirectoryClient
        staffUsers={JSON.parse(JSON.stringify(staffUsers))}
        onAdd={createStaffAction}
        onUpdate={updateStaffAction}
      />

      {/* Role Permission Matrix Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-teal-600" />
          <h2 className="text-base font-extrabold text-slate-800">
            System Permission Matrix by Role
          </h2>
        </div>
        <p className="text-xs text-slate-500 font-medium">
          Access privileges enforced by JWT middleware across all API routes and Admin Portal pages.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-bold bg-slate-50/50">
                <th className="py-3 px-4">Functional Module</th>
                <th className="py-3 px-4 text-center">Super Admin</th>
                <th className="py-3 px-4 text-center">Admin</th>
                <th className="py-3 px-4 text-center">Receptionist</th>
                <th className="py-3 px-4 text-center">Therapist</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PERMISSION_MATRIX.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-700">{item.module}</td>
                  <td className="py-3 px-4 text-center">
                    {item.superadmin ? (
                      <CheckCircle2 size={16} className="text-emerald-500 inline-block" />
                    ) : (
                      <XCircle size={16} className="text-slate-300 inline-block" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.admin ? (
                      <CheckCircle2 size={16} className="text-emerald-500 inline-block" />
                    ) : (
                      <XCircle size={16} className="text-slate-300 inline-block" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.receptionist ? (
                      <CheckCircle2 size={16} className="text-emerald-500 inline-block" />
                    ) : (
                      <XCircle size={16} className="text-slate-300 inline-block" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.therapist ? (
                      <CheckCircle2 size={16} className="text-emerald-500 inline-block" />
                    ) : (
                      <XCircle size={16} className="text-slate-300 inline-block" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
