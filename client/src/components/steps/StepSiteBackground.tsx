import React, { useState, useRef } from 'react';
import {
  Palette,
  Wand2,
  Image as ImageIcon,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Loader2,
  Rocket,
  Sparkles,
  Check,
  Eye,
  Layers,
} from 'lucide-react';
import { ConnectedSite, ThemeConfig } from '../../types';
import { api } from '../../services/api';

interface StepSiteBackgroundProps {
  currentSite: ConnectedSite | null;
  themeConfig: ThemeConfig;
  onChangeThemeConfig: (config: ThemeConfig) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
}

export const StepSiteBackground: React.FC<StepSiteBackgroundProps> = ({
  currentSite,
  themeConfig,
  onChangeThemeConfig,
  onNextStep,
  onPrevStep,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingBg, setIsUploadingBg] = useState(false);
  const [bgUploadError, setBgUploadError] = useState<string | null>(null);
  const [bgUploadSuccess, setBgUploadSuccess] = useState(false);

  // Curated Gradient Presets for Site Background
  const siteBgGradients = [
    {
      id: 'dark-luxury',
      name: 'Dark Luxury (Xám Đen Sang Trọng)',
      badge: 'Khuyên Dùng Toàn Diện',
      c1: '#0f172a',
      c2: '#1e293b',
      angle: 135,
    },
    {
      id: 'casino-gold',
      name: 'Casino Dark Gold (Chuẩn Juega365)',
      badge: 'Casino & Thể Thao VIP',
      c1: '#0b0f19',
      c2: '#1f1604',
      angle: 135,
    },
    {
      id: 'deep-ocean',
      name: 'Deep Ocean (Xanh Đêm Biển Sâu)',
      badge: 'Công Nghệ & Tài Chính',
      c1: '#0a192f',
      c2: '#0f3a61',
      angle: 135,
    },
    {
      id: 'cyberpunk',
      name: 'Cyberpunk (Tím Huyền Bí Neon)',
      badge: 'Gaming & Crypto',
      c1: '#0d0221',
      c2: '#240046',
      angle: 135,
    },
    {
      id: 'emerald-luxury',
      name: 'Emerald (Xanh Ngọc Lục Bảo)',
      badge: 'Spa & Bất Động Sản',
      c1: '#062419',
      c2: '#0c3b28',
      angle: 135,
    },
    {
      id: 'carbon-noir',
      name: 'Carbon Noir (Đen Nhám Đẳng Cấp)',
      badge: 'Tối Giản Siêu Sang',
      c1: '#000000',
      c2: '#18181b',
      angle: 135,
    },
    {
      id: 'sunset-crimson',
      name: 'Crimson Sunset (Đỏ Đậm Hoàng Hôn)',
      badge: 'Giải Trí & Sự Kiện',
      c1: '#1a0505',
      c2: '#3d0c0c',
      angle: 135,
    },
    {
      id: 'clean-light',
      name: 'Clean Tech Light (Trắng Bạc Tối Giản)',
      badge: 'Giao Diện Sáng Sạch',
      c1: '#f8fafc',
      c2: '#e2e8f0',
      angle: 135,
    },
  ];

  // Curated Solid Color Swatches for Site Background
  const siteBgSolidPresets = [
    { name: 'Dark Slate (Chuẩn Tối)', color: '#0f172a' },
    { name: 'Deep Midnight (Đêm Sâu)', color: '#0a0f1d' },
    { name: 'Casino Carbon (Đen Casino)', color: '#111827' },
    { name: 'Obsidian Noir (Đen Tuyệt Đối)', color: '#05070a' },
    { name: 'Trắng Sáng (Pure White)', color: '#ffffff' },
    { name: 'Xám Nhạt (Slate Light)', color: '#f8fafc' },
    { name: 'Navy Royal (Xanh Hoàng Gia)', color: '#0a192f' },
    { name: 'Mocha Dark (Nâu Trầm Ấm)', color: '#1a1614' },
  ];

  const handleBgFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('Kích thước ảnh vượt quá 15MB. Vui lòng chọn ảnh nhỏ hơn.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      if (!currentSite) {
        onChangeThemeConfig({
          ...themeConfig,
          siteBgType: 'image',
          siteBgImage: base64,
        });
        return;
      }

      try {
        setIsUploadingBg(true);
        setBgUploadError(null);
        setBgUploadSuccess(false);

        const res = await api.uploadMedia(currentSite, {
          filename: file.name,
          fileData: base64,
          title: `Site Background - ${file.name}`,
          altText: 'Site Background',
        });

        if (res && res.media) {
          onChangeThemeConfig({
            ...themeConfig,
            siteBgType: 'image',
            siteBgImage: res.media.url,
            siteBgImageId: res.media.id,
          });
          setBgUploadSuccess(true);
          setTimeout(() => setBgUploadSuccess(false), 4000);
        }
      } catch (err: any) {
        setBgUploadError(err.message || 'Lỗi khi tải ảnh nền lên WordPress');
      } finally {
        setIsUploadingBg(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const getPreviewBgStyle = (): React.CSSProperties => {
    const type = themeConfig.siteBgType || 'color';
    if (type === 'color') {
      return { backgroundColor: themeConfig.siteBgColor || '#ffffff' };
    }
    if (type === 'gradient') {
      const c1 = themeConfig.siteBgGradientColor1 || '#0f172a';
      const c2 = themeConfig.siteBgGradientColor2 || '#1e293b';
      const angle = themeConfig.siteBgGradientAngle ?? 135;
      const gtype = themeConfig.siteBgGradientType || 'linear';
      return {
        background:
          gtype === 'radial'
            ? `radial-gradient(circle at center, ${c1} 0%, ${c2} 100%)`
            : `linear-gradient(${angle}deg, ${c1} 0%, ${c2} 100%)`,
      };
    }
    if (type === 'image') {
      const url = themeConfig.siteBgImage || '';
      const overlay = themeConfig.siteBgOverlayEnable
        ? `linear-gradient(${themeConfig.siteBgOverlayColor || 'rgba(0,0,0,0.5)'}, ${themeConfig.siteBgOverlayColor || 'rgba(0,0,0,0.5)'}), `
        : '';
      return {
        backgroundImage: url ? `${overlay}url(${url})` : undefined,
        backgroundColor: '#0f172a',
        backgroundRepeat: themeConfig.siteBgImageRepeat || 'no-repeat',
        backgroundSize: themeConfig.siteBgImageSize || 'cover',
        backgroundPosition: themeConfig.siteBgImagePosition || 'center center',
      };
    }
    return { backgroundColor: '#ffffff' };
  };

  const [isApplyingBgOnly, setIsApplyingBgOnly] = useState(false);
  const [bgApplySuccess, setBgApplySuccess] = useState(false);
  const [bgApplyError, setBgApplyError] = useState<string | null>(null);

  const handleApplySiteBgOnly = async () => {
    if (!currentSite) {
      alert('Vui lòng kết nối với website WordPress ở bước trên trước khi áp dụng nền!');
      return;
    }
    try {
      setIsApplyingBgOnly(true);
      setBgApplyError(null);
      setBgApplySuccess(false);

      await api.applySiteBackground(currentSite, themeConfig);
      setBgApplySuccess(true);
      setTimeout(() => setBgApplySuccess(false), 6000);
    } catch (err: any) {
      setBgApplyError(err.message || 'Lỗi khi cập nhật nền website');
    } finally {
      setIsApplyingBgOnly(false);
    }
  };

  const [isRestoringHome, setIsRestoringHome] = useState(false);
  const [restoreSuccess, setRestoreSuccess] = useState(false);

  const handleRestoreHomePage = async () => {
    if (!currentSite) return;
    try {
      setIsRestoringHome(true);
      setRestoreSuccess(false);
      await api.restoreFrontPageBlank(currentSite);
      setRestoreSuccess(true);
      setTimeout(() => setRestoreSuccess(false), 6000);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi khôi phục trang chủ');
    } finally {
      setIsRestoringHome(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title & Actions */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>4. Cài Đặt Nền Toàn Website (Site Background)</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Độc Lập 100%
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Thiết lập màu sắc, dải màu gradient cao cấp hoặc hình ảnh nền cho toàn bộ các trang trên website mà <strong>hoàn toàn không ảnh hưởng</strong> đến Header, Menu hay nội dung khác.
          </p>
        </div>

        {currentSite && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRestoreHomePage}
              disabled={isRestoringHome}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-bold rounded-xl shadow-2xs transition cursor-pointer disabled:opacity-50"
              title="Khôi phục Trang Chủ về giao diện Tràn Viền Full-Width (page-blank.php) nếu bị hiện tiêu đề h1 hoặc bị viền trắng"
            >
              {isRestoringHome ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>Khôi Phục Trang Chủ Blank</span>
            </button>

            <button
              type="button"
              onClick={handleApplySiteBgOnly}
              disabled={isApplyingBgOnly}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer disabled:opacity-50"
              title="Chỉ cập nhật màu nền / gradient / ảnh nền cho toàn site, không làm thay đổi các thiết lập header khác"
            >
              {isApplyingBgOnly ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Rocket className="w-3.5 h-3.5" />}
              <span>Áp Dụng Nền Lên Web</span>
            </button>
          </div>
        )}
      </div>

      {/* Status Alerts for Site Background */}
      {bgApplySuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center justify-between gap-3 shadow-2xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Đã cập nhật nền toàn site ({themeConfig.siteBgType === 'image' ? 'Ảnh Nền Full Màn Hình' : themeConfig.siteBgType === 'gradient' ? 'Nền Gradient' : 'Màu Đơn Sắc'}) thành công! Không ảnh hưởng Header.
            </span>
          </div>
          {currentSite?.siteUrl && (
            <a
              href={currentSite.siteUrl}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-700 hover:text-emerald-900 underline font-semibold flex items-center gap-1 shrink-0"
            >
              <span>Xem Web</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {restoreSuccess && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Đã khôi phục Trang Chủ về mẫu Tràn Viền Full-Width (page-blank.php)! Các tiêu đề h1 thừa và khung hộp đã được dọn sạch.</span>
        </div>
      )}

      {bgApplyError && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs flex items-center gap-2 shadow-2xs">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{bgApplyError}</span>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight">Tùy Chọn Kiểu Nền Toàn Trang</span>
                <span className="text-[10px] uppercase font-extrabold bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-400/30">
                  Toàn Site • Body &amp; Wrapper
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Áp dụng cho mọi trang của website. Tự động xử lý trong suốt cho `#main, #content, .page-wrapper`.
              </p>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-6">
          {/* Mode Selector Tabs (Color, Gradient, Image) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Mode 1: Color */}
            <div
              onClick={() => onChangeThemeConfig({ ...themeConfig, siteBgType: 'color' })}
              className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-center gap-3 ${
                (themeConfig.siteBgType || 'color') === 'color'
                  ? 'bg-blue-50/80 border-blue-600 shadow-xs ring-2 ring-blue-500/20'
                  : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  (themeConfig.siteBgType || 'color') === 'color'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                <Palette className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Màu Đơn Sắc</span>
                  {(themeConfig.siteBgType || 'color') === 'color' && (
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  )}
                </div>
                <div className="text-[11px] text-slate-500 truncate">1 màu thuần khiết, tối giản</div>
              </div>
            </div>

            {/* Mode 2: Gradient */}
            <div
              onClick={() => onChangeThemeConfig({ ...themeConfig, siteBgType: 'gradient' })}
              className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-center gap-3 ${
                themeConfig.siteBgType === 'gradient'
                  ? 'bg-blue-50/80 border-blue-600 shadow-xs ring-2 ring-blue-500/20'
                  : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  themeConfig.siteBgType === 'gradient'
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-2xs'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                <Wand2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Màu Đổ Gradient</span>
                  {themeConfig.siteBgType === 'gradient' && (
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  )}
                </div>
                <div className="text-[11px] text-slate-500 truncate">Dải màu chuyển sắc cực sang</div>
              </div>
            </div>

            {/* Mode 3: Image */}
            <div
              onClick={() => onChangeThemeConfig({ ...themeConfig, siteBgType: 'image' })}
              className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-center gap-3 ${
                themeConfig.siteBgType === 'image'
                  ? 'bg-blue-50/80 border-blue-600 shadow-xs ring-2 ring-blue-500/20'
                  : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  themeConfig.siteBgType === 'image'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Ảnh Nền Toàn Trang</span>
                  {themeConfig.siteBgType === 'image' && (
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  )}
                </div>
                <div className="text-[11px] text-slate-500 truncate">Texture, hoa văn hoặc ảnh chụp</div>
              </div>
            </div>
          </div>

          {/* TAB 1 CONTENT: SOLID COLOR */}
          {(themeConfig.siteBgType || 'color') === 'color' && (
            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Bộ Màu Mẫu Được Tuyển Chọn (Click Để Chọn Nhanh)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {siteBgSolidPresets.map((sp) => {
                    const isSelected = (themeConfig.siteBgColor || '#ffffff').toLowerCase() === sp.color.toLowerCase();
                    return (
                      <button
                        key={sp.color}
                        type="button"
                        onClick={() =>
                          onChangeThemeConfig({
                            ...themeConfig,
                            siteBgType: 'color',
                            siteBgColor: sp.color,
                          })
                        }
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80 hover:border-slate-300'
                        }`}
                      >
                        <span
                          style={{ backgroundColor: sp.color }}
                          className="w-6 h-6 rounded-lg border border-black/10 shrink-0 shadow-2xs"
                        ></span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-bold text-slate-800 truncate">{sp.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">{sp.color}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Hex Color Picker */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
                <label className="text-xs font-semibold text-slate-700">Màu Tùy Chỉnh (Hex):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={themeConfig.siteBgColor || '#ffffff'}
                    onChange={(e) =>
                      onChangeThemeConfig({
                        ...themeConfig,
                        siteBgType: 'color',
                        siteBgColor: e.target.value,
                      })
                    }
                    className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={themeConfig.siteBgColor || '#ffffff'}
                    onChange={(e) =>
                      onChangeThemeConfig({
                        ...themeConfig,
                        siteBgType: 'color',
                        siteBgColor: e.target.value,
                      })
                    }
                    className="w-28 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-800 uppercase"
                    placeholder="#0f172a"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2 CONTENT: GRADIENT */}
          {themeConfig.siteBgType === 'gradient' && (
            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center justify-between">
                  <span>Mẫu Dải Màu Gradient Sang Trọng (1-Click Chọn Nhanh)</span>
                  <span className="text-[11px] text-blue-600 font-medium">Phong cách Casino, Tech &amp; Luxury</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {siteBgGradients.map((g) => {
                    const isSelected =
                      themeConfig.siteBgGradientColor1 === g.c1 &&
                      themeConfig.siteBgGradientColor2 === g.c2;
                    return (
                      <div
                        key={g.id}
                        onClick={() =>
                          onChangeThemeConfig({
                            ...themeConfig,
                            siteBgType: 'gradient',
                            siteBgGradientColor1: g.c1,
                            siteBgGradientColor2: g.c2,
                            siteBgGradientAngle: g.angle,
                            siteBgGradientType: 'linear',
                          })
                        }
                        className={`p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between space-y-2 ${
                          isSelected
                            ? 'bg-blue-50/80 border-blue-600 shadow-xs ring-2 ring-blue-500/20'
                            : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
                        }`}
                      >
                        <div
                          style={{
                            background: `linear-gradient(${g.angle}deg, ${g.c1} 0%, ${g.c2} 100%)`,
                          }}
                          className="h-12 rounded-lg border border-black/10 shadow-2xs flex items-end p-1.5 justify-between"
                        >
                          <span className="text-[9px] font-mono text-white/90 bg-black/40 px-1 py-0.5 rounded-xs">
                            {g.angle}°
                          </span>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="text-[11px] font-bold text-slate-900 leading-tight">{g.name}</div>
                          <div className="text-[10px] text-blue-700 font-medium mt-0.5">{g.badge}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Gradient Controls */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Tùy Chỉnh Màu Đầu &amp; Màu Cuối:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Màu 1 (Bắt đầu):</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={themeConfig.siteBgGradientColor1 || '#0f172a'}
                        onChange={(e) =>
                          onChangeThemeConfig({
                            ...themeConfig,
                            siteBgType: 'gradient',
                            siteBgGradientColor1: e.target.value,
                          })
                        }
                        className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0 bg-white"
                      />
                      <input
                        type="text"
                        value={themeConfig.siteBgGradientColor1 || '#0f172a'}
                        onChange={(e) =>
                          onChangeThemeConfig({
                            ...themeConfig,
                            siteBgType: 'gradient',
                            siteBgGradientColor1: e.target.value,
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Màu 2 (Kết thúc):</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={themeConfig.siteBgGradientColor2 || '#1e293b'}
                        onChange={(e) =>
                          onChangeThemeConfig({
                            ...themeConfig,
                            siteBgType: 'gradient',
                            siteBgGradientColor2: e.target.value,
                          })
                        }
                        className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0 bg-white"
                      />
                      <input
                        type="text"
                        value={themeConfig.siteBgGradientColor2 || '#1e293b'}
                        onChange={(e) =>
                          onChangeThemeConfig({
                            ...themeConfig,
                            siteBgType: 'gradient',
                            siteBgGradientColor2: e.target.value,
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1 flex items-center justify-between">
                      <span>Góc đổ ({themeConfig.siteBgGradientAngle ?? 135}°):</span>
                      <button
                        type="button"
                        onClick={() =>
                          onChangeThemeConfig({
                            ...themeConfig,
                            siteBgType: 'gradient',
                            siteBgGradientType:
                              themeConfig.siteBgGradientType === 'radial' ? 'linear' : 'radial',
                          })
                        }
                        className="text-[10px] text-blue-600 hover:underline font-semibold"
                      >
                        {themeConfig.siteBgGradientType === 'radial' ? 'Đổi sang Linear' : 'Đổi sang Radial'}
                      </button>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="5"
                      value={themeConfig.siteBgGradientAngle ?? 135}
                      onChange={(e) =>
                        onChangeThemeConfig({
                          ...themeConfig,
                          siteBgType: 'gradient',
                          siteBgGradientAngle: parseInt(e.target.value, 10),
                          siteBgGradientType: 'linear',
                        })
                      }
                      className="w-full accent-blue-600 mt-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3 CONTENT: IMAGE */}
          {themeConfig.siteBgType === 'image' && (
            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Hình Ảnh Nền (Background Image URL / Tải từ máy)</span>
                  <span className="text-[10px] text-emerald-600 font-semibold uppercase bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    WordPress Media Sync
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="url"
                      value={themeConfig.siteBgImage || ''}
                      onChange={(e) =>
                        onChangeThemeConfig({
                          ...themeConfig,
                          siteBgType: 'image',
                          siteBgImage: e.target.value,
                        })
                      }
                      placeholder="https://juegalotto365.com/wp-content/uploads/2026/10/background.webp"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-hidden"
                    />
                    {themeConfig.siteBgImage && (
                      <button
                        type="button"
                        onClick={() =>
                          onChangeThemeConfig({
                            ...themeConfig,
                            siteBgImage: '',
                            siteBgImageId: 0,
                          })
                        }
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 text-xs font-bold"
                        title="Xóa URL ảnh"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBgFileUpload}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingBg}
                    className="shrink-0 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-2xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isUploadingBg ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang Tải...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Tải Ảnh Từ Máy Tính</span>
                      </>
                    )}
                  </button>
                </div>

                {bgUploadSuccess && (
                  <div className="mt-2 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Đã tải ảnh lên WordPress Media thành công!</span>
                  </div>
                )}
                {bgUploadError && (
                  <div className="mt-2 text-[11px] text-red-600 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{bgUploadError}</span>
                  </div>
                )}
              </div>

              {/* Image Properties */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800">Thuộc Tính Hiển Thị Ảnh Nền:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Kích Thước (Size):</label>
                    <select
                      value={themeConfig.siteBgImageSize || 'cover'}
                      onChange={(e) =>
                        onChangeThemeConfig({
                          ...themeConfig,
                          siteBgType: 'image',
                          siteBgImageSize: e.target.value as any,
                        })
                      }
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800"
                    >
                      <option value="cover">Cover (Phủ kín toàn màn - Khuyên dùng)</option>
                      <option value="contain">Contain (Vừa vặn trong khung)</option>
                      <option value="auto">Auto (Kích thước gốc)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Lặp Lại (Repeat):</label>
                    <select
                      value={themeConfig.siteBgImageRepeat || 'no-repeat'}
                      onChange={(e) =>
                        onChangeThemeConfig({
                          ...themeConfig,
                          siteBgType: 'image',
                          siteBgImageRepeat: e.target.value as any,
                        })
                      }
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800"
                    >
                      <option value="no-repeat">No Repeat (Không lặp - Chuẩn ảnh to)</option>
                      <option value="repeat">Repeat (Lặp toàn màn - Chuẩn Texture)</option>
                      <option value="repeat-x">Repeat-X (Chỉ lặp ngang)</option>
                      <option value="repeat-y">Repeat-Y (Chỉ lặp dọc)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Vị Trí (Position):</label>
                    <select
                      value={themeConfig.siteBgImagePosition || 'center center'}
                      onChange={(e) =>
                        onChangeThemeConfig({
                          ...themeConfig,
                          siteBgType: 'image',
                          siteBgImagePosition: e.target.value as any,
                        })
                      }
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800"
                    >
                      <option value="center center">Căn Giữa (Center Center)</option>
                      <option value="top center">Căn Trên (Top Center)</option>
                      <option value="bottom center">Căn Dưới (Bottom Center)</option>
                      <option value="center top">Đỉnh Giữa (Center Top)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Cố Định Nền (Attachment):</label>
                    <select
                      value={themeConfig.siteBgImageAttachment || 'fixed'}
                      onChange={(e) =>
                        onChangeThemeConfig({
                          ...themeConfig,
                          siteBgType: 'image',
                          siteBgImageAttachment: e.target.value as any,
                        })
                      }
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 font-semibold"
                    >
                      <option value="fixed">Fixed (Cố định Parallax - Sang Trọng)</option>
                      <option value="scroll">Scroll (Cuộn theo trang)</option>
                    </select>
                  </div>
                </div>

                {/* Overlay Tint for Readability */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={themeConfig.siteBgOverlayEnable || false}
                      onChange={(e) =>
                        onChangeThemeConfig({
                          ...themeConfig,
                          siteBgType: 'image',
                          siteBgOverlayEnable: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-blue-600 accent-blue-600"
                    />
                    <span>Bật Lớp Phủ Mờ (Overlay Tint)</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      Phủ một lớp màu làm dịu ảnh nền giúp chữ trên trang đọc rõ nét 100%
                    </span>
                  </label>

                  {themeConfig.siteBgOverlayEnable && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500 font-medium">Màu phủ:</span>
                      <input
                        type="text"
                        value={themeConfig.siteBgOverlayColor || 'rgba(0, 0, 0, 0.45)'}
                        onChange={(e) =>
                          onChangeThemeConfig({
                            ...themeConfig,
                            siteBgType: 'image',
                            siteBgOverlayColor: e.target.value,
                          })
                        }
                        className="w-40 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono text-slate-800"
                        placeholder="rgba(0, 0, 0, 0.45)"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Interactive Live Preview Mockup Box */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-blue-600" />
                <span>Xem Trước Nền Thực Tế Toàn Website (Live Preview Mockup)</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {(themeConfig.siteBgType || 'color') === 'color' && `Màu: ${themeConfig.siteBgColor || '#ffffff'}`}
                {themeConfig.siteBgType === 'gradient' &&
                  `Gradient: ${themeConfig.siteBgGradientColor1} ➔ ${themeConfig.siteBgGradientColor2}`}
                {themeConfig.siteBgType === 'image' && `Ảnh Nền: ${themeConfig.siteBgImageAttachment || 'fixed'}`}
              </span>
            </div>

            {/* Mini Browser Frame */}
            <div className="rounded-xl border border-slate-300 overflow-hidden shadow-sm bg-slate-900">
              {/* Browser Window Bar */}
              <div className="bg-slate-800 px-3 py-2 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                  <span className="ml-2 text-[10px] font-mono text-slate-400">
                    {currentSite?.siteUrl || 'https://domain-cua-ban.com'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium">Toàn Bộ Website</div>
              </div>

              {/* Website Canvas with Dynamic Background */}
              <div
                style={getPreviewBgStyle()}
                className="p-5 min-h-[190px] flex flex-col justify-between transition-all duration-300 relative"
              >
                {/* Mini Header Mockup */}
                <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-lg p-2 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-16 h-3 bg-amber-400 rounded-xs"></span>
                    <span className="w-10 h-2 bg-white/40 rounded-xs hidden sm:inline-block"></span>
                    <span className="w-10 h-2 bg-white/40 rounded-xs hidden sm:inline-block"></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-red-600 text-[9px] font-bold text-white">
                      {themeConfig.headerButton1Text || 'REGÍSTRATE'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-red-600 text-[9px] font-bold text-white">
                      {themeConfig.headerButton2Text || 'ENTRAR'}
                    </span>
                  </div>
                </div>

                {/* Mini Content / Card */}
                <div className="my-4 max-w-md mx-auto text-center space-y-2 bg-black/30 backdrop-blur-sm p-4 rounded-xl border border-white/10 shadow-lg">
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold tracking-wider uppercase">
                    {(themeConfig.siteBgType || 'color') === 'color' && 'Nền Đơn Sắc'}
                    {themeConfig.siteBgType === 'gradient' && 'Nền Gradient Đẳng Cấp'}
                    {themeConfig.siteBgType === 'image' && 'Nền Ảnh Full Màn Hình'}
                  </div>
                  <h4 className="text-sm font-extrabold text-white tracking-tight drop-shadow-sm">
                    Giao Diện Chuẩn SEO &amp; Trải Nghiệm Khách Hàng
                  </h4>
                  <p className="text-[11px] text-white/80 max-w-sm mx-auto leading-relaxed drop-shadow-xs">
                    Kiểm tra độ tương phản giữa chữ và nền. Chữ hiển thị rõ nét, không bị chói mắt.
                  </p>
                </div>

                {/* Mini Footer Strip */}
                <div className="text-center text-[10px] text-white/50 pt-2 border-t border-white/10">
                  {themeConfig.copyrightText || '© 2026 Bản quyền thuộc về Doanh Nghiệp. Thiết kế chuẩn SEO.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
        <button
          onClick={onPrevStep}
          className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition cursor-pointer"
        >
          ❮ Quay lại Bước 3 (Cấu Hình Theme)
        </button>

        <div className="flex items-center gap-3">
          {currentSite && (
            <button
              type="button"
              onClick={handleApplySiteBgOnly}
              disabled={isApplyingBgOnly}
              className="px-4 py-2.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isApplyingBgOnly ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Rocket className="w-3.5 h-3.5" />}
              <span>Áp Dụng Nền Lên Web</span>
            </button>
          )}

          <button
            onClick={onNextStep}
            className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition cursor-pointer"
          >
            Tiếp tục sang Cấu Hình Menu (Bước 5) ➔
          </button>
        </div>
      </div>
    </div>
  );
};
