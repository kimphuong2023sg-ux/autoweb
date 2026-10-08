import React, { useState } from 'react';
import { Trash2, AlertTriangle, CheckCircle2, Sparkles, RefreshCw, Layers } from 'lucide-react';
import { ConnectedSite, WpInspectData } from '../../types';
import { api } from '../../services/api';

interface Step1CleanSlateProps {
  currentSite: ConnectedSite;
  inspectData: WpInspectData | null;
  onRefreshInspect: () => Promise<void>;
  onNextStep: () => void;
}

export const Step1CleanSlate: React.FC<Step1CleanSlateProps> = ({
  currentSite,
  inspectData,
  onRefreshInspect,
  onNextStep,
}) => {
  const [cleanMode, setCleanMode] = useState<'full' | 'selective'>('full');
  const [options, setOptions] = useState({
    wipe_posts: true,
    wipe_pages: true,
    wipe_products: true,
    wipe_widgets: true,
    wipe_menus: true,
    wipe_blocks: true,
  });
  const [isWiping, setIsWiping] = useState(false);
  const [wipeSuccessMsg, setWipeSuccessMsg] = useState<string | null>(null);

  const handleWipe = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn dọn dẹp các dữ liệu rác mặc định trên website này? Thao tác này sẽ tự động xóa sạch các UX Blocks demo dư thừa, bài viết, sản phẩm, menu rác và CHỈ GIỮ LẠI ĐÚNG 1 TRANG CHỦ.')) {
      return;
    }

    try {
      setIsWiping(true);
      setWipeSuccessMsg(null);

      // Tự động đẩy code plugin mới nhất lên WordPress để đảm bảo chạy thuật toán dọn dẹp mới nhất
      try {
        await api.pushPluginCode(currentSite);
      } catch (pushErr: any) {
        console.warn('Auto push plugin code before wipe failed or skipped:', pushErr);
      }

      const res = await api.wipeDefaults(
        currentSite,
        cleanMode === 'full'
          ? { wipe_posts: true, wipe_pages: true, wipe_products: true, wipe_widgets: true, wipe_menus: true, wipe_blocks: true }
          : options
      );

      setWipeSuccessMsg(res.message || 'Đã dọn dẹp website thành công! Đã giữ lại duy nhất 1 Trang Chủ.');
      await onRefreshInspect();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi dọn dẹp dữ liệu');
    } finally {
      setIsWiping(false);
    }
  };

  const isDemo = inspectData?.stats?.is_demo_loaded;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Title & Introduction */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>1. Dọn Dẹp Dữ Liệu Rác Mặc Định</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Khởi tạo sạch
          </span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Dọn dẹp bài viết "Hello World", bài viết demo tiếng Anh, sản phẩm ảo và widget rác trước khi nạp giao diện mới.
        </p>
      </div>

      {/* Diagnosis Banner */}
      <div
        className={`p-4 rounded-xl border flex items-start gap-3.5 ${
          isDemo
            ? 'bg-amber-50/80 border-amber-200 text-amber-900'
            : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
        }`}
      >
        <div className="shrink-0 mt-0.5">
          {isDemo ? (
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          )}
        </div>
        <div className="flex-1">
          <div className="font-bold text-sm">
            {isDemo
              ? 'Phát hiện website có dữ liệu Demo Flatsome rác'
              : 'Website đang ở trạng thái sạch hoặc chưa nạp Demo'}
          </div>
          <p className="text-xs opacity-90 mt-0.5">
            {isDemo
              ? 'Hệ thống quét thấy nhiều bài viết, sản phẩm và widget demo. Khuyên bạn nên dọn sạch để tránh bị Google index nội dung rác.'
              : 'Các chỉ số bài viết và sản phẩm ở mức tối thiểu. Bạn có thể dọn dẹp thêm hoặc chuyển thẳng sang Bước 2.'}
          </p>

          {/* Stats Badges */}
          <div className="flex flex-wrap gap-2 mt-3 text-xs">
            <span className="bg-white/80 border border-slate-200/80 px-2.5 py-1 rounded-md font-medium text-slate-700">
              📝 Bài viết: <strong>{inspectData?.stats?.published_posts || 0}</strong>
            </span>
            <span className="bg-white/80 border border-slate-200/80 px-2.5 py-1 rounded-md font-medium text-slate-700">
              📄 Trang: <strong>{inspectData?.stats?.published_pages || 0}</strong>
            </span>
            <span className="bg-white/80 border border-slate-200/80 px-2.5 py-1 rounded-md font-medium text-slate-700">
              🛍️ Sản phẩm: <strong>{inspectData?.stats?.products || 0}</strong>
            </span>
            <span className="bg-white/80 border border-slate-200/80 px-2.5 py-1 rounded-md font-medium text-slate-700">
              🧩 Widgets hoạt động: <strong>{inspectData?.stats?.active_widgets || 0}</strong>
            </span>
          </div>
        </div>
      </div>

      {wipeSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-medium">{wipeSuccessMsg}</span>
          </div>
          <button
            onClick={onNextStep}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline"
          >
            Chuyển sang Bước 2 ➔
          </button>
        </div>
      )}

      {/* Choice of Wipe Mode */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div
          onClick={() => setCleanMode('full')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            cleanMode === 'full'
              ? 'bg-blue-50/60 border-blue-500 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" /> Quét Sạch 100% (Khuyên Dùng)
            </span>
            <span
              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                cleanMode === 'full' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
              }`}
            >
              {cleanMode === 'full' && '✓'}
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Xóa sạch toàn bộ bài viết demo, sản phẩm rác, menu rác, widgets, <strong>toàn bộ UX Blocks demo dư thừa</strong> và <strong>TẤT CẢ các trang khác (chỉ chừa lại đúng 1 Trang Chủ duy nhất)</strong>.
          </p>
        </div>

        <div
          onClick={() => setCleanMode('selective')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            cleanMode === 'selective'
              ? 'bg-blue-50/60 border-blue-500 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-slate-600" /> Dọn Dẹp Có Chọn Lọc
            </span>
            <span
              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                cleanMode === 'selective' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
              }`}
            >
              {cleanMode === 'selective' && '✓'}
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Tự chọn các mục cần dọn nếu bạn muốn giữ lại một số bài viết hoặc sản phẩm.
          </p>
        </div>
      </div>

      {/* Selective Checkboxes */}
      {cleanMode === 'selective' && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
          <div className="text-xs font-bold text-slate-700 mb-2">Chọn các mục cần dọn dẹp:</div>
          <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={options.wipe_blocks}
              onChange={(e) => setOptions({ ...options, wipe_blocks: e.target.checked })}
              className="rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="font-semibold text-amber-700">Xóa sạch toàn bộ UX Blocks demo dư thừa (Blog Header, Demos, Features Overview, Footer - About us...)</span>
          </label>
          <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={options.wipe_pages}
              onChange={(e) => setOptions({ ...options, wipe_pages: e.target.checked })}
              className="rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="font-semibold text-red-600">Xóa tất cả các Trang khác (chỉ chừa lại đúng 1 Trang Chủ)</span>
          </label>
          <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={options.wipe_posts}
              onChange={(e) => setOptions({ ...options, wipe_posts: e.target.checked })}
              className="rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Xóa tất cả Bài viết (Posts) demo & "Hello World"</span>
          </label>
          <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={options.wipe_products}
              onChange={(e) => setOptions({ ...options, wipe_products: e.target.checked })}
              className="rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Xóa tất cả Sản phẩm (WooCommerce Products) demo</span>
          </label>
          <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={options.wipe_widgets}
              onChange={(e) => setOptions({ ...options, wipe_widgets: e.target.checked })}
              className="rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Reset sạch Widgets mặc định ở Footer & Sidebar</span>
          </label>
          <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={options.wipe_menus}
              onChange={(e) => setOptions({ ...options, wipe_menus: e.target.checked })}
              className="rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Xóa các Menu điều hướng rác của bản demo</span>
          </label>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
        <button
          onClick={handleWipe}
          disabled={isWiping}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm flex items-center gap-2 transition disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          <span>{isWiping ? 'Đang dọn dẹp...' : 'Thực Hiện Dọn Dẹp Ngay'}</span>
        </button>

        <button
          onClick={onNextStep}
          className="px-5 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition"
        >
          Bỏ qua & Sang Bước 2 (Tạo Link SEO) ➔
        </button>
      </div>
    </div>
  );
};
