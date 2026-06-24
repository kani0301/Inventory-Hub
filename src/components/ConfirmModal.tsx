import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  description,
  confirmText = "Proceed",
  cancelText = "Cancel",
  isDanger = false,
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div 
        id="confirm-modal-box"
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden transform transition-all scale-100 p-6 space-y-4"
      >
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl shrink-0 ${isDanger ? "bg-red-50 text-red-600" : "bg-indigo-50 text-indigo-600"}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-extrabold text-slate-800 text-base leading-tight">
              {title}
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed font-sans mt-1">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl text-xs transition-all cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
            }}
            className={`px-4.5 py-2.5 font-bold rounded-xl text-xs transition-all cursor-pointer text-white shadow-xs ${
              isDanger 
                ? "bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-100" 
                : "bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-150"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
