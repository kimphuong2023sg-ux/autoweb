import React, { useState } from 'react';
import { Trash2, AlertTriangle, CheckCircle2, Sparkles, RefreshCw, Layers, Rocket, Download, ShieldCheck, Check, Loader2 } from 'lucide-react';
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

  // Trạng thái cài đặt Theme Flatsome
  const [isInstallingTheme, setIsInstallingTheme] = useState(false);
  const [themeInstallSuccess, setThemeInstallSuccess] = useState<string | null>(null);
  const [themeInstallError, setThemeInstallError] = useState<string | null>(null);

  const handleInstallFlatsome = async () => {
    try {
      setIsInstallingTheme(true);
      setThemeInstallError(null);
      setThemeInstallSuccess(null);
      const res = await api.installFlatsomeTheme(currentSite);
      setThemeInstallSuccess(res.message || 'Đã cài đặt và kích hoạt hoàn thiện Theme Flatsome thành công!');
      await onRefreshInspect();
    } catch (err: any) {
      setThemeInstallError(err.message || 'Lỗi khi cài đặt theme Flatsome lên website');
    } finally {
      setIsInstallingTheme(false);
    }
  };

  const handleWipe = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn dọn dẹp các dữ liệu rác mặc định trên website này? Thao tác này sẽ tự động xóa sạch các UX Blocks demo dư thừa, bài viết, sản phẩm, menu rác và CHỈ GIỮ LẠI ĐÚNG 1 TRANG CHỦ.')) {
      return;
    }

    try {
      setIsWiping(true);
      setWipeSuccessMsg(null);


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

      {/* KHỐI TIỀN KIỂM TRA & CÀI ĐẶT THEME FLATSOME */}
      {inspectData && (
        <div className="space-y-2">
          {/* Thông báo kết quả cài đặt thành công nếu có */}
          {themeInstallSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{themeInstallSuccess}</span>
            </div>
          )}

          {/* Thông báo lỗi nếu có */}
          {themeInstallError && (
            <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl text-xs font-semibold text-rose-800 flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{themeInstallError}</span>
            </div>
          )}

          {/* 1. TRƯỜNG HỢP ĐÃ CÓ FLATSOME -> BÁO RÕ KHÔNG CẦN CÀI LẠI */}
          {inspectData.site?.is_flatsome ? (
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm text-emerald-950">
                      Kiểm Tra Theme: Đã Cài Đặt & Kích Hoạt Flatsome
                    </h3>
                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      ✓ Đạt Chuẩn
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                    Website đang chạy <strong>{inspectData.site.theme || 'Flatsome'}</strong> (Phiên bản: <strong>{inspectData.site.theme_version || 'v3.18.5'}</strong>). Hệ thống đã kiểm tra thấy theme Flatsome đang hoạt động hoàn hảo, <strong>không cần cài đặt lại!</strong>
                  </p>
                </div>
              </div>

              <div className="shrink-0 sm:self-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold whitespace-nowrap">
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                  Không Cần Cài Lại
                </span>
              </div>
            </div>
          ) : (
            /* 2. TRƯỜNG HỢP CHƯA CÓ FLATSOME -> BÁO CHƯA CÓ VÀ CHO CÀI HOÀN THIỆN */
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border-2 border-amber-300 text-amber-950 shadow-xs space-y-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/20">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm text-amber-950">
                        Chưa Kích Hoạt Theme Flatsome (Hiện tại: "{inspectData.site?.theme || 'Chưa xác định'}")
                      </h3>
                      <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        ⚠️ Cần Cài Hoàn Thiện
                      </span>
                    </div>
                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                      Theme Flatsome là nền tảng bắt buộc để công cụ nạp UX Builder, render shortcodes chuẩn SEO và khởi tạo giao diện. Gói cài đặt chuẩn <strong>Flatsome v3.18.5</strong> đã có sẵn trong thư mục hệ thống.
                    </p>
                  </div>
                </div>
              </div>

              {/* Nút hành động cài đặt */}
              <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-amber-200">
                <button
                  type="button"
                  onClick={handleInstallFlatsome}
                  disabled={isInstallingTheme}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-md shadow-blue-500/20 disabled:opacity-60 cursor-pointer"
                >
                  {isInstallingTheme ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang Tải Lên & Kích Hoạt Flatsome Lên Website...</span>
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4" />
                      <span>🚀 Tự Động Cài & Kích Hoạt Hoàn Thiện Theme Flatsome (1-Click)</span>
                    </>
                  )}
                </button>

                <a
                  href="/themes/flatsome-theme-gpl-v3-18-5.zip"
                  download="flatsome-theme-gpl-v3-18-5.zip"
                  className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-2xs"
                  title="Tải gói zip Flatsome v3.18.5 về máy nếu muốn cài thủ công trong WP Admin"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Tải Zip Thủ Công</span>
                </a>
              </div>
            </div>
          )}
        </div>
      )}

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
