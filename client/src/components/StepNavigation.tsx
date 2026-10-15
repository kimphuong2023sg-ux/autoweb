import React from 'react';
import {
  Trash2,
  Palette,
  LayoutTemplate,
  Columns,
  FileText,
  Download,
  Layers,
  ChevronRight,
  Menu,
  BookOpen,
} from 'lucide-react';
import { WpInspectData } from '../types';

interface StepNavigationProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
  inspectData?: WpInspectData | null;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  onSelectStep,
  inspectData,
}) => {
  const steps = [
    {
      id: 1,
      title: 'Dọn Dẹp Website',
      subtitle: 'Quét & Xóa dữ liệu Demo rác',
      icon: Trash2,
    },
    {
      id: 2,
      title: 'Tạo Link SEO Hàng Loạt',
      subtitle: 'Tạo Trang, Bài & Chuyên mục',
      icon: FileText,
    },
    {
      id: 3,
      title: 'Cấu Hình Theme',
      subtitle: 'Màu sắc, Topbar & Header',
      icon: Palette,
    },
    {
      id: 4,
      title: 'Cài Đặt Nền Website',
      subtitle: 'Màu nền, Gradient & Ảnh nền',
      icon: Layers,
    },
    {
      id: 5,
      title: 'Cấu Hình Menu',
      subtitle: 'Menu Chính Header & Submenu',
      icon: Menu,
    },
    {
      id: 6,
      title: 'Dựng Trang Chủ',
      subtitle: 'Kéo thả Sections UX Builder',
      icon: LayoutTemplate,
    },
    {
      id: 7,
      title: 'Trang Con & Bài Viết',
      subtitle: 'Màu chữ & Khung làm nổi bật',
      icon: BookOpen,
    },
    {
      id: 8,
      title: 'Mẫu Footer',
      subtitle: 'Tạo Footer UX Block chuẩn',
      icon: Columns,
    },
  ];

  return (
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col justify-between h-[calc(100vh-4rem)] p-4 select-none">
      <div className="overflow-y-auto">
        <div className="px-2 pb-3 mb-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Các Bước Thiết Lập
            </span>
          </div>
          {inspectData && (
            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Live WordPress
            </span>
          )}
        </div>

        <nav className="space-y-2">
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = currentStep === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onSelectStep(s.id)}
                className={`w-full text-left p-3.5 rounded-xl transition-all relative flex items-center gap-3.5 group border cursor-pointer ${
                  isActive
                    ? 'bg-blue-50/80 border-blue-500 shadow-xs ring-1 ring-blue-500/20'
                    : 'bg-white border-slate-200/70 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {/* Active indicator bar on the left */}
                {isActive && (
                  <span className="absolute left-0 top-3 bottom-3 w-1.5 bg-blue-600 rounded-r-full" />
                )}

                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-400/20'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200/80 group-hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-sm truncate ${
                        isActive ? 'font-bold text-blue-900' : 'font-semibold text-slate-700 group-hover:text-slate-900'
                      }`}
                    >
                      {s.id}. {s.title}
                    </span>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-100/90 border border-blue-200 px-2 py-0.5 rounded-full shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                        Đang chọn
                      </span>
                    ) : s.id === 1 && inspectData ? (
                      inspectData.site?.is_flatsome ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full shrink-0">
                          Flatsome ✓
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full shrink-0">
                          Cần Flatsome ⚠️
                        </span>
                      )
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    )}
                  </div>
                  <p
                    className={`text-xs truncate mt-0.5 ${
                      isActive ? 'text-blue-700/80 font-medium' : 'text-slate-500'
                    }`}
                  >
                    {s.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Helper Box: Download Bridge Plugin & Theme */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mt-2 space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <Download className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-800">Tài Nguyên Sẵn Có</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Theme Flatsome v3.18.5 và Plugin Bridge đã sẵn sàng để cài đặt tự động hoặc tải về thủ công.
        </p>
        <div className="flex flex-col gap-1.5 pt-1">
          <a
            href="/wp-bridge-plugin/flatsome-seo-bridge.zip"
            download="flatsome-seo-bridge.zip"
            className="w-full inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold py-1.5 px-2.5 rounded-lg shadow-2xs transition"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" /> Tải Plugin Bridge (.zip)
          </a>
          <a
            href="/themes/flatsome-theme-gpl-v3-18-5.zip"
            download="flatsome-theme-gpl-v3-18-5.zip"
            className="w-full inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold py-1.5 px-2.5 rounded-lg shadow-2xs transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" /> Tải Flatsome v3.18.5 (.zip)
          </a>
        </div>
      </div>
    </div>
  );
};
