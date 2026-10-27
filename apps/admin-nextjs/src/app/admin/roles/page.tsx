import React from 'react';
import { connectDB, User } from 'database';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { 
  ShieldCheck, 
  UserPlus, 
  Users, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  KeyRound,
  ShieldAlert,
  SlidersHorizontal,
  Mail,
  Phone
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
    // If user already exists (e.g. registered as patient or tester), upgrade/update their credentials to the requested staff role
    existing.role = role;
    existing.email = email;
    existing.mobile = mobile;
    existing.passwordHash = passwordHash;
    existing.isActive = true;
    await existing.save();

    revalidatePath('/admin/roles');
    redirect('/admin/roles?success=' + encodeURIComponent(`Account (${email}) already existed and has been successfully upgraded to ${role.toUpperCase()} with the new credentials.`));
  } else {
    // Create brand new staff user
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
  }).sort({ createdAt: -1 });

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
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="text-teal-600" size={28} />
            Role & Staff Permission Management (RBAC)
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Manage staff credentials, define access tiers, and configure role-based permissions.
          </p>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Create Staff Member Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2 mb-4">
            <UserPlus size={18} className="text-teal-600" />
            Provision New Staff User
          </h2>

          <form action={createStaffAction} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Staff Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="reception@quickphysio24.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Mobile Number
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="tel"
                  name="mobile"
                  required
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Temporary Password
              </label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Assigned Role
              </label>
              <select
                name="role"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500 bg-white"
              >
                <option value="receptionist">Receptionist (Bookings & Patients)</option>
                <option value="admin">Clinic Administrator</option>
                <option value="therapist">Physiotherapist Staff</option>
                <option value="superadmin">Super Administrator</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs tracking-wide shadow-md shadow-teal-600/20 transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus size={15} />
              <span>Provision Staff Account</span>
            </button>
          </form>
        </div>

        {/* Center / Right Column: Active Staff Directory */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <Users size={18} className="text-teal-600" />
              Active Staff Directory ({staffUsers.length})
            </h2>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full">
              Live Accounts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                  <th className="pb-3 pl-2">Staff Member</th>
                  <th className="pb-3">Mobile</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffUsers.map((u) => (
                  <tr key={u._id.toString()} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 pl-2 font-semibold text-slate-800">
                      <div>{u.email || 'No email specified'}</div>
                      <div className="text-[10px] text-slate-400 font-normal">ID: {u._id.toString().slice(-6)}</div>
                    </td>
                    <td className="py-3 font-medium text-slate-600">{u.mobile}</td>
                    <td className="py-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        u.role === 'superadmin' 
                          ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                          : u.role === 'admin'
                          ? 'bg-teal-50 text-teal-700 border border-teal-200/60'
                          : u.role === 'receptionist'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <CheckCircle2 size={13} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500">
                          <XCircle size={13} /> Disabled
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-2 text-right">
                      <form action={updateStaffAction} className="inline-block">
                        <input type="hidden" name="userId" value={u._id.toString()} />
                        <input type="hidden" name="actionType" value="toggle_status" />
                        <button
                          type="submit"
                          className="text-[11px] font-bold text-slate-500 hover:text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-white transition-colors"
                        >
                          {u.isActive ? 'Disable' : 'Enable'}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Permission Matrix Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2 mb-2">
          <SlidersHorizontal size={18} className="text-teal-600" />
          Role Permission Matrix (Access Control Hierarchy)
        </h2>
        <p className="text-xs text-slate-400 font-semibold mb-6">
          Defines granular read/write privileges for staff tiers across clinic modules.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                <th className="pb-3 pl-3">Clinic Module</th>
                <th className="pb-3 text-center">Super Admin</th>
                <th className="pb-3 text-center">Admin</th>
                <th className="pb-3 text-center">Receptionist</th>
                <th className="pb-3 text-center pr-3">Therapist</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PERMISSION_MATRIX.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3 pl-3 font-semibold text-slate-700">{row.module}</td>
                  <td className="py-3 text-center">
                    {row.superadmin ? (
                      <CheckCircle2 size={16} className="inline text-emerald-500" />
                    ) : (
                      <XCircle size={16} className="inline text-slate-300" />
                    )}
                  </td>
                  <td className="py-3 text-center">
                    {row.admin ? (
                      <CheckCircle2 size={16} className="inline text-emerald-500" />
                    ) : (
                      <XCircle size={16} className="inline text-slate-300" />
                    )}
                  </td>
                  <td className="py-3 text-center">
                    {row.receptionist ? (
                      <CheckCircle2 size={16} className="inline text-emerald-500" />
                    ) : (
                      <XCircle size={16} className="inline text-slate-300" />
                    )}
                  </td>
                  <td className="py-3 text-center pr-3">
                    {row.therapist ? (
                      <CheckCircle2 size={16} className="inline text-emerald-500" />
                    ) : (
                      <XCircle size={16} className="inline text-slate-300" />
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
