import React from 'react';
import { AlertTriangle, LogIn } from 'lucide-react';

interface KickoutModalProps {
  message: string | null;
  onConfirm: () => void;
}

export const KickoutModal: React.FC<KickoutModalProps> = ({ message, onConfirm }) => {
  if (!message) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-100 text-center animate-in zoom-in-95 duration-200">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-200">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-bold text-slate-800 mb-2">Phiên Làm Việc Bị Gián Đoạn</h3>
        
        <p className="text-sm text-slate-600 mb-6 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-left">
          {message}
        </p>

        <button
          onClick={onConfirm}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>Đăng Nhập Lại</span>
        </button>
      </div>
    </div>
  );
};
