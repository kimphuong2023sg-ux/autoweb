import React, { useState } from 'react';
import {
  Palette,
  Check,
  Sparkles,
  Layout,
  Maximize2,
  Rocket,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Sliders,
  Menu,
  Pin,
  Compass,
  Search,
  ShoppingBag,
  User,
  SlidersHorizontal,
  ChevronRight,
  MousePointerClick,
} from 'lucide-react';
import { ConnectedSite, ThemeConfig } from '../../types';
import { api } from '../../services/api';

interface Step2ThemeCustomizerProps {
  currentSite?: ConnectedSite | null;
  themeConfig: ThemeConfig;
  onChangeThemeConfig: (newConfig: ThemeConfig) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
}

export const Step2ThemeCustomizer: React.FC<Step2ThemeCustomizerProps> = ({
  currentSite,
  themeConfig,
  onChangeThemeConfig,
  onNextStep,
  onPrevStep,
}) => {
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  // Active Sub-tab for Header Customization
  const [activeHeaderTab, setActiveHeaderTab] = useState<
    'presets' | 'main' | 'bottom' | 'buttons' | 'sticky' | 'elements'
  >('presets');

  const niches = [
    {
      id: 'real-estate',
      name: 'Bất Động Sản & Dự Án',
      primary: '#0f3a61',
      secondary: '#d4af37',
      topbar: 'Hotline Dự Án: 0988.xxx.xxx - Nhận Bảng Giá Độc Quyền 2026',
    },
    {
      id: 'clinic-spa',
      name: 'Y Tế, Nha Khoa & Spa',
      primary: '#007791',
      secondary: '#20b2aa',
      topbar: 'Khám & Tư Vấn Miễn Phí 24/7 - Đặt Lịch: 0988.xxx.xxx',
    },
    {
      id: 'b2b-service',
      name: 'Dịch Vụ & Doanh Nghiệp',
      primary: '#1e293b',
      secondary: '#ea580c',
      topbar: 'Hỗ Trợ Kỹ Thuật Toàn Quốc: 0988.xxx.xxx | Email: contact@domain.com',
    },
    {
      id: 'finance-law',
      name: 'Tài Chính & Luật Pháp',
      primary: '#0f172a',
      secondary: '#2563eb',
      topbar: 'Tư Vấn Pháp Lý & Doanh Nghiệp Trọn Gói: 0988.xxx.xxx',
    },
    {
      id: 'news-affiliate',
      name: 'Blog Tin Tức & Review',
      primary: '#2563eb',
      secondary: '#10b981',
      topbar: 'Cập Nhật Kiến Thức Chuyên Sâu & Đánh Giá Sản Phẩm 2026',
    },
  ];

  const headerPresets = [
    {
      id: 'header-wide-nav-dark',
      name: 'Wide Nav Dark (Menu To Dưới)',
      badge: 'Khuyên Dùng (Chuẩn Juega365, Casino, Thể Thao)',
      desc: 'Logo & 2 Nút CTA đỏ trên thanh chính, Toàn bộ Menu dàn ngang trên thanh dưới tối màu sắc nét.',
      preview: (
        <div className="w-full bg-slate-900 border border-slate-700 rounded-md p-1.5 space-y-1">
          <div className="flex items-center justify-between px-1">
            <span className="w-12 h-2.5 bg-amber-400 rounded-xs"></span>
            <div className="flex items-center gap-1">
              <span className="w-8 h-2 bg-red-600 rounded-full"></span>
              <span className="w-7 h-2 bg-red-600 rounded-full"></span>
            </div>
          </div>
          <div className="bg-blue-900/80 rounded-xs py-1 px-2 flex items-center justify-center gap-1.5">
            <span className="w-6 h-1 bg-blue-300 rounded-xs"></span>
            <span className="w-8 h-1 bg-blue-200 rounded-xs"></span>
            <span className="w-7 h-1 bg-blue-200 rounded-xs"></span>
            <span className="w-6 h-1 bg-blue-200 rounded-xs"></span>
          </div>
        </div>
      ),
    },
    {
      id: 'header-wide-nav',
      name: 'Wide Nav Light',
      badge: 'Doanh Nghiệp & Dịch Vụ',
      desc: 'Thanh chính màu sáng với Logo & Nút CTA, Thanh menu dưới màu sẫm nổi bật.',
      preview: (
        <div className="w-full bg-slate-100 border border-slate-300 rounded-md p-1.5 space-y-1">
          <div className="flex items-center justify-between px-1">
            <span className="w-12 h-2.5 bg-blue-600 rounded-xs"></span>
            <div className="flex items-center gap-1">
              <span className="w-10 h-2 bg-slate-300 rounded-xs"></span>
              <span className="w-6 h-2 bg-blue-600 rounded-xs"></span>
            </div>
          </div>
          <div className="bg-slate-700 rounded-xs py-1 px-2 flex items-center justify-center gap-1.5">
            <span className="w-7 h-1 bg-white rounded-xs"></span>
            <span className="w-6 h-1 bg-slate-300 rounded-xs"></span>
            <span className="w-8 h-1 bg-slate-300 rounded-xs"></span>
            <span className="w-6 h-1 bg-slate-300 rounded-xs"></span>
          </div>
        </div>
      ),
    },
    {
      id: 'header-simple-signup',
      name: 'Simple Signup (CTA)',
      badge: 'App, Landing Page & B2B',
      desc: 'Logo trái, Menu nằm giữa thanh chính, 2 Nút Đăng ký / Đăng nhập bên phải.',
      preview: (
        <div className="w-full bg-white border border-slate-300 rounded-md p-2 flex items-center justify-between">
          <span className="w-12 h-2.5 bg-blue-600 rounded-xs"></span>
          <div className="flex items-center gap-1">
            <span className="w-5 h-1.5 bg-slate-400 rounded-xs"></span>
            <span className="w-5 h-1.5 bg-slate-400 rounded-xs"></span>
            <span className="w-5 h-1.5 bg-slate-400 rounded-xs"></span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-6 h-2 bg-slate-200 border border-slate-300 rounded-xs"></span>
            <span className="w-7 h-2 bg-blue-600 rounded-xs"></span>
          </div>
        </div>
      ),
    },
    {
      id: 'header-simple-right-buttons',
      name: 'Simple Right Buttons',
      badge: 'Tập Trung Nút CTA Mua Ngay',
      desc: 'Logo trái, toàn bộ Menu, Tìm kiếm và Nút CTA dồn sang góc phải.',
      preview: (
        <div className="w-full bg-white border border-slate-300 rounded-md p-2 flex items-center justify-between">
          <span className="w-14 h-2.5 bg-blue-600 rounded-xs"></span>
          <div className="flex items-center gap-1">
            <span className="w-5 h-1.5 bg-slate-400 rounded-xs"></span>
            <span className="w-5 h-1.5 bg-slate-400 rounded-xs"></span>
            <span className="w-4 h-1.5 bg-slate-300 rounded-xs"></span>
            <span className="w-7 h-2 bg-emerald-600 rounded-xs"></span>
          </div>
        </div>
      ),
    },
    {
      id: 'header-default',
      name: 'Header Default E-Commerce',
      badge: 'Bán Hàng / Shop Online',
      desc: 'Bố cục Flatsome gốc: Logo trái, Tìm kiếm & Menu ở giữa, Giỏ hàng & Tài khoản góc phải.',
      preview: (
        <div className="w-full bg-white border border-slate-300 rounded-md p-2 flex items-center justify-between">
          <span className="w-12 h-2.5 bg-blue-600 rounded-xs"></span>
          <div className="flex items-center gap-1">
            <span className="w-4 h-2 bg-slate-200 rounded-xs"></span>
            <span className="w-6 h-1.5 bg-slate-500 rounded-xs"></span>
            <span className="w-6 h-1.5 bg-slate-500 rounded-xs"></span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-2 bg-slate-200 rounded-xs"></span>
            <span className="w-3.5 h-3 bg-amber-500 rounded-xs"></span>
          </div>
        </div>
      ),
    },
    {
      id: 'header-default-center',
      name: 'Header Center Logo',
      badge: 'Thời Trang & Mỹ Phẩm',
      desc: 'Logo đặt ngay chính giữa, Menu bên trái và Giỏ hàng / Tìm kiếm bên phải.',
      preview: (
        <div className="w-full bg-white border border-slate-300 rounded-md p-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="w-5 h-1.5 bg-slate-400 rounded-xs"></span>
            <span className="w-5 h-1.5 bg-slate-400 rounded-xs"></span>
          </div>
          <span className="w-12 h-3 bg-slate-900 rounded-xs"></span>
          <div className="flex items-center gap-1">
            <span className="w-4 h-2 bg-slate-200 rounded-xs"></span>
            <span className="w-3.5 h-3 bg-blue-600 rounded-xs"></span>
          </div>
        </div>
      ),
    },
    {
      id: 'header-default-dark',
      name: 'Header Default Dark',
      badge: 'Giao Diện Tối / Công Nghệ',
      desc: 'Toàn bộ Header mang phong cách nền tối hiện đại, tương phản cao.',
      preview: (
        <div className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 flex items-center justify-between">
          <span className="w-12 h-2.5 bg-cyan-400 rounded-xs"></span>
          <div className="flex items-center gap-1">
            <span className="w-6 h-1.5 bg-slate-400 rounded-xs"></span>
            <span className="w-6 h-1.5 bg-slate-400 rounded-xs"></span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-2 bg-slate-700 rounded-xs"></span>
            <span className="w-3.5 h-3 bg-cyan-500 rounded-xs"></span>
          </div>
        </div>
      ),
    },
    {
      id: 'header-simple',
      name: 'Header Minimalist (Hamburger)',
      badge: 'Tối Giản & Sạch Sẽ',
      desc: 'Chỉ hiển thị Logo, ô Tìm kiếm và Nút menu 3 gạch Hamburger.',
      preview: (
        <div className="w-full bg-white border border-slate-300 rounded-md p-2 flex items-center justify-between">
          <span className="w-14 h-2.5 bg-blue-600 rounded-xs"></span>
          <div className="flex items-center gap-2">
            <span className="w-4 h-2 bg-slate-200 rounded-xs"></span>
            <span className="w-4 h-3 bg-slate-800 rounded-xs flex flex-col justify-around p-0.5">
              <span className="w-full h-[1px] bg-white"></span>
              <span className="w-full h-[1px] bg-white"></span>
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'header-cart-top',
      name: 'Header Cart Top',
      badge: 'Thương Mại Điện Tử Nâng Cao',
      desc: 'Giỏ hàng và Tài khoản nằm trên thanh Topbar, nhường toàn bộ Header chính cho Menu.',
      preview: (
        <div className="w-full bg-white border border-slate-300 rounded-md p-1.5 space-y-1">
          <div className="bg-slate-800 rounded-xs py-0.5 px-1.5 flex items-center justify-end gap-1.5">
            <span className="w-5 h-1 bg-slate-300 rounded-xs"></span>
            <span className="w-3.5 h-1.5 bg-amber-400 rounded-xs"></span>
          </div>
          <div className="flex items-center justify-between px-1">
            <span className="w-12 h-2.5 bg-blue-600 rounded-xs"></span>
            <div className="flex items-center gap-1">
              <span className="w-5 h-1.5 bg-slate-500 rounded-xs"></span>
              <span className="w-5 h-1.5 bg-slate-500 rounded-xs"></span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const handleSelectNiche = (niche: (typeof niches)[0]) => {
    onChangeThemeConfig({
      ...themeConfig,
      nicheId: niche.id,
      colorPrimary: niche.primary,
      colorSecondary: niche.secondary,
      topbarText: niche.topbar,
    });
  };

  const handleSelectHeaderPreset = (presetId: string) => {
    if (presetId === 'header-wide-nav-dark') {
      onChangeThemeConfig({
        ...themeConfig,
        headerPreset: presetId,
        headerLayout: 'wide-nav',
        headerHeight: 90,
        headerColor: 'dark',
        headerBg: '#161616',
        headerBottomShow: true,
        headerBottomHeight: 45,
        headerBottomBg: themeConfig.colorPrimary || '#0f3a61',
        headerBottomColor: 'dark',
        headerButton1Show: true,
        headerButton1Text: themeConfig.headerButton1Text || 'REGÍSTRATE',
        headerButton1Color: 'alert',
        headerButton1Radius: '99px',
        headerButton1Style: 'is-flat',
        headerButton2Show: true,
        headerButton2Text: themeConfig.headerButton2Text || 'ENTRAR',
        headerButton2Color: 'alert',
        headerButton2Radius: '99px',
        headerButton2Style: 'is-flat',
      });
    } else if (presetId === 'header-wide-nav') {
      onChangeThemeConfig({
        ...themeConfig,
        headerPreset: presetId,
        headerLayout: 'wide-nav',
        headerHeight: 90,
        headerColor: 'light',
        headerBg: '#ffffff',
        headerBottomShow: true,
        headerBottomHeight: 45,
        headerBottomBg: '#334155',
        headerBottomColor: 'dark',
        headerButton1Show: true,
        headerButton2Show: true,
      });
    } else if (presetId === 'header-simple-signup') {
      onChangeThemeConfig({
        ...themeConfig,
        headerPreset: presetId,
        headerLayout: 'logo-left-menu-center',
        headerHeight: 84,
        headerColor: 'light',
        headerBg: '#ffffff',
        headerBottomShow: false,
        headerButton1Show: true,
        headerButton1Text: 'Đăng Ký',
        headerButton1Color: 'primary',
        headerButton2Show: true,
        headerButton2Text: 'Đăng Nhập',
        headerButton2Color: 'plain',
      });
    } else if (presetId === 'header-simple-right-buttons') {
      onChangeThemeConfig({
        ...themeConfig,
        headerPreset: presetId,
        headerLayout: 'logo-left-menu-right',
        headerHeight: 84,
        headerColor: 'light',
        headerBg: '#ffffff',
        headerBottomShow: false,
        headerButton1Show: true,
        headerButton1Text: 'Mua Ngay',
        headerButton1Color: 'success',
        headerButton2Show: false,
      });
    } else if (presetId === 'header-default-dark') {
      onChangeThemeConfig({
        ...themeConfig,
        headerPreset: presetId,
        headerLayout: 'logo-left-menu-right',
        headerHeight: 90,
        headerColor: 'dark',
        headerBg: '#0f172a',
        headerBottomShow: false,
        headerShowSearch: 'icon',
        headerShowCart: true,
        headerShowAccount: true,
      });
    } else if (presetId === 'header-default-center') {
      onChangeThemeConfig({
        ...themeConfig,
        headerPreset: presetId,
        headerLayout: 'logo-center',
        headerHeight: 90,
        headerColor: 'light',
        headerBg: '#ffffff',
        headerBottomShow: false,
        headerShowSearch: 'icon',
        headerShowCart: true,
        headerShowAccount: true,
      });
    } else if (presetId === 'header-simple') {
      onChangeThemeConfig({
        ...themeConfig,
        headerPreset: presetId,
        headerLayout: 'logo-left-menu-right',
        headerHeight: 75,
        headerColor: 'light',
        headerBg: '#ffffff',
        headerBottomShow: false,
        headerShowSearch: 'icon',
        headerButton1Show: false,
        headerButton2Show: false,
      });
    } else if (presetId === 'header-cart-top') {
      onChangeThemeConfig({
        ...themeConfig,
        headerPreset: presetId,
        headerLayout: 'logo-left-menu-center',
        headerHeight: 84,
        headerColor: 'light',
        headerBg: '#ffffff',
        headerBottomShow: false,
        headerShowSearch: 'form',
        headerShowCart: true,
        headerShowAccount: true,
      });
    } else {
      // header-default
      onChangeThemeConfig({
        ...themeConfig,
        headerPreset: 'header-default',
        headerLayout: 'logo-left-menu-right',
        headerHeight: 90,
        headerColor: 'light',
        headerBg: '#ffffff',
        headerBottomShow: false,
        headerShowSearch: 'icon',
        headerShowCart: true,
        headerShowAccount: true,
      });
    }
  };

  const handleQuickApplyTheme = async () => {
    if (!currentSite) return;
    try {
      setIsApplying(true);
      setApplyError(null);
      setApplySuccess(false);
      await api.applyThemeMods(currentSite, themeConfig);
      setApplySuccess(true);
      setTimeout(() => setApplySuccess(false), 6000);
    } catch (err: any) {
      setApplyError(err.message || 'Lỗi khi cập nhật cấu hình Theme lên WordPress');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title & Quick Deploy */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>2. Cấu Hình Theme Flatsome &amp; Header</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Personalizar
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Thiết lập Bố cục Header Builder, Presets (như Juega365.com), Nút CTA, Màu sắc, Bố cục &amp; Topbar chỉ với 1 click.
          </p>
        </div>

        {currentSite && (
          <button
            type="button"
            onClick={handleQuickApplyTheme}
            disabled={isApplying}
            className="shrink-0 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Áp dụng ngay các tùy chọn màu sắc, Header, Container, Topbar lên WordPress"
          >
            {isApplying ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang Áp Dụng...</span>
              </>
            ) : (
              <>
                <Rocket className="w-3.5 h-3.5" />
                <span>Áp Dụng Lên Web Ngay</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Success Notification Banner */}
      {applySuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200 shadow-2xs">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Đã cập nhật thành công Bố cục Header ({themeConfig.headerPreset || 'Custom'}), Màu sắc &amp; Cài đặt Theme lên WordPress!
            </span>
          </div>
          {currentSite?.siteUrl && (
            <a
              href={currentSite.siteUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-900 underline shrink-0"
            >
              <span>Xem Web</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {/* Error Notification Banner */}
      {applyError && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-200 shadow-2xs">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{applyError}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION: TÙY BIẾN HEADER FLATSOME (HEADER BUILDER & PRESETS)   */}
      {/* ============================================================== */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Header Section Header */}
        <div className="p-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/20 border border-blue-400/30 rounded-xl">
              <Layout className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight">Tùy Biến Header Flatsome (Header Builder)</span>
                <span className="text-[10px] uppercase font-extrabold bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full border border-blue-400/30">
                  Flatsome Native
                </span>
              </div>
              <p className="text-[11px] text-blue-200/80 mt-0.5">
                Cung cấp đầy đủ các tùy chọn như trong WordPress Customizer &gt; Header (Presets, Thanh Chính, Thanh Dưới, Nút CTA &amp; Sticky).
              </p>
            </div>
          </div>
          <span className="text-xs bg-white/10 px-2.5 py-1 rounded-lg font-mono text-blue-200 border border-white/10">
            {themeConfig.headerPreset || 'header-wide-nav-dark'}
          </span>
        </div>

        {/* Sub-tabs Navigation */}
        <div className="flex items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveHeaderTab('presets')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeHeaderTab === 'presets'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1. Header Presets ({headerPresets.length} Mẫu)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveHeaderTab('main')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeHeaderTab === 'main'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>2. Header Main (Thanh Chính)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveHeaderTab('bottom')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeHeaderTab === 'bottom'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>3. Header Bottom (Thanh Menu Dưới)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveHeaderTab('buttons')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeHeaderTab === 'buttons'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <MousePointerClick className="w-3.5 h-3.5" />
            <span>4. Nút CTA (Button 1 &amp; 2)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveHeaderTab('sticky')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeHeaderTab === 'sticky'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Pin className="w-3.5 h-3.5" />
            <span>5. Sticky Header (Cố Định Cuộn)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveHeaderTab('elements')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeHeaderTab === 'elements'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>6. Thành Phần Khác</span>
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="p-5">
          {/* TAB 1: PRESETS */}
          {activeHeaderTab === 'presets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Chọn Mẫu Bố Cục Header (Header Presets)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Click vào mẫu bên dưới để áp dụng ngay layout tương ứng của Flatsome.
                  </p>
                </div>
                <span className="text-[11px] text-slate-500 italic">
                  Đang chọn: <strong className="text-blue-600">{themeConfig.headerPreset || 'header-wide-nav-dark'}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {headerPresets.map((preset) => {
                  const isSelected = themeConfig.headerPreset === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectHeaderPreset(preset.id)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between space-y-2.5 ${
                        isSelected
                          ? 'bg-blue-50/60 border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                          : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-slate-900 leading-tight">{preset.name}</span>
                          {isSelected ? (
                            <span className="p-1 bg-blue-600 text-white rounded-full">
                              <Check className="w-3 h-3" />
                            </span>
                          ) : (
                            <span className="w-4 h-4 rounded-full border border-slate-300"></span>
                          )}
                        </div>

                        {/* Preset Miniature Mockup */}
                        {preset.preview}

                        <span className="inline-block text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/80">
                          {preset.badge}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-snug">{preset.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: HEADER MAIN */}
          {activeHeaderTab === 'main' && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <span>Cài Đặt Thanh Header Chính (Header Main)</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Thanh chứa Logo, ô tìm kiếm hoặc các nút CTA bên phải.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Header Height */}
                <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Chiều Cao Header Main (Height)</label>
                    <span className="text-xs font-mono font-bold text-blue-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {themeConfig.headerHeight || 90}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="160"
                    step="2"
                    value={themeConfig.headerHeight || 90}
                    onChange={(e) =>
                      onChangeThemeConfig({ ...themeConfig, headerHeight: parseInt(e.target.value, 10) })
                    }
                    className="w-full cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>50px (Nhỏ gọn)</span>
                    <span>90px (Chuẩn)</span>
                    <span>160px (To rộng)</span>
                  </div>
                </div>

                {/* Header Width */}
                <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Độ Rộng Khung Header Chính (Header Width)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div
                      onClick={() => onChangeThemeConfig({ ...themeConfig, headerWidth: 'container' })}
                      className={`p-2.5 rounded-lg border cursor-pointer text-center transition ${
                        (themeConfig.headerWidth || 'container') === 'container'
                          ? 'bg-blue-50 border-blue-500 font-bold text-blue-700 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs flex items-center justify-center gap-1.5">
                        <span>Có Lề Container</span>
                        {(themeConfig.headerWidth || 'container') === 'container' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Giới hạn {themeConfig.siteWidth || '1200px'}</div>
                    </div>
                    <div
                      onClick={() => onChangeThemeConfig({ ...themeConfig, headerWidth: 'full-width' })}
                      className={`p-2.5 rounded-lg border cursor-pointer text-center transition ${
                        themeConfig.headerWidth === 'full-width'
                          ? 'bg-blue-50 border-blue-500 font-bold text-blue-700 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs flex items-center justify-center gap-1.5">
                        <span>Full Container (Tràn 100%)</span>
                        {themeConfig.headerWidth === 'full-width' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Tràn toàn màn hình</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Header Background */}
                <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Màu Nền Header (Background Color)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={themeConfig.headerBg?.startsWith('#') ? themeConfig.headerBg : '#ffffff'}
                      onChange={(e) => onChangeThemeConfig({ ...themeConfig, headerBg: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-slate-300 p-0.5 cursor-pointer bg-white"
                    />
                    <input
                      type="text"
                      value={themeConfig.headerBg || '#ffffff'}
                      onChange={(e) => onChangeThemeConfig({ ...themeConfig, headerBg: e.target.value })}
                      className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-medium text-slate-800 focus:outline-hidden"
                      placeholder="rgba(255,255,255,0.9) hoặc #ffffff"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onChangeThemeConfig({ ...themeConfig, headerBg: '#ffffff', headerColor: 'light' })}
                      className="text-[10px] px-2 py-1 rounded bg-white border border-slate-300 hover:bg-slate-100 font-medium cursor-pointer"
                    >
                      Trắng Sáng (#fff)
                    </button>
                    <button
                      type="button"
                      onClick={() => onChangeThemeConfig({ ...themeConfig, headerBg: '#161616', headerColor: 'dark' })}
                      className="text-[10px] px-2 py-1 rounded bg-slate-900 text-white hover:bg-black font-medium cursor-pointer"
                    >
                      Đen Tối (#161616)
                    </button>
                    <button
                      type="button"
                      onClick={() => onChangeThemeConfig({ ...themeConfig, headerBg: 'transparent' })}
                      className="text-[10px] px-2 py-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 font-medium cursor-pointer"
                    >
                      Trong Suốt
                    </button>
                  </div>
                </div>

                {/* Header Text Color (Dark/Light) */}
                <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Tông Màu Chữ Header (Text Color Scheme)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div
                      onClick={() => onChangeThemeConfig({ ...themeConfig, headerColor: 'light' })}
                      className={`p-2.5 rounded-lg border cursor-pointer text-center transition ${
                        themeConfig.headerColor !== 'dark'
                          ? 'bg-blue-50 border-blue-500 font-bold text-blue-700'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs">Chữ Tối (Light Mode)</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Dành cho nền trắng / sáng</div>
                    </div>
                    <div
                      onClick={() => onChangeThemeConfig({ ...themeConfig, headerColor: 'dark' })}
                      className={`p-2.5 rounded-lg border cursor-pointer text-center transition ${
                        themeConfig.headerColor === 'dark'
                          ? 'bg-slate-900 border-slate-900 font-bold text-white'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs">Chữ Sáng (Dark Mode)</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Dành cho nền tối / đen</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HEADER BOTTOM (WIDE NAV BAR) */}
          {activeHeaderTab === 'bottom' && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Compass className="w-4 h-4 text-blue-600" />
                    <span>Thanh Menu Bên Dưới (Header Bottom - Wide Nav)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Thanh menu ngang riêng biệt nằm bên dưới Logo (chuẩn phong cách các trang như Juega365.com, thể thao, nhà cái, tin tức).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700">Trạng Thái:</span>
                  <button
                    type="button"
                    onClick={() =>
                      onChangeThemeConfig({ ...themeConfig, headerBottomShow: !themeConfig.headerBottomShow })
                    }
                    className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                      themeConfig.headerBottomShow
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {themeConfig.headerBottomShow ? '✓ Đang Bật Thanh Dưới' : '✕ Đã Tắt Thanh Dưới'}
                  </button>
                </div>
              </div>

              {themeConfig.headerBottomShow ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Bottom Bar Height */}
                  <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">Chiều Cao Thanh Dưới (Height)</label>
                      <span className="text-xs font-mono font-bold text-blue-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {themeConfig.headerBottomHeight || 45}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="25"
                      max="75"
                      step="1"
                      value={themeConfig.headerBottomHeight || 45}
                      onChange={(e) =>
                        onChangeThemeConfig({
                          ...themeConfig,
                          headerBottomHeight: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>25px (Nhỏ)</span>
                      <span>45px (Chuẩn)</span>
                      <span>75px (Lớn)</span>
                    </div>
                  </div>

                  {/* Bottom Bar Color */}
                  <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">
                      Màu Nền Thanh Menu Dưới (Bottom Background)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={themeConfig.headerBottomBg || '#0f3a61'}
                        onChange={(e) =>
                          onChangeThemeConfig({ ...themeConfig, headerBottomBg: e.target.value })
                        }
                        className="w-10 h-10 rounded-lg border border-slate-300 p-0.5 cursor-pointer bg-white"
                      />
                      <input
                        type="text"
                        value={themeConfig.headerBottomBg || '#0f3a61'}
                        onChange={(e) =>
                          onChangeThemeConfig({ ...themeConfig, headerBottomBg: e.target.value })
                        }
                        className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-medium text-slate-800 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          onChangeThemeConfig({
                            ...themeConfig,
                            headerBottomBg: themeConfig.colorPrimary || '#0f3a61',
                          })
                        }
                        className="text-[10px] px-2.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-200 font-semibold cursor-pointer shrink-0"
                        title="Dùng màu chủ đạo của website"
                      >
                        Lấy Màu Chính
                      </button>
                    </div>
                  </div>

                  {/* Bottom Bar Text Color */}
                  <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block">
                      Màu Chữ Thanh Menu Dưới (Bottom Nav Color)
                    </label>
                    <div className="grid grid-cols-2 gap-3 max-w-md">
                      <div
                        onClick={() => onChangeThemeConfig({ ...themeConfig, headerBottomColor: 'dark' })}
                        className={`p-2.5 rounded-lg border cursor-pointer text-center transition ${
                          themeConfig.headerBottomColor !== 'light'
                            ? 'bg-slate-900 border-slate-900 font-bold text-white'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xs">Chữ Trắng Sáng (Dark Scheme)</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Dành cho thanh nền tối/màu đậm</div>
                      </div>
                      <div
                        onClick={() => onChangeThemeConfig({ ...themeConfig, headerBottomColor: 'light' })}
                        className={`p-2.5 rounded-lg border cursor-pointer text-center transition ${
                          themeConfig.headerBottomColor === 'light'
                            ? 'bg-blue-50 border-blue-500 font-bold text-blue-700'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xs">Chữ Tối Màu (Light Scheme)</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Dành cho thanh nền xám/trắng</div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Bar Width (Full Container vs Container) */}
                  <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block">
                      Độ Rộng Khung Menu Dưới (Bottom Container Width)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div
                        onClick={() => onChangeThemeConfig({ ...themeConfig, headerBottomWidth: 'full-width' })}
                        className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-2.5 ${
                          (themeConfig.headerBottomWidth || 'full-width') === 'full-width'
                            ? 'bg-blue-50/80 border-blue-500 shadow-2xs ring-1 ring-blue-500/20'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full mt-0.5 flex items-center justify-center shrink-0 ${
                          (themeConfig.headerBottomWidth || 'full-width') === 'full-width' ? 'bg-blue-600 text-white' : 'border border-slate-300'
                        }`}>
                          {(themeConfig.headerBottomWidth || 'full-width') === 'full-width' && <Check className="w-2.5 h-2.5" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">Full Container (Tràn 100% Toàn Màn Hình)</div>
                          <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            Khuyên dùng! Mở rộng không gian menu 100% từ mép trái sang mép phải, giúp tất cả các mục menu nằm gọn trên 1 hàng, không bị ép rớt thành 2 dòng như trong ảnh của bạn.
                          </div>
                        </div>
                      </div>

                      <div
                        onClick={() => onChangeThemeConfig({ ...themeConfig, headerBottomWidth: 'container' })}
                        className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-2.5 ${
                          themeConfig.headerBottomWidth === 'container'
                            ? 'bg-blue-50/80 border-blue-500 shadow-2xs ring-1 ring-blue-500/20'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full mt-0.5 flex items-center justify-center shrink-0 ${
                          themeConfig.headerBottomWidth === 'container' ? 'bg-blue-600 text-white' : 'border border-slate-300'
                        }`}>
                          {themeConfig.headerBottomWidth === 'container' && <Check className="w-2.5 h-2.5" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">Có Lề Container (Giới hạn {themeConfig.siteWidth || '1200px'})</div>
                          <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            Giới hạn chiều rộng menu theo lề khung trang web. Thích hợp khi menu có ít mục (dưới 5 - 6 mục).
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Anti-wrap Menu Items Toggle */}
                  <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-800">Cố Định 1 Hàng Ngang (Chống Rớt Thành 2 Dòng)</div>
                        <div className="text-[11px] text-slate-500">
                          Bảo đảm toàn bộ danh sách menu luôn trải đều trên 1 hàng ngang duy nhất
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={themeConfig.headerNavNoWrap ?? true}
                        onChange={(e) =>
                          onChangeThemeConfig({ ...themeConfig, headerNavNoWrap: e.target.checked })
                        }
                        className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Khi bật: Áp dụng quy tắc <code>white-space: nowrap</code> giúp tiêu đề các mục (Trang Chủ, Apuestas, Casino, v.v.) không bao giờ bị bẻ rớt xuống hàng thứ 2.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center space-y-2">
                  <p className="text-xs text-slate-500">
                    Thanh Menu Dưới (Header Bottom) hiện đang tắt. Các mục menu sẽ tự động hiển thị cùng hàng với Logo ở Thanh Header Chính.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      onChangeThemeConfig({
                        ...themeConfig,
                        headerBottomShow: true,
                        headerBottomHeight: 45,
                        headerBottomBg: themeConfig.colorPrimary || '#0f3a61',
                        headerBottomColor: 'dark',
                      })
                    }
                    className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 cursor-pointer transition shadow-xs"
                  >
                    + Bật Thanh Menu Dưới (Wide Nav)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: HEADER BUTTONS (CTA 1 & 2) */}
          {activeHeaderTab === 'buttons' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <MousePointerClick className="w-4 h-4 text-blue-600" />
                  <span>Nút Kêu Gọi Hành Động (Header Buttons: Button 1 &amp; Button 2)</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tùy chỉnh 2 nút CTA nổi bật ở góc phải Header như nút <strong>REGÍSTRATE</strong> &amp; <strong>ENTRAR</strong> trong ảnh Juega365.com của bạn.
                </p>
              </div>

              {/* Button 1 Configuration */}
              <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span>
                    <h4 className="text-xs font-bold text-slate-800">Nút Số 1 (Button 1 - Ví dụ: REGÍSTRATE / Đăng Ký)</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onChangeThemeConfig({
                        ...themeConfig,
                        headerButton1Show: !themeConfig.headerButton1Show,
                      })
                    }
                    className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                      themeConfig.headerButton1Show
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {themeConfig.headerButton1Show ? '✓ Đang Bật Nút 1' : '✕ Đã Tắt Nút 1'}
                  </button>
                </div>

                {themeConfig.headerButton1Show && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Tiêu Đề Nút 1</label>
                      <input
                        type="text"
                        value={themeConfig.headerButton1Text || 'REGÍSTRATE'}
                        onChange={(e) =>
                          onChangeThemeConfig({ ...themeConfig, headerButton1Text: e.target.value })
                        }
                        placeholder="REGÍSTRATE hoặc Đăng Ký"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Đường Dẫn (URL/Link)</label>
                      <input
                        type="text"
                        value={themeConfig.headerButton1Link || '#register'}
                        onChange={(e) =>
                          onChangeThemeConfig({ ...themeConfig, headerButton1Link: e.target.value })
                        }
                        placeholder="#register hoặc https://..."
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-medium text-slate-900 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Màu Nút (Color)</label>
                      <select
                        value={themeConfig.headerButton1Color || 'alert'}
                        onChange={(e) =>
                          onChangeThemeConfig({
                            ...themeConfig,
                            headerButton1Color: e.target.value as any,
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-hidden"
                      >
                        <option value="alert">Alert (Đỏ Nổi Bật - Chuẩn Juega365)</option>
                        <option value="primary">Primary (Màu Chủ Đạo Website)</option>
                        <option value="secondary">Secondary (Màu Phụ / Điểm Nhấn)</option>
                        <option value="success">Success (Xanh Lá Cây)</option>
                        <option value="white">White (Nền Trắng)</option>
                        <option value="plain">Plain (Mờ Tối Giản)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Bo Góc (Radius)</label>
                      <select
                        value={themeConfig.headerButton1Radius || '99px'}
                        onChange={(e) =>
                          onChangeThemeConfig({ ...themeConfig, headerButton1Radius: e.target.value })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-hidden"
                      >
                        <option value="99px">99px (Tròn Viên Thuốc - Pill)</option>
                        <option value="8px">8px (Bo Góc Vừa)</option>
                        <option value="4px">4px (Bo Góc Nhẹ)</option>
                        <option value="0px">0px (Vuông Vức)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Button 2 Configuration */}
              <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span>
                    <h4 className="text-xs font-bold text-slate-800">Nút Số 2 (Button 2 - Ví dụ: ENTRAR / Đăng Nhập)</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onChangeThemeConfig({
                        ...themeConfig,
                        headerButton2Show: !themeConfig.headerButton2Show,
                      })
                    }
                    className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                      themeConfig.headerButton2Show
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {themeConfig.headerButton2Show ? '✓ Đang Bật Nút 2' : '✕ Đã Tắt Nút 2'}
                  </button>
                </div>

                {themeConfig.headerButton2Show && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Tiêu Đề Nút 2</label>
                      <input
                        type="text"
                        value={themeConfig.headerButton2Text || 'ENTRAR'}
                        onChange={(e) =>
                          onChangeThemeConfig({ ...themeConfig, headerButton2Text: e.target.value })
                        }
                        placeholder="ENTRAR hoặc Đăng Nhập"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Đường Dẫn (URL/Link)</label>
                      <input
                        type="text"
                        value={themeConfig.headerButton2Link || '#login'}
                        onChange={(e) =>
                          onChangeThemeConfig({ ...themeConfig, headerButton2Link: e.target.value })
                        }
                        placeholder="#login hoặc https://..."
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-medium text-slate-900 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Màu Nút (Color)</label>
                      <select
                        value={themeConfig.headerButton2Color || 'alert'}
                        onChange={(e) =>
                          onChangeThemeConfig({
                            ...themeConfig,
                            headerButton2Color: e.target.value as any,
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-hidden"
                      >
                        <option value="alert">Alert (Đỏ Nổi Bật - Chuẩn Juega365)</option>
                        <option value="primary">Primary (Màu Chủ Đạo Website)</option>
                        <option value="secondary">Secondary (Màu Phụ / Điểm Nhấn)</option>
                        <option value="success">Success (Xanh Lá Cây)</option>
                        <option value="white">White (Nền Trắng)</option>
                        <option value="plain">Plain (Mờ Tối Giản)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Bo Góc (Radius)</label>
                      <select
                        value={themeConfig.headerButton2Radius || '99px'}
                        onChange={(e) =>
                          onChangeThemeConfig({ ...themeConfig, headerButton2Radius: e.target.value })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-hidden"
                      >
                        <option value="99px">99px (Tròn Viên Thuốc - Pill)</option>
                        <option value="8px">8px (Bo Góc Vừa)</option>
                        <option value="4px">4px (Bo Góc Nhẹ)</option>
                        <option value="0px">0px (Vuông Vức)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: STICKY HEADER */}
          {activeHeaderTab === 'sticky' && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Pin className="w-4 h-4 text-blue-600" />
                  <span>Cài Đặt Cố Định Header Khi Cuộn Trang (Sticky Header)</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tương đương mục <strong>Personalizar &gt; Header &gt; Sticky Header</strong> trong WordPress.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Main Header Sticky Toggle */}
                <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Cố Định Thanh Chính (Header Main Sticky)</div>
                    <div className="text-[11px] text-slate-500">Giữ thanh Logo và nút khi cuộn chuột</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={themeConfig.headerSticky ?? true}
                    onChange={(e) => onChangeThemeConfig({ ...themeConfig, headerSticky: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                  />
                </div>

                {/* Bottom Bar Sticky Toggle */}
                <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Cố Định Thanh Menu Dưới (Bottom Sticky)</div>
                    <div className="text-[11px] text-slate-500">Giữ thanh menu dưới cùng khi cuộn</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={themeConfig.headerStickyBottom ?? true}
                    onChange={(e) =>
                      onChangeThemeConfig({ ...themeConfig, headerStickyBottom: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                  />
                </div>

                {/* Sticky Height */}
                <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Chiều Cao Khi Cuộn (Sticky Height)</label>
                    <span className="text-xs font-mono font-bold text-blue-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {themeConfig.headerStickyHeight || 70}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    step="1"
                    value={themeConfig.headerStickyHeight || 70}
                    onChange={(e) =>
                      onChangeThemeConfig({
                        ...themeConfig,
                        headerStickyHeight: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full cursor-pointer accent-blue-600"
                  />
                  <p className="text-[10px] text-slate-400">
                    Flatsome sẽ tự động co nhỏ header về chiều cao này khi người dùng lướt xuống.
                  </p>
                </div>

                {/* Sticky Style */}
                <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Hiệu Ứng Cuộn (Sticky Style)</label>
                  <select
                    value={themeConfig.headerStickyStyle || 'jump'}
                    onChange={(e) =>
                      onChangeThemeConfig({
                        ...themeConfig,
                        headerStickyStyle: e.target.value as any,
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-hidden"
                  >
                    <option value="jump">Jump Down (Nhảy xuống dứt khoát - Mặc định Flatsome)</option>
                    <option value="fade">Fade (Mờ dần êm ái)</option>
                    <option value="shrink">Shrink (Thu nhỏ mượt mà)</option>
                  </select>

                  <label className="flex items-center gap-2 pt-1 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={themeConfig.headerStickyHideOnScroll ?? false}
                      onChange={(e) =>
                        onChangeThemeConfig({ ...themeConfig, headerStickyHideOnScroll: e.target.checked })
                      }
                      className="w-3.5 h-3.5 rounded text-blue-600"
                    />
                    <span>Ẩn khi cuộn xuống, chỉ hiện khi cuộn ngược lên</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ELEMENTS & TOPBAR */}
          {activeHeaderTab === 'elements' && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                  <span>Các Thành Phần Header &amp; Topbar</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Bật/tắt thanh Topbar trên cùng, ô Tìm kiếm, Giỏ hàng WooCommerce &amp; Tài khoản.
                </p>
              </div>

              {/* Elements Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Search Toggle */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Search className="w-4 h-4 text-blue-600" />
                    <span>Ô Tìm Kiếm (Search)</span>
                  </div>
                  <select
                    value={themeConfig.headerShowSearch || 'icon'}
                    onChange={(e) =>
                      onChangeThemeConfig({
                        ...themeConfig,
                        headerShowSearch: e.target.value as any,
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-hidden"
                  >
                    <option value="icon">Icon Kính Lúp (Popup)</option>
                    <option value="form">Ô Tìm Kiếm Đầy Đủ (Form)</option>
                    <option value="none">Tắt Tìm Kiếm</option>
                  </select>
                </div>

                {/* Cart Toggle */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <ShoppingBag className="w-4 h-4 text-amber-600" />
                    <div>
                      <div>Giỏ Hàng (Cart)</div>
                      <div className="text-[10px] text-slate-400 font-normal">WooCommerce</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={themeConfig.headerShowCart ?? false}
                    onChange={(e) => onChangeThemeConfig({ ...themeConfig, headerShowCart: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                  />
                </div>

                {/* Account Toggle */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <User className="w-4 h-4 text-purple-600" />
                    <div>
                      <div>Tài Khoản (Login)</div>
                      <div className="text-[10px] text-slate-400 font-normal">Đăng nhập / Hồ sơ</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={themeConfig.headerShowAccount ?? false}
                    onChange={(e) => onChangeThemeConfig({ ...themeConfig, headerShowAccount: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Topbar Config */}
              <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Thanh Topbar Trên Cùng</span>
                    {themeConfig.topbarText ? (
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.2 rounded-full font-semibold">
                        Đang Bật
                      </span>
                    ) : (
                      <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.2 rounded-full font-semibold">
                        Đã Tắt (Xóa Bỏ)
                      </span>
                    )}
                  </label>

                  {themeConfig.topbarText ? (
                    <button
                      type="button"
                      onClick={() => onChangeThemeConfig({ ...themeConfig, topbarText: '' })}
                      className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-2.5 py-1 rounded-md font-medium transition cursor-pointer"
                    >
                      ✕ Tắt / Xóa Topbar
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        onChangeThemeConfig({
                          ...themeConfig,
                          topbarText: 'Hotline: 0988.xxx.xxx - Tư vấn giải pháp 24/7',
                        })
                      }
                      className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2.5 py-1 rounded-md font-semibold transition cursor-pointer"
                    >
                      + Bật Lại Topbar
                    </button>
                  )}
                </div>

                {themeConfig.topbarText ? (
                  <div>
                    <input
                      type="text"
                      value={themeConfig.topbarText}
                      onChange={(e) => onChangeThemeConfig({ ...themeConfig, topbarText: e.target.value })}
                      placeholder="Ví dụ: Hotline: 0988.xxx.xxx - Tư vấn miễn phí 24/7"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Dòng chữ này sẽ thay thế chữ <em>"ADD ANYTHING HERE OR JUST REMOVE IT..."</em> mặc định của Flatsome.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic py-1">
                    ✅ Thanh Topbar đã được tắt. Website sẽ bắt đầu ngay từ Header chính.
                  </p>
                )}
              </div>

              {/* Absolute Footer Config */}
              <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Dòng Bản Quyền Dưới Cùng (Absolute Footer)</span>
                    {themeConfig.copyrightText ? (
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.2 rounded-full font-semibold">
                        Đang Bật
                      </span>
                    ) : (
                      <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.2 rounded-full font-semibold">
                        Đã Tắt (Xóa Bỏ)
                      </span>
                    )}
                  </label>

                  {themeConfig.copyrightText ? (
                    <button
                      type="button"
                      onClick={() => onChangeThemeConfig({ ...themeConfig, copyrightText: '' })}
                      className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-2.5 py-1 rounded-md font-medium transition cursor-pointer"
                    >
                      ✕ Tắt / Xóa Bản Quyền
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        onChangeThemeConfig({
                          ...themeConfig,
                          copyrightText: '© 2026 Bản quyền thuộc về Doanh Nghiệp. Thiết kế chuẩn SEO.',
                        })
                      }
                      className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2.5 py-1 rounded-md font-semibold transition cursor-pointer"
                    >
                      + Bật Lại Bản Quyền
                    </button>
                  )}
                </div>

                {themeConfig.copyrightText ? (
                  <div>
                    <input
                      type="text"
                      value={themeConfig.copyrightText}
                      onChange={(e) => onChangeThemeConfig({ ...themeConfig, copyrightText: e.target.value })}
                      placeholder="© 2026 Bản quyền thuộc về [Domain]. All rights reserved."
                      className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic py-1">
                    ✅ Dòng bản quyền dưới cùng đã được tắt. Chân trang sẽ kết thúc ngay tại Footer Block.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preset Niches (Màu Sắc Ngành Hàng) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Chọn Preset Màu Sắc Theo Ngành Hàng (1 Click Thay Đổi Cả Theme)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {niches.map((n) => {
            const isSelected = themeConfig.nicheId === n.id;
            return (
              <div
                key={n.id}
                onClick={() => handleSelectNiche(n)}
                className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-500 shadow-2xs'
                    : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/60'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold text-slate-800">{n.name}</div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span
                      style={{ backgroundColor: n.primary }}
                      className="w-4 h-4 rounded-full border border-black/10 inline-block"
                      title="Màu Chính"
                    ></span>
                    <span
                      style={{ backgroundColor: n.secondary }}
                      className="w-4 h-4 rounded-full border border-black/10 inline-block"
                      title="Màu Phụ"
                    ></span>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-blue-600" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Colors & Fonts */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Palette className="w-4 h-4 text-blue-600" />
          <span>Màu Sắc &amp; Font Chữ Tùy Biến</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Màu Chủ Đạo (Primary Color)</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={themeConfig.colorPrimary}
                onChange={(e) => onChangeThemeConfig({ ...themeConfig, colorPrimary: e.target.value })}
                className="w-10 h-10 rounded-lg border border-slate-300 p-0.5 cursor-pointer bg-white"
              />
              <input
                type="text"
                value={themeConfig.colorPrimary}
                onChange={(e) => onChangeThemeConfig({ ...themeConfig, colorPrimary: e.target.value })}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-medium text-slate-800 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Màu Phụ / Điểm Nhấn (Secondary Color)</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={themeConfig.colorSecondary}
                onChange={(e) => onChangeThemeConfig({ ...themeConfig, colorSecondary: e.target.value })}
                className="w-10 h-10 rounded-lg border border-slate-300 p-0.5 cursor-pointer bg-white"
              />
              <input
                type="text"
                value={themeConfig.colorSecondary}
                onChange={(e) => onChangeThemeConfig({ ...themeConfig, colorSecondary: e.target.value })}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-medium text-slate-800 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Font Tiêu Đề (Headings)</label>
            <select
              value={themeConfig.fontHeading}
              onChange={(e) => onChangeThemeConfig({ ...themeConfig, fontHeading: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden"
            >
              <option value="Inter">Inter (Hiện đại, tối giản)</option>
              <option value="Roboto">Roboto (Chuẩn Google)</option>
              <option value="Montserrat">Montserrat (Đậm đà, mạnh mẽ)</option>
              <option value="Plus Jakarta Sans">Plus Jakarta Sans (Sắc nét)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Độ Rộng Khung Hình (Site Width)</label>
            <select
              value={themeConfig.siteWidth}
              onChange={(e) => onChangeThemeConfig({ ...themeConfig, siteWidth: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden"
            >
              <option value="1200px">1200px (Chuẩn màn hình máy tính hiện đại)</option>
              <option value="1080px">1080px (Vừa vặn, thon gọn)</option>
              <option value="1400px">1400px (Rộng rãi)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Container & Default Page Template Config */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Maximize2 className="w-4 h-4 text-blue-600" />
            <span>Bố Cục Trang &amp; Container (Default Page Template)</span>
          </div>
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            Personalizar &gt; Pages
          </span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Tùy chỉnh mẫu bố cục mặc định (Container / Full-Width) cho toàn bộ các trang trên website Flatsome. Tương đương tùy chọn <strong>Personalizar &gt; Pages &gt; Default - Page Template</strong> trong WordPress.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Mẫu Trang Mặc Định (Page Template)</span>
              <span className="text-[10px] text-blue-600 font-medium">Toàn Site</span>
            </label>
            <select
              value={themeConfig.defaultPageTemplate || 'default'}
              onChange={(e) => onChangeThemeConfig({ ...themeConfig, defaultPageTemplate: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden"
            >
              <option value="default">Container (Default) - Có lề 2 bên (Khuyên dùng cho bài viết &amp; SEO)</option>
              <option value="title-center">Container - Center Title (Có lề + Tiêu đề căn giữa)</option>
              <option value="full-width">Full-Width - Tràn viền 100% (Khuyên dùng Landing Page / Trang Chủ)</option>
              <option value="full-width-header-on-scroll">Full-Width - Header On Scroll (Menu trượt khi cuộn)</option>
              <option value="full-width-transparent-header">Full-Width - Transparent Header (Menu trong suốt)</option>
              <option value="full-width-parallax-title">Full-Width - Parallax Title (Tiêu đề hiệu ứng 3D)</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              • <strong>Container</strong>: Giới hạn chiều rộng chữ theo Site Width ({themeConfig.siteWidth || '1200px'}), giúp mắt đọc không bị mỏi.<br />
              • <strong>Full-Width</strong>: Tràn viền màn hình 100%, không bị đóng khung lề.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Khung Toàn Website (Site Layout)</span>
              <span className="text-[10px] text-slate-400 font-normal">Flatsome Layout</span>
            </label>
            <select
              value={themeConfig.siteLayout || 'full-width'}
              onChange={(e) => onChangeThemeConfig({ ...themeConfig, siteLayout: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden"
            >
              <option value="full-width">Full-Width (Tràn toàn màn hình - Hiện đại &amp; Phổ biến nhất)</option>
              <option value="boxed">Boxed (Khung hộp có hình nền bao quanh)</option>
              <option value="framed">Framed (Khung viền có khoảng đệm bao quanh)</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Kiểu bố cục tổng thể của Flatsome cho toàn bộ website (Header, Body, Footer).
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
        <button
          onClick={onPrevStep}
          className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition cursor-pointer"
        >
          ❮ Quay lại Bước 2 (Link SEO)
        </button>

        <div className="flex items-center gap-3">
          {currentSite && (
            <button
              type="button"
              onClick={handleQuickApplyTheme}
              disabled={isApplying}
              className="px-4 py-2.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isApplying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Rocket className="w-3.5 h-3.5" />}
              <span>Áp Dụng Lên Web</span>
            </button>
          )}

          <button
            onClick={onNextStep}
            className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition cursor-pointer"
          >
            Tiếp tục sang Cấu Hình Menu (Bước 4) ➔
          </button>
        </div>
      </div>
    </div>
  );
};
