'use client';

import React, { useState } from 'react';
import { Edit3, Trash2, X, Save, AlertTriangle } from 'lucide-react';
import { useToast } from './ToastProvider';

interface EditFaqModalProps {
  faq: {
    question: string;
    answer: string;
  };
  index: number;
  onUpdate: (formData: FormData) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
}

export default function EditFaqModal({
  faq,
  index,
  onUpdate,
  onDelete,
}: EditFaqModalProps) {
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.append('index', index.toString());
      await onUpdate(formData);
      toast.success('FAQ Updated', 'Question & answer successfully modified.');
      setIsOpen(false);
    } catch (err: any) {
      toast.error('Update Failed', err?.message || 'Could not update FAQ.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.append('index', index.toString());
      await onDelete(formData);
      toast.success('FAQ Deleted', 'Question removed from FAQ list.');
      setIsDeleting(false);
      setIsOpen(false);
    } catch (err: any) {
      toast.error('Delete Failed', err?.message || 'Could not delete FAQ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1 shrink-0 ml-2">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          title="Edit FAQ"
          className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
        >
          <Edit3 size={13} />
        </button>
        <button
          type="button"
          onClick={() => {
            setIsDeleting(true);
            setIsOpen(true);
          }}
          title="Delete FAQ"
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDeleting ? 'bg-rose-50 text-rose-600' : 'bg-teal-50 text-teal-600'}`}>
                  {isDeleting ? <AlertTriangle size={18} /> : <Edit3 size={18} />}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">
                    {isDeleting ? 'Delete Question & Answer' : 'Edit FAQ Item'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isDeleting ? 'This item will be permanently removed from mobile & web.' : 'Update question and response for patients.'}
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
                  <p className="font-bold">Are you sure you want to delete this FAQ?</p>
                  <p className="text-slate-600 italic font-medium bg-white/70 p-2.5 rounded-xl border border-rose-200/50">
                    &quot;{faq.question}&quot;
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
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Question
                  </label>
                  <input
                    type="text"
                    name="question"
                    required
                    defaultValue={faq.question}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Answer Body
                  </label>
                  <textarea
                    name="answer"
                    required
                    rows={4}
                    defaultValue={faq.answer}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-500 resize-none"
                  />
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
                    {loading ? 'Saving...' : 'Save Changes'}
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

