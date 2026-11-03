'use client';

import React, { useState } from 'react';
import { Edit3, Trash2, X, Save, AlertTriangle, Tag, Percent, IndianRupee } from 'lucide-react';
import { useToast } from './ToastProvider';

export interface OfferItem {
  id: string;
  code: string;
  title: string;
  discount: string;
  desc: string;
  validTill: string;
  tag: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minAmount?: number;
  isActive?: boolean;
}

interface EditOfferModalProps {
  offer: OfferItem;
  onUpdate: (formData: FormData) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
}

export default function EditOfferModal({
  offer,
  onUpdate,
  onDelete,
}: EditOfferModalProps) {
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>(offer.discountType || 'percentage');

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.append('offerId', offer.id);
      await onUpdate(formData);
      toast.success('Offer Updated', `Promo code ${offer.code} modified.`);
      setIsOpen(false);
    } catch (err: any) {
      toast.error('Update Failed', err?.message || 'Could not update offer.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.append('offerId', offer.id);
      await onDelete(formData);
      toast.success('Offer Removed', `Promo code ${offer.code} has been deleted.`);
      setIsDeleting(false);
      setIsOpen(false);
    } catch (err: any) {
      toast.error('Delete Failed', err?.message || 'Could not delete offer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          title="Edit Promo Offer"
          className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
        >
          <Edit3 size={14} />
        </button>
        <button
          type="button"
          onClick={() => {
            setIsDeleting(true);
            setIsOpen(true);
          }}
          title="Delete Promo Offer"
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDeleting ? 'bg-rose-50 text-rose-600' : 'bg-teal-50 text-teal-600'}`}>
                  {isDeleting ? <AlertTriangle size={18} /> : <Tag size={18} />}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">
                    {isDeleting ? 'Delete Promo Code' : 'Edit Promo Offer & Coupon'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isDeleting ? 'This coupon code will be permanently revoked.' : 'Modify discount percentage, booking conditions, and validity.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsDeleting(false);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            {isDeleting ? (
              <form onSubmit={handleDelete} className="p-6 space-y-4">
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-xs text-rose-800 space-y-2">
                  <p className="font-bold">Are you sure you want to delete this offer code?</p>
                  <p className="text-slate-600 font-medium bg-white/70 p-2.5 rounded-xl border border-rose-200/50">
                    <span className="font-mono font-bold text-rose-700">{offer.code}</span> ({offer.discount}) - {offer.title}
                  </p>
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDeleting(false);
                      setIsOpen(false);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Trash2 size={14} />
                    {loading ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Coupon Code
                    </label>
                    <input
                      type="text"
                      name="code"
                      required
                      defaultValue={offer.code}
                      placeholder="e.g. PHYSIO25"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-teal-800 uppercase focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Discount Display Label
                    </label>
                    <input
                      type="text"
                      name="discount"
                      required
                      defaultValue={offer.discount}
                      placeholder="e.g. 25% OFF or ₹150 OFF"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Discount Type
                    </label>
                    <select
                      name="discountType"
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                    >
                      <option value="percentage">Percentage (%) Discount</option>
                      <option value="flat">Flat Rupee (₹) Discount</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      {discountType === 'percentage' ? 'Percentage Value (%)' : 'Flat Discount Amount (₹)'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="discountValue"
                        required
                        min="1"
                        max={discountType === 'percentage' ? 100 : 5000}
                        defaultValue={offer.discountValue || 25}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                      />
                      <div className="absolute left-2.5 top-2.5 text-slate-400">
                        {discountType === 'percentage' ? <Percent size={14} /> : <IndianRupee size={14} />}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Offer Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    defaultValue={offer.title}
                    placeholder="e.g. Rehabilitation Package Special"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Offer Description
                  </label>
                  <textarea
                    name="desc"
                    required
                    rows={2}
                    defaultValue={offer.desc}
                    placeholder="Details about booking eligibility..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Validity String
                    </label>
                    <input
                      type="text"
                      name="validTill"
                      required
                      defaultValue={offer.validTill}
                      placeholder="e.g. Valid till 31 Dec 2026"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Category Tag
                    </label>
                    <input
                      type="text"
                      name="tag"
                      defaultValue={offer.tag || 'POPULAR'}
                      placeholder="POPULAR / LIMITED / EXCLUSIVE"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 uppercase focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Min Booking (₹)
                    </label>
                    <input
                      type="number"
                      name="minAmount"
                      min="0"
                      defaultValue={offer.minAmount || 500}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Save size={14} />
                    {loading ? 'Saving...' : 'Save Offer'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

