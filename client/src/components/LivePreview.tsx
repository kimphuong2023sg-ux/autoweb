import React, { useState } from 'react';
import {
  Monitor,
  Smartphone,
  Eye,
  Play,
  Star,
  MapPin,
  Clock,
  Users,
  CheckCircle,
  HelpCircle,
  Info,
  Image as ImageIcon,
  Share2,
  ChevronRight,
  Layers,
  Sparkles,
  X,
} from 'lucide-react';
import { ThemeConfig, FooterConfig, SectionItem, MenuItem, MenuStylingConfig } from '../types';
import { formatRichText } from '../utils/textFormatter';

interface LivePreviewProps {
  themeConfig: ThemeConfig;
  footerConfig: FooterConfig;
  sections: SectionItem[];
  menuItems?: MenuItem[];
  menuStyling?: MenuStylingConfig;
  onClose?: () => void;
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  themeConfig,
  footerConfig,
  sections,
  menuItems,
  menuStyling,
  onClose,
}) => {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="w-[430px] bg-slate-100 border-l border-slate-200 flex flex-col h-[calc(100vh-4rem)]">
      {/* Top Header of Preview */}
      <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <Eye className="w-3.5 h-3.5 text-blue-600" />
          <span>Mô Phỏng Trực Tiếp (Live Preview)</span>
        </div>
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            onClick={() => setDevice('desktop')}
            className={`p-1.5 rounded-md transition ${
              device === 'desktop' ? 'bg-white shadow-2xs text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
            title="Xem giao diện Desktop"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`p-1.5 rounded-md transition ${
              device === 'mobile' ? 'bg-white shadow-2xs text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
            title="Xem giao diện Mobile"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            title="Đóng khung xem trước để mở rộng toàn bộ không gian cài đặt"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Preview Screen Container */}
      <div className="flex-1 overflow-y-auto p-4 flex justify-center items-start">
        <div
          className={`bg-white rounded-xl shadow-md border border-slate-300 overflow-hidden transition-all duration-300 text-slate-800 relative ${
            device === 'desktop' ? 'w-full text-[11px]' : 'w-[320px] text-[10px] min-h-[460px]'
          }`}
        >
          {/* Mock Browser Topbar (Topbar Text) */}
          {themeConfig.topbarText && (
            <div
              style={{ backgroundColor: themeConfig.colorPrimary }}
              className="text-white px-3 py-1 text-center text-[10px] font-medium truncate"
            >
              {themeConfig.topbarText}
            </div>
          )}

          {/* Mock Mobile Drawer Overlay when open */}
          {device === 'mobile' && mobileDrawerOpen && (
            <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-2xs flex">
              <div
                style={{
                  backgroundColor:
                    menuStyling?.mobileDrawerTheme === 'light'
                      ? '#ffffff'
                      : menuStyling?.mobileDrawerTheme === 'match_desktop'
                      ? (menuStyling?.bgType === 'solid' ? menuStyling.bgColor : menuStyling?.gradientColor1 || '#0f172a')
                      : menuStyling?.mobileDrawerTheme === 'custom'
                      ? (menuStyling?.mobileBgColor || '#0f172a')
                      : '#0f172a',
                  color:
                    menuStyling?.mobileDrawerTheme === 'light'
                      ? '#0f172a'
                      : menuStyling?.mobileDrawerTheme === 'match_desktop'
                      ? (menuStyling?.textColor || '#ffffff')
                      : menuStyling?.mobileDrawerTheme === 'custom'
                      ? (menuStyling?.mobileTextColor || '#f8fafc')
                      : '#f8fafc',
                }}
                className="w-[82%] h-full shadow-2xl overflow-y-auto flex flex-col p-3 space-y-2.5 text-left"
              >
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-1.5 border-b border-white/10 text-xs font-bold">
                  <span className="truncate">{footerConfig.brandName || 'FLATSOME NAV'}</span>
                  <button
                    onClick={() => setMobileDrawerOpen(false)}
                    className="p-1 rounded hover:bg-white/10 text-xs opacity-75 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Search Bar */}
                {!menuStyling?.cleanMobileNavOnly && menuStyling?.mobileShowSearch && (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search..."
                      disabled
                      style={{
                        backgroundColor:
                          menuStyling?.mobileDrawerTheme === 'light'
                            ? '#f1f5f9'
                            : 'rgba(255,255,255,0.08)',
                        borderColor:
                          menuStyling?.mobileDrawerTheme === 'light'
                            ? '#e2e8f0'
                            : 'rgba(255,255,255,0.1)',
                      }}
                      className="w-full px-2 py-1 text-[10px] rounded border pr-6 cursor-not-allowed"
                    />
                    <span className="absolute right-2 top-1 text-[9px] opacity-60">🔍</span>
                  </div>
                )}

                {/* Items */}
                <div className="flex-1 space-y-0.5">
                  {menuItems && menuItems.length > 0 ? (
                    menuItems.map((item, idx) => (
                      <div
                        key={item.client_id || idx}
                        style={{
                          borderColor:
                            menuStyling?.mobileDrawerTheme === 'light'
                              ? '#f1f5f9'
                              : 'rgba(255,255,255,0.08)',
                          color:
                            idx === 0
                              ? (menuStyling?.mobileDrawerTheme === 'light' ? '#2563eb' : (menuStyling?.mobileTextHoverColor || '#38bdf8'))
                              : undefined,
                          fontWeight: idx === 0 ? '700' : '500',
                          paddingLeft: item.parent_client_id ? '16px' : '4px',
                          fontSize: item.parent_client_id ? '10px' : (menuStyling?.mobileFontSize || '11px'),
                          textTransform: menuStyling?.isUppercase ? 'uppercase' : 'none',
                        }}
                        className="py-1.5 border-b flex items-center justify-between"
                      >
                        <span>{item.parent_client_id ? `↳ ${item.title}` : item.title}</span>
                      </div>
                    ))
                  ) : (
                    <div className="py-2 text-[10px] opacity-60">Chưa có mục menu nào</div>
                  )}
                </div>

                {/* Newsletter if enabled */}
                {!menuStyling?.cleanMobileNavOnly && menuStyling?.mobileShowNewsletter && (
                  <div
                    style={{
                      borderColor:
                        menuStyling?.mobileDrawerTheme === 'light'
                          ? '#f1f5f9'
                          : 'rgba(255,255,255,0.08)',
                    }}
                    className="py-1 px-2 rounded border flex items-center justify-between text-[10px] opacity-80"
                  >
                    <span className="flex items-center gap-1.5 font-semibold">
                      <span>✉</span>
                      <span>NEWSLETTER</span>
                    </span>
                    <span className="text-[9px]">→</span>
                  </div>
                )}

                {/* Social */}
                {!menuStyling?.cleanMobileNavOnly && menuStyling?.mobileShowSocial && (
                  <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-3 text-xs opacity-75">
                    <span>f</span>
                    <span>📷</span>
                    <span>🐦</span>
                    <span>✉</span>
                  </div>
                )}
              </div>
              <div className="flex-1 cursor-pointer" onClick={() => setMobileDrawerOpen(false)}></div>
            </div>
          )}

          {/* Mock Main Header */}
          <div
            style={{
              backgroundColor:
                themeConfig.headerBg === 'transparent'
                  ? 'transparent'
                  : themeConfig.headerBg || (themeConfig.headerColor === 'dark' ? '#161616' : '#ffffff'),
              color: themeConfig.headerColor === 'dark' ? '#ffffff' : '#0f172a',
              minHeight: `${Math.max(40, Math.min(80, (themeConfig.headerHeight || 90) * 0.55))}px`,
            }}
            className="px-3 py-2 border-b border-slate-100/30 flex items-center justify-between sticky top-0 z-10 shadow-2xs transition-colors duration-200"
          >
            {/* Logo */}
            <div className="font-bold text-xs tracking-tight flex items-center gap-1.5 shrink-0">
              <span
                style={{ backgroundColor: themeConfig.colorPrimary }}
                className="w-2.5 h-2.5 rounded-sm inline-block shadow-2xs"
              ></span>
              <span className="font-extrabold truncate max-w-[120px]">
                {footerConfig.brandName || 'BRAND LOGO'}
              </span>
            </div>

            {/* Desktop Navigation (if headerBottomShow is false, menu is displayed here) */}
            {device === 'desktop' ? (
              <div className="flex items-center gap-2 text-[10px] font-medium overflow-hidden">
                {!themeConfig.headerBottomShow && (
                  <div className="flex items-center gap-2 overflow-hidden mr-2">
                    {menuItems && menuItems.length > 0 ? (
                      menuItems
                        .filter((item) => !item.parent_client_id)
                        .slice(0, 4)
                        .map((item, idx) => (
                          <span
                            key={item.client_id || idx}
                            className={`truncate max-w-[65px] ${
                              idx === 0
                                ? 'font-bold'
                                : 'opacity-80 hover:opacity-100'
                            }`}
                            style={{
                              color:
                                idx === 0
                                  ? themeConfig.headerColor === 'dark'
                                    ? '#38bdf8'
                                    : '#2563eb'
                                  : undefined,
                            }}
                            title={item.title}
                          >
                            {item.title}
                          </span>
                        ))
                    ) : (
                      <>
                        <span className="font-bold text-blue-500">Trang Chủ</span>
                        <span className="opacity-80">Dịch Vụ</span>
                        <span className="opacity-80">Giới Thiệu</span>
                      </>
                    )}
                  </div>
                )}

                {/* Right Elements (Search, Cart, Account, Buttons) */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Search Icon / Form */}
                  {themeConfig.headerShowSearch === 'form' ? (
                    <div className="hidden sm:flex items-center bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded text-[9px] border border-black/10">
                      <span className="opacity-60">🔍 Tìm...</span>
                    </div>
                  ) : themeConfig.headerShowSearch !== 'none' ? (
                    <span className="text-xs opacity-75 cursor-default" title="Tìm kiếm">🔍</span>
                  ) : null}

                  {/* Cart */}
                  {themeConfig.headerShowCart && (
                    <span className="text-xs opacity-75 cursor-default" title="Giỏ hàng">🛒</span>
                  )}

                  {/* Account */}
                  {themeConfig.headerShowAccount && (
                    <span className="text-xs opacity-75 cursor-default" title="Tài khoản">👤</span>
                  )}

                  {/* Button 1 (e.g. REGÍSTRATE) */}
                  {themeConfig.headerButton1Show && (
                    <span
                      style={{
                        backgroundColor:
                          themeConfig.headerButton1Color === 'primary'
                            ? themeConfig.colorPrimary
                            : themeConfig.headerButton1Color === 'secondary'
                            ? themeConfig.colorSecondary
                            : themeConfig.headerButton1Color === 'success'
                            ? '#16a34a'
                            : themeConfig.headerButton1Color === 'white'
                            ? '#ffffff'
                            : themeConfig.headerButton1Color === 'plain'
                            ? 'transparent'
                            : '#dc2626',
                        color:
                          themeConfig.headerButton1Color === 'white'
                            ? '#0f172a'
                            : themeConfig.headerButton1Style === 'is-outline'
                            ? (themeConfig.headerButton1Color === 'alert' ? '#dc2626' : themeConfig.colorPrimary)
                            : '#ffffff',
                        border:
                          themeConfig.headerButton1Style === 'is-outline'
                            ? `1px solid ${themeConfig.headerButton1Color === 'alert' ? '#dc2626' : themeConfig.colorPrimary}`
                            : 'none',
                        borderRadius:
                          themeConfig.headerButton1Radius === '0px'
                            ? '0px'
                            : themeConfig.headerButton1Radius === '4px'
                            ? '4px'
                            : themeConfig.headerButton1Radius === '8px'
                            ? '8px'
                            : '9999px',
                      }}
                      className="text-[9px] font-bold px-2 py-0.5 shadow-2xs tracking-wide shrink-0 transition"
                    >
                      {themeConfig.headerButton1Text || 'REGÍSTRATE'}
                    </span>
                  )}

                  {/* Button 2 (e.g. ENTRAR) */}
                  {themeConfig.headerButton2Show && (
                    <span
                      style={{
                        backgroundColor:
                          themeConfig.headerButton2Color === 'primary'
                            ? themeConfig.colorPrimary
                            : themeConfig.headerButton2Color === 'secondary'
                            ? themeConfig.colorSecondary
                            : themeConfig.headerButton2Color === 'success'
                            ? '#16a34a'
                            : themeConfig.headerButton2Color === 'white'
                            ? '#ffffff'
                            : themeConfig.headerButton2Color === 'plain'
                            ? 'transparent'
                            : '#dc2626',
                        color:
                          themeConfig.headerButton2Color === 'white'
                            ? '#0f172a'
                            : themeConfig.headerButton2Style === 'is-outline'
                            ? (themeConfig.headerButton2Color === 'alert' ? '#dc2626' : themeConfig.colorPrimary)
                            : '#ffffff',
                        border:
                          themeConfig.headerButton2Style === 'is-outline'
                            ? `1px solid ${themeConfig.headerButton2Color === 'alert' ? '#dc2626' : themeConfig.colorPrimary}`
                            : 'none',
                        borderRadius:
                          themeConfig.headerButton2Radius === '0px'
                            ? '0px'
                            : themeConfig.headerButton2Radius === '4px'
                            ? '4px'
                            : themeConfig.headerButton2Radius === '8px'
                            ? '8px'
                            : '9999px',
                      }}
                      className="text-[9px] font-bold px-2 py-0.5 shadow-2xs tracking-wide shrink-0 transition"
                    >
                      {themeConfig.headerButton2Text || 'ENTRAR'}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                {themeConfig.headerButton1Show && (
                  <span
                    style={{
                      backgroundColor:
                        themeConfig.headerButton1Color === 'alert'
                          ? '#dc2626'
                          : themeConfig.colorPrimary,
                    }}
                    className="text-[8px] font-bold text-white px-2 py-0.5 rounded-full"
                  >
                    {themeConfig.headerButton1Text || 'CTA'}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
                  style={{
                    backgroundColor:
                      menuStyling?.mobileIconBgColor && menuStyling.mobileIconBgColor !== 'transparent'
                        ? menuStyling.mobileIconBgColor
                        : '#0f172a',
                    color: menuStyling?.mobileIconColor || '#ffffff',
                  }}
                  className="px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition border border-white/20 shadow-xs"
                  title="Bấm để mở / đóng Mobile Drawer Flatsome"
                >
                  <span className="text-sm leading-none font-bold">☰</span>
                </button>
              </div>
            )}
          </div>

          {/* Mock Main Menu Bar (Header Bottom / Wide Nav) with real gradient & colors & borders */}
          {themeConfig.headerBottomShow !== false && device === 'desktop' && (
            <div
              style={{
                background:
                  themeConfig.headerBottomBg && (!menuStyling || menuStyling.bgType === 'solid')
                    ? themeConfig.headerBottomBg
                    : menuStyling?.bgType === 'gradient'
                    ? `linear-gradient(${menuStyling.gradientAngle || '135deg'}, ${menuStyling.gradientColor1 || '#1e3c72'} 0%, ${menuStyling.gradientColor2 || '#2a5298'} 100%)`
                    : menuStyling?.bgType === 'solid'
                    ? menuStyling.bgColor || themeConfig.headerBottomBg || '#1e293b'
                    : themeConfig.headerBottomBg || 'transparent',
                color:
                  themeConfig.headerBottomColor === 'light'
                    ? '#0f172a'
                    : menuStyling?.textColor || '#ffffff',
                minHeight: `${Math.max(28, (themeConfig.headerBottomHeight || 45) * 0.75)}px`,
                borderTop:
                  menuStyling?.borderTopWidth && menuStyling.borderTopWidth !== '0px'
                    ? `${menuStyling.borderTopWidth} ${menuStyling.borderStyle || 'solid'} ${menuStyling.borderTopColor || 'transparent'}`
                    : 'none',
                borderBottom:
                  menuStyling?.borderBottomWidth && menuStyling.borderBottomWidth !== '0px'
                    ? `${menuStyling.borderBottomWidth} ${menuStyling.borderStyle || 'solid'} ${menuStyling.borderBottomColor || 'transparent'}`
                    : 'none',
                borderLeft:
                  menuStyling?.borderLeftWidth && menuStyling.borderLeftWidth !== '0px'
                    ? `${menuStyling.borderLeftWidth} ${menuStyling.borderStyle || 'solid'} ${menuStyling.borderLeftColor || 'transparent'}`
                    : 'none',
                borderRight:
                  menuStyling?.borderRightWidth && menuStyling.borderRightWidth !== '0px'
                    ? `${menuStyling.borderRightWidth} ${menuStyling.borderStyle || 'solid'} ${menuStyling.borderRightColor || 'transparent'}`
                    : 'none',
              }}
              className="py-1 shadow-2xs transition-all duration-300"
            >
              <div
                className={`flex items-center justify-between text-[10px] transition-all ${
                  themeConfig.headerBottomWidth === 'container'
                    ? 'max-w-[82%] mx-auto px-2'
                    : 'w-full px-3'
                }`}
              >
                <div
                  className={`flex items-center gap-1.5 font-semibold ${
                    themeConfig.headerNavNoWrap ?? true
                      ? 'flex-nowrap overflow-x-auto scrollbar-none'
                      : 'flex-wrap'
                  }`}
                >
                  {menuItems && menuItems.length > 0 ? (
                    menuItems
                      .filter((item) => !item.parent_client_id)
                      .slice(0, 10)
                      .map((item, idx) => (
                        <span
                          key={item.client_id || idx}
                          style={{
                            color:
                              idx === 0
                                ? menuStyling?.textHoverColor || '#fde047'
                                : themeConfig.headerBottomColor === 'light'
                                ? '#0f172a'
                                : menuStyling?.textColor || '#ffffff',
                            textTransform: menuStyling?.isUppercase ? 'uppercase' : 'none',
                            fontSize: menuStyling?.fontSize || '10px',
                            whiteSpace: 'nowrap',
                          }}
                          className="shrink-0 cursor-default px-1.5 py-0.5 rounded transition"
                          title={item.title}
                        >
                          {item.title}
                        </span>
                      ))
                  ) : (
                    <div className="flex items-center gap-2 shrink-0">
                      <span style={{ color: menuStyling?.textHoverColor || '#fde047' }}>TRANG CHỦ</span>
                      <span>APUESTAS DEPORTIVAS</span>
                      <span>DESCARGAR APP</span>
                      <span>OPINIONES</span>
                      <span>CASINO ONLINE</span>
                    </div>
                  )}
                </div>
                <div className="text-[8px] opacity-75 font-mono shrink-0 uppercase tracking-wider ml-2">
                  {themeConfig.headerBottomWidth === 'container' ? 'Container' : 'Full Width'}
                </div>
              </div>
            </div>
          )}

          {/* Mock Homepage Sections */}
          <div className="divide-y divide-slate-100">
            {sections.map((sec, idx) => {
              const paddingClass =
                sec.padding === 'small'
                  ? 'py-2 px-2.5'
                  : sec.padding === 'large'
                  ? 'py-4 px-3.5'
                  : 'py-3 px-3';

              const isLightText = sec.textColor === 'light';

              return (
                <div
                  key={sec.id || idx}
                  className={`${paddingClass} ${isLightText ? 'text-white' : 'text-slate-800'}`}
                  style={{ backgroundColor: sec.bgColor || 'transparent' }}
                >
                  {/* HERO BANNER */}
                  {sec.type === 'hero' && (
                    <div className="p-3.5 rounded-xl border border-slate-100 text-center bg-slate-50/70 shadow-2xs">
                      <span className="text-[9px] uppercase tracking-wider text-blue-600 font-bold block mb-1">
                        Hero Banner
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs leading-tight mb-1">
                        {sec.title || 'Tiêu Đề Hero Banner'}
                      </h4>
                      <p className="text-slate-500 text-[10px] line-clamp-2 mb-2">
                        {sec.subtitle || 'Mô tả ngắn gọn về giải pháp và dịch vụ chuẩn SEO.'}
                      </p>
                      <button
                        style={{ backgroundColor: themeConfig.colorPrimary }}
                        className="text-white text-[9px] px-3 py-1 rounded-md font-semibold shadow-2xs"
                      >
                        {sec.buttonText || 'Nhận Tư Vấn Ngay'}
                      </button>
                    </div>
                  )}

                  {/* UX BANNER */}
                  {sec.type === 'banner' && (
                    <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 text-center shadow-2xs">
                      <div
                        className="absolute inset-0 bg-cover bg-center opacity-30"
                        style={{
                          backgroundImage: `url('${sec.data?.imageUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600'}')`,
                        }}
                      ></div>
                      <div className="relative z-10">
                        <span className="inline-block bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded text-[8px] uppercase tracking-wider mb-1">
                          UX Banner
                        </span>
                        <h4 className="font-extrabold text-white text-xs mb-1">
                          {sec.title || 'Banner Quảng Bá Cao Cấp'}
                        </h4>
                        <p className="text-slate-300 text-[9px] line-clamp-2 mb-2">
                          {sec.subtitle || 'Thiết kế chuẩn Flatsome ux_banner với hiệu ứng hình nền và nút CTA nổi bật.'}
                        </p>
                        <button
                          style={{ backgroundColor: themeConfig.colorPrimary }}
                          className="text-white text-[9px] px-3 py-1 rounded-md font-bold shadow-2xs"
                        >
                          {sec.buttonText || 'Khám Phá Thêm'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* UX SLIDER */}
                  {sec.type === 'slider' && (
                    <div className="relative rounded-xl overflow-hidden bg-slate-800 text-white p-4 text-center">
                      <div className="relative z-10">
                        <div className="text-[8px] text-blue-400 font-bold uppercase mb-1">Slide 1 / 3</div>
                        <h4 className="font-bold text-xs text-white mb-1">
                          {sec.title || 'Trình Chiếu Slide Flatsome'}
                        </h4>
                        <p className="text-slate-300 text-[9px] mb-2 line-clamp-1">
                          {sec.subtitle || 'Hiệu ứng trượt slide banner mượt mà chuẩn ux_slider.'}
                        </p>
                        <div className="flex justify-center gap-1.5 mt-2">
                          <span className="w-4 h-1 rounded-full bg-blue-500 inline-block"></span>
                          <span className="w-1.5 h-1 rounded-full bg-slate-600 inline-block"></span>
                          <span className="w-1.5 h-1 rounded-full bg-slate-600 inline-block"></span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ROW CUSTOM */}
                  {sec.type === 'row_custom' && (
                    <div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider text-center mb-1.5">
                        Row Layout ({sec.layout || '3-col-equal'})
                      </div>
                      <div
                        className={`grid gap-1.5 ${
                          sec.layout === '1-col'
                            ? 'grid-cols-1'
                            : sec.layout === '2-col-equal'
                            ? 'grid-cols-2'
                            : sec.layout === '2-col-left-wide'
                            ? 'grid-cols-3'
                            : sec.layout === '2-col-right-wide'
                            ? 'grid-cols-3'
                            : sec.layout === '4-col-equal'
                            ? 'grid-cols-4'
                            : 'grid-cols-3'
                        }`}
                      >
                        {sec.layout === '2-col-left-wide' ? (
                          <>
                            <div className="col-span-1 bg-slate-50 border border-slate-200 rounded p-2 text-center text-[9px] font-medium text-slate-700">
                              Cột 1 (33%)
                            </div>
                            <div className="col-span-2 bg-slate-50 border border-slate-200 rounded p-2 text-center text-[9px] font-medium text-slate-700">
                              Cột 2 (67%)
                            </div>
                          </>
                        ) : sec.layout === '2-col-right-wide' ? (
                          <>
                            <div className="col-span-2 bg-slate-50 border border-slate-200 rounded p-2 text-center text-[9px] font-medium text-slate-700">
                              Cột 1 (67%)
                            </div>
                            <div className="col-span-1 bg-slate-50 border border-slate-200 rounded p-2 text-center text-[9px] font-medium text-slate-700">
                              Cột 2 (33%)
                            </div>
                          </>
                        ) : (
                          Array.from({
                            length:
                              sec.layout === '1-col'
                                ? 1
                                : sec.layout === '2-col-equal'
                                ? 2
                                : sec.layout === '4-col-equal'
                                ? 4
                                : 3,
                          }).map((_, colIdx) => (
                            <div
                              key={colIdx}
                              className="bg-slate-50 border border-dashed border-slate-200 rounded p-2 text-center text-[8px] font-medium text-slate-600"
                            >
                              <div className="font-bold text-slate-800">Cột {colIdx + 1}</div>
                              <div className="text-[7px] text-slate-400">Flatsome Col</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* PRICE TABLE */}
                  {sec.type === 'price_table' && (
                    <div>
                      <div className="text-center mb-2">
                        <h4 className="font-bold text-slate-900 text-xs">{sec.title || 'Bảng Giá Dịch Vụ'}</h4>
                        <div className="text-[9px] text-slate-400">{sec.subtitle || 'Minh bạch & Nhiều ưu đãi'}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-center">
                          <div className="font-bold text-[9px] text-slate-700">Cơ Bản</div>
                          <div className="text-xs font-black text-blue-600 my-0.5">990K</div>
                          <div className="text-[7px] text-slate-400 mb-1">/tháng</div>
                          <div className="text-[7px] text-slate-500 space-y-0.5">
                            <div>✓ 5 Từ khóa</div>
                            <div>✓ Báo cáo tuần</div>
                          </div>
                        </div>

                        <div className="bg-blue-50/50 border-2 border-blue-500 rounded-lg p-1.5 text-center relative shadow-2xs">
                          <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[6px] font-bold px-1 rounded-full uppercase">
                            HOT
                          </span>
                          <div className="font-bold text-[9px] text-blue-900">Nâng Cao</div>
                          <div className="text-xs font-black text-blue-600 my-0.5">2.490K</div>
                          <div className="text-[7px] text-slate-400 mb-1">/tháng</div>
                          <div className="text-[7px] text-slate-600 space-y-0.5">
                            <div>✓ 20 Từ khóa</div>
                            <div>✓ Tối ưu Onpage</div>
                          </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-center">
                          <div className="font-bold text-[9px] text-slate-700">VIP</div>
                          <div className="text-xs font-black text-slate-800 my-0.5">4.990K</div>
                          <div className="text-[7px] text-slate-400 mb-1">/tháng</div>
                          <div className="text-[7px] text-slate-500 space-y-0.5">
                            <div>✓ Không giới hạn</div>
                            <div>✓ Hỗ trợ 24/7</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TESTIMONIALS */}
                  {sec.type === 'testimonials' && (
                    <div>
                      <div className="text-center mb-2">
                        <h4 className="font-bold text-slate-900 text-xs">{sec.title || 'Đánh Giá Từ Khách Hàng'}</h4>
                        <div className="text-[9px] text-slate-400">Uy tín được khẳng định qua hàng trăm đối tác</div>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
                          <div className="flex text-amber-400 text-[8px] mb-1">★★★★★</div>
                          <p className="text-slate-600 text-[8px] line-clamp-2 italic mb-1.5">
                            "Dịch vụ rất chu đáo, lượng truy cập tăng vượt bậc sau 2 tháng hợp tác."
                          </p>
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 rounded-full bg-blue-200 text-blue-700 font-bold text-[8px] flex items-center justify-center">
                              A
                            </div>
                            <div>
                              <div className="font-bold text-[8px] text-slate-800">Anh Tuấn</div>
                              <div className="text-[7px] text-slate-400">CEO EcoStore</div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
                          <div className="flex text-amber-400 text-[8px] mb-1">★★★★★</div>
                          <p className="text-slate-600 text-[8px] line-clamp-2 italic mb-1.5">
                            "Giao diện chuẩn Flatsome nhẹ và tối ưu SEO rất tốt. Rất hài lòng!"
                          </p>
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-700 font-bold text-[8px] flex items-center justify-center">
                              H
                            </div>
                            <div>
                              <div className="font-bold text-[8px] text-slate-800">Chị Hạnh</div>
                              <div className="text-[7px] text-slate-400">Giám Đốc Marketing</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TEAM MEMBERS */}
                  {sec.type === 'team' && (
                    <div>
                      <div className="text-center mb-2">
                        <h4 className="font-bold text-slate-900 text-xs">{sec.title || 'Đội Ngũ Chuyên Gia'}</h4>
                        <div className="text-[9px] text-slate-400">Những người đứng sau sự thành công của bạn</div>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {['Nguyễn Văn A', 'Trần Thị B', 'Lê Hoàng C'].map((name, i) => (
                          <div key={i} className="bg-slate-50 border border-slate-100 rounded-lg p-1.5 text-center">
                            <div className="w-8 h-8 rounded-full bg-slate-200 mx-auto mb-1 flex items-center justify-center text-slate-500 font-bold text-[9px]">
                              {name[0]}
                            </div>
                            <div className="font-bold text-[8px] text-slate-800 truncate">{name}</div>
                            <div className="text-[7px] text-blue-600 font-medium">Chuyên Gia SEO</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TABS */}
                  {sec.type === 'tabs' && (
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs text-center mb-1.5">
                        {sec.title || 'Tab Nhóm Nội Dung (Tab Group)'}
                      </h4>
                      <div className="flex border-b border-slate-200 text-[9px] font-bold">
                        <span className="px-2 py-1 border-b-2 border-blue-600 text-blue-600">Tổng Quan</span>
                        <span className="px-2 py-1 text-slate-400">Quy Trình</span>
                        <span className="px-2 py-1 text-slate-400">Bảo Hành</span>
                      </div>
                      <div className="p-2 bg-slate-50 border border-t-0 border-slate-100 rounded-b text-[8px] text-slate-600">
                        Nội dung chi tiết được hiển thị bên trong từng tab Flatsome [tabgroup].
                      </div>
                    </div>
                  )}

                  {/* COUNTDOWN */}
                  {sec.type === 'countdown' && (
                    <div className="bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-xl p-2.5 text-center shadow-2xs">
                      <div className="text-[8px] uppercase tracking-wider font-bold mb-1 opacity-90">
                        {sec.title || 'ƯU ĐÃI CÓ HẠN - KẾT THÚC SAU'}
                      </div>
                      <div className="flex justify-center gap-1.5 my-1">
                        <div className="bg-white/20 backdrop-blur-xs rounded px-1.5 py-0.5">
                          <div className="font-black text-xs">02</div>
                          <div className="text-[6px] uppercase">Ngày</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-xs rounded px-1.5 py-0.5">
                          <div className="font-black text-xs">14</div>
                          <div className="text-[6px] uppercase">Giờ</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-xs rounded px-1.5 py-0.5">
                          <div className="font-black text-xs">35</div>
                          <div className="text-[6px] uppercase">Phút</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-xs rounded px-1.5 py-0.5">
                          <div className="font-black text-xs">12</div>
                          <div className="text-[6px] uppercase">Giây</div>
                        </div>
                      </div>
                      <div className="text-[8px] font-semibold mt-1">Đăng ký ngay hôm nay để nhận giảm giá 30%</div>
                    </div>
                  )}

                  {/* VIDEO */}
                  {sec.type === 'video' && (
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs text-center mb-1.5">
                        {sec.title || 'Video Giới Thiệu'}
                      </h4>
                      <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center group shadow-2xs">
                        <div className="absolute inset-0 opacity-40 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600')` }}></div>
                        <div className="relative z-10 w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MAP */}
                  {sec.type === 'map' && (
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs text-center mb-1.5">
                        {sec.title || 'Bản Đồ Vị Trí Trụ Sở'}
                      </h4>
                      <div className="relative h-24 bg-slate-200 rounded-xl overflow-hidden flex items-center justify-center border border-slate-300">
                        <div className="text-center">
                          <MapPin className="w-5 h-5 text-red-600 mx-auto animate-bounce mb-0.5" />
                          <div className="text-[8px] font-bold text-slate-700">Google Map Flatsome [map]</div>
                          <div className="text-[7px] text-slate-500">Tọa độ: 10.7769, 106.7009 (TP.HCM)</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PORTFOLIO */}
                  {sec.type === 'portfolio' && (
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs text-center mb-1.5">
                        {sec.title || 'Dự Án Đã Thực Hiện'}
                      </h4>
                      <div className="grid grid-cols-3 gap-1">
                        {[1, 2, 3].map((item) => (
                          <div key={item} className="bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                            <div className="h-10 bg-slate-300 flex items-center justify-center text-slate-400 text-[7px]">
                              Dự án #{item}
                            </div>
                            <div className="p-1 text-[8px] font-bold text-slate-800 truncate">Thiết Kế Web #{item}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* GALLERY */}
                  {sec.type === 'gallery' && (
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs text-center mb-1.5">
                        {sec.title || 'Thư Viện Ảnh (UX Gallery)'}
                      </h4>
                      <div className="grid grid-cols-4 gap-1">
                        {[1, 2, 3, 4].map((item) => (
                          <div key={item} className="aspect-square bg-slate-200 rounded flex items-center justify-center text-slate-400 text-[7px] border border-slate-100">
                            Ảnh #{item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SOCIAL ICONS */}
                  {sec.type === 'social_icons' && (
                    <div className="text-center py-1">
                      <div className="text-[9px] font-bold text-slate-700 mb-1.5">
                        {sec.title || 'Kết Nối Mạng Xã Hội'}
                      </div>
                      <div className="flex justify-center gap-2">
                        {['Facebook', 'YouTube', 'Instagram', 'Telegram'].map((s) => (
                          <span
                            key={s}
                            style={{ backgroundColor: themeConfig.colorPrimary }}
                            className="text-white text-[8px] font-bold px-2 py-0.5 rounded shadow-2xs"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* MESSAGE BOX */}
                  {sec.type === 'message_box' && (() => {
                    const data = sec.data || {};
                    const boxLayout = data.boxLayout || (data.hasButton1 && data.button1Text ? 'inline' : 'center');
                    const buttonAlign = data.buttonAlign || (boxLayout === 'inline' ? 'right' : 'center');
                    const hasBtn1 = data.hasButton1 ?? true;
                    const btn1Text = data.button1Text !== undefined ? data.button1Text : (sec.buttonText || 'Đăng Ký Ngay');
                    const btn1Color = data.button1Color || 'white';
                    const btn1Style = data.button1Style || '';

                    const hasBtn2 = Boolean(data.hasButton2);
                    const btn2Text = data.button2Text || '';
                    const btn2Color = data.button2Color || 'secondary';
                    const btn2Style = data.button2Style || 'outline';

                    const content = (sec.content !== undefined ? sec.content : (sec.subtitle || sec.title || '')).trim();

                    const getBtnStyle = (color: string, style: string) => {
                      if (style === 'outline') {
                        return {
                          border: '1px solid currentColor',
                          backgroundColor: 'transparent',
                        };
                      }
                      if (color === 'white') return { backgroundColor: '#ffffff', color: '#0f172a' };
                      if (color === 'primary') return { backgroundColor: themeConfig.colorPrimary || '#2563eb', color: '#ffffff' };
                      if (color === 'secondary') return { backgroundColor: themeConfig.colorSecondary || '#475569', color: '#ffffff' };
                      if (color === 'success') return { backgroundColor: '#10b981', color: '#ffffff' };
                      if (color === 'alert') return { backgroundColor: '#ef4444', color: '#ffffff' };
                      return { backgroundColor: '#ffffff', color: '#0f172a' };
                    };

                    const btnClusterNodes = (
                      <div className="flex items-center gap-1.5 shrink-0">
                        {hasBtn1 && btn1Text && (
                          <span
                            style={getBtnStyle(btn1Color, btn1Style)}
                            className="px-2 py-0.5 rounded text-[7.5px] font-bold shadow-2xs"
                          >
                            {btn1Text}
                          </span>
                        )}
                        {hasBtn2 && btn2Text && (
                          <span
                            style={getBtnStyle(btn2Color, btn2Style)}
                            className="px-2 py-0.5 rounded text-[7.5px] font-bold shadow-2xs"
                          >
                            {btn2Text}
                          </span>
                        )}
                      </div>
                    );

                    const minHeight = data.minHeight ? Number(data.minHeight) : 0;
                    const calcMinHeight = minHeight > 0 ? Math.max(25, Math.round(minHeight * 0.35)) : undefined;
                    const calcPadding = Math.max(6, Math.min(60, Math.round((data.padding !== undefined ? data.padding : 15) * 0.35)));

                    const borderRadius = data.borderRadius !== undefined ? Number(data.borderRadius) : 0;
                    const shadow = data.shadow || '';

                    let shadowStyle: string | undefined = undefined;
                    if (shadow === 'box-shadow-1') shadowStyle = '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)';
                    else if (shadow === 'box-shadow-2') shadowStyle = '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)';
                    else if (shadow === 'box-shadow-3') shadowStyle = '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)';
                    else if (shadow === 'box-shadow-4') shadowStyle = '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)';
                    else if (shadow === 'box-shadow-5') shadowStyle = '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)';
                    else if (shadow === 'glow-alert') shadowStyle = '0 0 12px rgba(239, 68, 68, 0.65), 0 4px 15px rgba(0,0,0,0.35)';
                    else if (shadow === 'glow-gold') shadowStyle = '0 0 12px rgba(245, 158, 11, 0.65), 0 4px 15px rgba(0,0,0,0.35)';
                    else if (shadow === 'glow-primary') shadowStyle = '0 0 12px rgba(37, 99, 235, 0.65), 0 4px 15px rgba(0,0,0,0.35)';

                    return (
                      <div
                        style={{
                          backgroundColor:
                            data.bgColor === 'transparent'
                              ? 'transparent'
                              : data.bgColor || sec.bgColor || '#2563eb',
                          backgroundImage: data.bgImage || data.imageUrl ? `url('${data.bgImage || data.imageUrl}')` : undefined,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          color: (data.textColor || sec.textColor || 'dark') === 'dark' ? '#ffffff' : '#0f172a',
                          padding: `${calcPadding}px 12px`,
                          minHeight: calcMinHeight ? `${calcMinHeight}px` : undefined,
                          borderRadius: borderRadius > 0 ? `${Math.round(borderRadius * 0.7)}px` : '4px',
                          boxShadow: shadowStyle,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                        }}
                        className="relative overflow-hidden transition-all duration-200"
                      >
                        {boxLayout === 'buttons_only' || !content ? (
                          <div className={`relative z-10 flex items-center gap-1.5 flex-wrap flex-1 ${
                            buttonAlign === 'left' ? 'justify-start' : buttonAlign === 'right' ? 'justify-end' : 'justify-center'
                          }`}>
                            {btnClusterNodes}
                          </div>
                        ) : boxLayout === 'inline' && ((hasBtn1 && btn1Text) || (hasBtn2 && btn2Text)) ? (
                          <div className={`relative z-10 flex items-center justify-between gap-2 flex-wrap text-[8.5px] ${
                            buttonAlign === 'left' ? 'flex-row-reverse' : ''
                          }`}>
                            <div className={`flex items-center gap-1 font-semibold truncate flex-1 min-w-[120px] ${
                              buttonAlign === 'left' ? 'justify-end text-right' : ''
                            }`}>
                              {data.icon !== '' && <span>{data.icon || '📢'}</span>}
                              <span className="truncate">{content}</span>
                            </div>
                            {btnClusterNodes}
                          </div>
                        ) : (
                          <div className="relative z-10 space-y-1">
                            <p
                              style={{ textAlign: (data.textAlign || (buttonAlign === 'left' ? 'left' : buttonAlign === 'right' ? 'right' : 'center')) as any }}
                              className="font-bold text-[9px] truncate"
                            >
                              {data.icon !== '' && <span>{data.icon || '📢'} </span>}
                              {content}
                            </p>
                            {((hasBtn1 && btn1Text) || (hasBtn2 && btn2Text)) && (
                              <div className={`flex items-center gap-1.5 flex-wrap ${
                                buttonAlign === 'left' ? 'justify-start' : buttonAlign === 'right' ? 'justify-end' : 'justify-center'
                              }`}>
                                {btnClusterNodes}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* DIVIDER & GAP */}
                  {sec.type === 'divider_gap' && (
                    <div className="py-2">
                      <div className="w-16 h-0.5 bg-blue-600 mx-auto rounded-full"></div>
                    </div>
                  )}

                  {/* IMAGE */}
                  {sec.type === 'image' && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-center">
                      {sec.data?.imageUrl ? (
                        <div className="rounded overflow-hidden">
                          <img
                            src={sec.data.imageUrl}
                            alt={sec.data.alt || sec.title || 'Flatsome Image'}
                            className="w-full max-h-40 object-cover rounded shadow-2xs"
                          />
                        </div>
                      ) : (
                        <div className="bg-slate-100 p-3 rounded">
                          <ImageIcon className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                          <div className="text-[8px] font-bold text-slate-600">
                            Hình Ảnh Flatsome (ux_image)
                          </div>
                        </div>
                      )}
                      {sec.data?.caption && (
                        <p className="text-[7px] text-slate-500 italic mt-1 line-clamp-2">
                          {sec.data.caption}
                        </p>
                      )}
                    </div>
                  )}

                  {/* IMAGE BOX */}
                  {sec.type === 'image_box' && (
                    <div className="space-y-1.5">
                      {sec.title && (
                        <h4 className="font-bold text-[10px] text-slate-800 text-center">{sec.title}</h4>
                      )}
                      {sec.subtitle && (
                        <p className="text-[8px] text-slate-500 text-center mb-1 line-clamp-1">{sec.subtitle}</p>
                      )}
                      {Array.isArray(sec.data?.items) && sec.data.items.length > 0 ? (
                        <div className={`grid grid-cols-${sec.data.items.length === 2 ? '2' : sec.data.items.length >= 4 ? '4' : '3'} gap-1.5`}>
                          {sec.data.items.map((item: any, i: number) => (
                            <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden text-center p-1.5 shadow-2xs">
                              <div className="h-14 bg-slate-200 rounded mb-1 overflow-hidden flex items-center justify-center text-slate-400 text-[8px]">
                                {item.img || item.imageUrl || sec.data?.imageUrl ? (
                                  <img
                                    src={item.img || item.imageUrl || sec.data?.imageUrl}
                                    alt={item.title || 'Image'}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  '🖼️ Ảnh'
                                )}
                              </div>
                              <h5 className="font-bold text-[8px] text-slate-800 line-clamp-1">{item.title || `Khối ${i + 1}`}</h5>
                              {item.desc && <p className="text-[7px] text-slate-500 line-clamp-1">{item.desc}</p>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden text-center p-2">
                          <div className="h-16 bg-slate-200 rounded mb-1.5 overflow-hidden flex items-center justify-center text-slate-400 text-[8px]">
                            {sec.data?.imageUrl ? (
                              <img
                                src={sec.data.imageUrl}
                                alt={sec.data.alt || 'Box'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              'Hình Ảnh Minh Họa'
                            )}
                          </div>
                          <h4 className="font-bold text-[9px] text-slate-800">{sec.title || 'Tiêu Đề Image Box'}</h4>
                          <p className="text-[7px] text-slate-500 line-clamp-1">{sec.subtitle || 'Mô tả chi tiết nội dung'}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SERVICES */}
                  {sec.type === 'services' && (
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs text-center mb-1">
                        {sec.title || 'Dịch Vụ Nổi Bật'}
                      </h4>
                      <div className="grid grid-cols-3 gap-1.5 mt-2">
                        {['Tư Vấn', 'Triển Khai', 'Tối Ưu'].map((item, i) => (
                          <div key={i} className="bg-slate-50 border border-slate-100 p-1.5 rounded text-center">
                            <div
                              style={{ backgroundColor: themeConfig.colorSecondary }}
                              className="w-4 h-4 rounded-full mx-auto mb-1 text-white flex items-center justify-center text-[8px]"
                            >
                              ✓
                            </div>
                            <div className="font-semibold text-[9px] text-slate-800">{item}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ABOUT */}
                  {sec.type === 'about' && (
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div className="w-12 h-10 bg-slate-200 rounded flex items-center justify-center text-slate-400 text-[8px]">
                        Hình ảnh
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-[10px] text-slate-900">{sec.title || 'Về Chúng Tôi'}</div>
                        <div className="text-[9px] text-slate-500 line-clamp-1">{sec.subtitle || 'Uy tín hơn 10 năm'}</div>
                      </div>
                    </div>
                  )}

                  {/* NUMBERS */}
                  {sec.type === 'numbers' && (
                    <div className="grid grid-cols-4 gap-1 text-center py-1">
                      <div>
                        <div className="font-bold text-blue-600 text-xs">500+</div>
                        <div className="text-[8px] text-slate-400">Dự Án</div>
                      </div>
                      <div>
                        <div className="font-bold text-blue-600 text-xs">98%</div>
                        <div className="text-[8px] text-slate-400">Hài Lòng</div>
                      </div>
                      <div>
                        <div className="font-bold text-blue-600 text-xs">10+</div>
                        <div className="text-[8px] text-slate-400">Năm KN</div>
                      </div>
                      <div>
                        <div className="font-bold text-blue-600 text-xs">24/7</div>
                        <div className="text-[8px] text-slate-400">Hỗ Trợ</div>
                      </div>
                    </div>
                  )}

                  {/* FAQ */}
                  {sec.type === 'faq' && (
                    <div className="space-y-1">
                      <div className="font-bold text-slate-900 text-xs text-center mb-1">
                        {sec.title || 'Câu Hỏi Thường Gặp (FAQ)'}
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded border border-slate-100 flex justify-between items-center text-[9px]">
                        <span>Thời gian triển khai bao lâu?</span>
                        <span className="text-slate-400">+</span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded border border-slate-100 flex justify-between items-center text-[9px]">
                        <span>Chính sách bảo hành và hỗ trợ?</span>
                        <span className="text-slate-400">+</span>
                      </div>
                    </div>
                  )}

                  {/* BLOG */}
                  {sec.type === 'blog' && (
                    <div>
                      <div className="font-bold text-slate-900 text-xs text-center mb-1.5">
                        {sec.title || 'Bài Viết Mới Nhất'}
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {[1, 2, 3].map((b) => (
                          <div key={b} className="bg-slate-50 border border-slate-100 rounded overflow-hidden">
                            <div className="h-6 bg-slate-200"></div>
                            <div className="p-1 text-[8px] font-medium text-slate-700 truncate">Bài viết #{b}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  {sec.type === 'cta' && (
                    <div
                      style={{ backgroundColor: themeConfig.colorPrimary }}
                      className="p-2.5 rounded-lg text-white text-center shadow-2xs"
                    >
                      <div className="font-bold text-[10px]">{sec.title || 'Sẵn Sàng Hợp Tác?'}</div>
                      <button className="mt-1 bg-white text-slate-900 text-[8px] font-bold px-2 py-0.5 rounded shadow-2xs">
                        {sec.buttonText || 'Gọi Hotline'}
                      </button>
                    </div>
                  )}

                  {/* TEXT BLOCK */}
                  {sec.type === 'text_block' && (() => {
                    const data = sec.data || {};
                    const boxEnabled = Boolean(data.boxEnabled);
                    const isLight = data.boxTextColor === 'light' || data.boxTextColor === 'gold' || sec.textColor === 'light';
                    const isGoldTitle = data.boxTextColor === 'gold';

                    const boxBorderW = data.boxBorderWidth !== undefined ? Number(data.boxBorderWidth) : 1;
                    const boxBorderColor = data.boxBorderColor || '#f59e0b';
                    const boxBorderStyle = data.boxBorderStyle || 'solid';
                    const boxRadius = data.boxRadius !== undefined ? Number(data.boxRadius) : 12;

                    let shadowCss: string | undefined = undefined;
                    if (data.boxShadow === 'subtle') shadowCss = '0 2px 8px rgba(0,0,0,0.08)';
                    else if (data.boxShadow === 'medium') shadowCss = '0 6px 18px rgba(0,0,0,0.2)';
                    else if (data.boxShadow === 'deep') shadowCss = '0 12px 28px rgba(0,0,0,0.35)';
                    else if (data.boxShadow === 'glow-gold') shadowCss = '0 0 15px rgba(245, 158, 11, 0.4), 0 4px 15px rgba(0,0,0,0.3)';
                    else if (data.boxShadow === 'glow-primary') shadowCss = '0 0 15px rgba(37, 99, 235, 0.4), 0 4px 15px rgba(0,0,0,0.3)';
                    else if (data.boxShadow === 'glow-cyan') shadowCss = '0 0 15px rgba(6, 182, 212, 0.4), 0 4px 15px rgba(0,0,0,0.3)';

                    const boxStyle: React.CSSProperties = boxEnabled ? {
                      backgroundColor: data.boxBgColor || 'rgba(15, 23, 42, 0.85)',
                      border: boxBorderW > 0 ? `${boxBorderW}px ${boxBorderStyle} ${boxBorderColor}` : 'none',
                      borderRadius: `${boxRadius}px`,
                      padding: data.boxPadding || '16px 20px',
                      boxShadow: shadowCss,
                      backdropFilter: data.boxBackdropBlur ? 'blur(8px)' : undefined,
                      WebkitBackdropFilter: data.boxBackdropBlur ? 'blur(8px)' : undefined,
                      color: isLight ? '#f1f5f9' : '#1e293b',
                      maxWidth: data.boxMaxWidth && data.boxMaxWidth !== '100%' ? data.boxMaxWidth : '100%',
                      margin: '0 auto',
                    } : {
                      color: isLight ? '#f1f5f9' : '#1e293b',
                    };

                    const titleColor = isGoldTitle ? '#fbbf24' : (isLight ? '#ffffff' : '#0f172a');
                    const contentTextColor = isLight ? '#f1f5f9' : '#334155';

                    return (
                      <div className="p-3 text-left">
                        <div style={boxStyle} className="transition-all duration-200">
                          {sec.title && (
                            <h4
                              style={{ color: titleColor }}
                              className="font-bold text-xs mb-1.5"
                            >
                              {sec.title}
                            </h4>
                          )}
                          <div
                            style={{ color: contentTextColor }}
                            className="text-[9px] leading-relaxed max-h-48 overflow-y-auto prose prose-xs"
                            dangerouslySetInnerHTML={{
                              __html: sec.content || sec.subtitle || '<p>Đoạn văn giới thiệu nội dung chuẩn SEO biên soạn chuyên sâu.</p>',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })()}

                  {/* TITLE DIVIDER */}
                  {sec.type === 'title_divider' && (
                    <div className="text-center py-1">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-[1px] bg-slate-300 w-8"></div>
                        <h4 className="font-bold text-slate-900 text-xs">{sec.title || 'Tiêu Đề Ngăn Cách'}</h4>
                        <div className="h-[1px] bg-slate-300 w-8"></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mock Footer UX Block */}
          {(() => {
            const renderFooterBrand = (customClass = 'font-bold text-white mb-0.5 truncate', defaultText = 'Thương Hiệu') => {
              if (footerConfig.logoUrl) {
                return (
                  <div className="mb-1">
                    <img
                      src={footerConfig.logoUrl}
                      alt={footerConfig.brandName || 'Logo'}
                      style={{ maxWidth: `${footerConfig.logoWidth ? Math.min(footerConfig.logoWidth * 0.55, 110) : 85}px`, maxHeight: '32px' }}
                      className="object-contain"
                    />
                  </div>
                );
              }
              return <div className={customClass}>{footerConfig.brandName || defaultText}</div>;
            };

            const renderCenterBrand = () => {
              if (footerConfig.logoUrl) {
                return (
                  <div className="mb-1.5 flex justify-center">
                    <img
                      src={footerConfig.logoUrl}
                      alt={footerConfig.brandName || 'Logo'}
                      style={{ maxWidth: `${footerConfig.logoWidth ? Math.min(footerConfig.logoWidth * 0.6, 130) : 95}px`, maxHeight: '36px' }}
                      className="object-contain"
                    />
                  </div>
                );
              }
              return <div className="font-extrabold text-white text-[11px] mb-1">{footerConfig.brandName || 'BRAND NAME'}</div>;
            };

            const renderCol4Extra = () => (
              <>
                {footerConfig.col4WorkingHours && (
                  <div className="truncate text-amber-300/80">⏰ {footerConfig.col4WorkingHours}</div>
                )}
                {footerConfig.col4ExtraInfo && (
                  <div className="truncate text-slate-400">📌 {footerConfig.col4ExtraInfo}</div>
                )}
                {footerConfig.col4Links && footerConfig.col4Links.length > 0 && (
                  footerConfig.col4Links.map((l, i) => {
                    const text = (l.text || '').trim();
                    if (!text) return null;
                    if (text.includes(':')) {
                      const colonIdx = text.indexOf(':');
                      const label = text.substring(0, colonIdx).trim();
                      const val = text.substring(colonIdx + 1).trim();
                      return (
                        <div key={i} className="truncate text-slate-300">
                          <strong className="text-white font-semibold">{label}:</strong>{' '}
                          <span className="text-amber-400 underline">{val}</span>
                        </div>
                      );
                    }
                    return (
                      <div key={i} className="truncate text-amber-400 underline">
                        🔗 {text}
                      </div>
                    );
                  })
                )}
                {footerConfig.col4LinkText && (
                  <div className="mt-1">
                    <span className="inline-block bg-amber-500 text-black font-bold px-1.5 py-0.5 rounded-full text-[6.5px] truncate max-w-full">
                      💬 {footerConfig.col4LinkText}
                    </span>
                  </div>
                )}
              </>
            );

            const getFooterBgStyle = (): React.CSSProperties => {
              const bgType = footerConfig.bgType || (footerConfig.bgImage ? 'image' : footerConfig.bgGradient ? 'gradient' : 'solid');
              if (bgType === 'image' && footerConfig.bgImage) {
                const overlay = footerConfig.bgOverlay || 'rgba(0, 0, 0, 0.72)';
                return {
                  backgroundImage: `linear-gradient(${overlay}, ${overlay}), url('${footerConfig.bgImage}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                };
              }
              if (bgType === 'gradient' && footerConfig.bgGradient) {
                return {
                  background: footerConfig.bgGradient,
                };
              }
              return { backgroundColor: footerConfig.bgColor || '#0b0f19' };
            };

            return (
              <div
                style={getFooterBgStyle()}
                className="text-slate-300 p-3 text-[9px] relative overflow-hidden transition-all"
              >
                {/* 1. MẪU CASINO & GAMING VIP */}
                {footerConfig.layout === 'casino-luxury' && (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                      <div>
                        {renderFooterBrand('font-extrabold text-amber-400 mb-0.5 truncate', 'CASINO VIP')}
                        <div
                          className="text-slate-400 text-[8px] line-clamp-6 leading-tight whitespace-normal break-words"
                          dangerouslySetInnerHTML={{
                            __html: formatRichText(footerConfig.bio || 'Sòng bài trực tuyến uy tín & an toàn hàng đầu.', '#fbbf24')
                          }}
                        />
                        <div className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/40 rounded px-1.5 py-0.5 mt-1.5">
                          <span className="bg-amber-500 text-black font-extrabold text-[7px] px-1 rounded-sm">18+</span>
                          <span className="text-amber-300 text-[7px] font-bold">{footerConfig.badgeText || 'Juego Responsable'}</span>
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-white mb-0.5 truncate border-b border-amber-500/40 pb-0.5">{footerConfig.col2Title || 'Acerca de'}</div>
                        <div className="text-slate-400 text-[7.5px] space-y-0.5 mt-1">
                          {(footerConfig.col2Links || [{ text: 'Quiénes Somos', url: '#' }, { text: 'Privacidad', url: '#' }]).slice(0, 4).map((l, i) => (
                            <div key={i} className="truncate text-slate-300">• {l.text}</div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-white mb-0.5 truncate border-b border-amber-500/40 pb-0.5">{footerConfig.col3Title || 'Juegos'}</div>
                        <div className="text-slate-400 text-[7.5px] space-y-0.5 mt-1">
                          {(footerConfig.col3Links || [{ text: 'Casino en Vivo', url: '#' }, { text: 'Lotería', url: '#' }]).slice(0, 4).map((l, i) => (
                            <div key={i} className="truncate text-slate-300">• {l.text}</div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-white mb-0.5 truncate border-b border-amber-500/40 pb-0.5">{footerConfig.col4Title || 'Contacto'}</div>
                        <div className="text-slate-400 text-[7.5px] space-y-0.5 mt-1">
                          <div className="truncate">📞 {footerConfig.hotline || '+52 55 1234 5678'}</div>
                          <div className="truncate">✉️ {footerConfig.email || 'soporte@juegalotto.mx'}</div>
                          {renderCol4Extra()}
                        </div>
                        <div className="bg-white/5 border border-amber-500/30 rounded p-1 mt-1 text-[7px] text-slate-400">
                          🔒 SSL 256-Bit • PAGCOR & Curaçao
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-slate-800 pt-1 text-center text-slate-500 text-[7.5px]">
                      {footerConfig.disclaimerText || '18+ Chơi có trách nhiệm | Giấy phép quốc tế'} | {footerConfig.copyrightText || themeConfig.copyrightText || '© 2026 Bản quyền thuộc về Casino.'}
                    </div>
                  </>
                )}

                {/* 2. MẪU BÁO CHÍ & TẠP CHÍ 3 CỘT (5-3-4) */}
                {footerConfig.layout === 'magazine-3col' && (
                  <>
                    <div className="grid grid-cols-12 gap-2 mb-2">
                      <div className="col-span-5">
                        {renderFooterBrand('font-bold text-white mb-0.5 truncate', 'TẠP CHÍ TIN TỨC')}
                        <div
                          className="text-slate-400 text-[8px] line-clamp-6 leading-tight whitespace-normal break-words"
                          dangerouslySetInnerHTML={{
                            __html: formatRichText(footerConfig.bio || 'Cổng thông tin chuyên đề cập nhật tin tức phân tích nhanh và chuẩn xác.', '#38bdf8')
                          }}
                        />
                        <div className="bg-white/5 border-l-2 border-blue-500 p-1 rounded-r mt-1 text-[7px] text-slate-400">
                          {footerConfig.disclaimerText || 'Giấy phép báo chí / Bản quyền nội dung chuyên sâu.'}
                        </div>
                      </div>
                      <div className="col-span-3">
                        <div className="font-bold text-white mb-0.5 truncate">{footerConfig.col2Title || 'Chuyên Mục'}</div>
                        <div className="text-slate-400 text-[7.5px] space-y-0.5">
                          {(footerConfig.col2Links || [{ text: 'Tin Nổi Bật', url: '#' }, { text: 'Kinh Tế', url: '#' }]).slice(0, 4).map((l, i) => (
                            <div key={i} className="truncate text-slate-300">• {l.text}</div>
                          ))}
                        </div>
                      </div>
                      <div className="col-span-4">
                        <div className="font-bold text-white mb-0.5 truncate">{footerConfig.col4Title || 'Tòa Soạn & Liên Hệ'}</div>
                        <div className="text-slate-400 text-[7.5px] space-y-0.5">
                          <div className="truncate">📞 {footerConfig.hotline || '0988.xxx.xxx'}</div>
                          <div className="truncate">✉️ {footerConfig.email || 'toasoan@domain.com'}</div>
                          <div className="truncate">📍 {footerConfig.address || 'Hà Nội, VN'}</div>
                          {renderCol4Extra()}
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-slate-800 pt-1 text-center text-slate-500 text-[7.5px]">
                      {footerConfig.copyrightText || themeConfig.copyrightText || '© 2026 Mọi quyền được bảo lưu.'}
                    </div>
                  </>
                )}

                {/* 3. MẪU TỐI GIẢN CĂN GIỮA (Minimalist Centered) */}
                {footerConfig.layout === 'minimal-center' && (
                  <div className="text-center py-1">
                    {renderCenterBrand()}
                    <div
                      className="text-slate-400 text-[8px] max-w-sm mx-auto mb-1.5 leading-tight whitespace-normal break-words"
                      dangerouslySetInnerHTML={{
                        __html: formatRichText(footerConfig.bio || 'Đơn vị sáng tạo và cung cấp giải pháp chuyển đổi số toàn diện.', '#fbbf24')
                      }}
                    />
                    <div className="flex justify-center items-center gap-2 text-[7.5px] text-slate-300 mb-1.5 flex-wrap">
                      {[...(footerConfig.col2Links || []), ...(footerConfig.col3Links || [])].slice(0, 6).map((l, i) => (
                        <span key={i} className="hover:text-white transition">{l.text}</span>
                      ))}
                    </div>
                    <div className="text-[7.5px] text-slate-400 mb-1">
                      📞 {footerConfig.hotline || '0988.xxx.xxx'} • ✉️ {footerConfig.email || 'lienhe@domain.com'} • 📍 {footerConfig.address || 'Hà Nội, VN'}
                      {footerConfig.col4WorkingHours ? ` • ⏰ ${footerConfig.col4WorkingHours}` : ''}
                    </div>
                    {footerConfig.col4LinkText && (
                      <div className="mb-1.5">
                        <span className="inline-block bg-amber-500 text-black font-bold px-2 py-0.5 rounded-full text-[7px]">
                          💬 {footerConfig.col4LinkText}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-slate-800 pt-1 text-slate-500 text-[7.5px]">
                      {footerConfig.copyrightText || themeConfig.copyrightText || '© 2026 Bản quyền thuộc về Website.'}
                    </div>
                  </div>
                )}

                {/* 4. MẪU THƯƠNG MẠI & DỊCH VỤ (Ecommerce Modern) */}
                {footerConfig.layout === 'ecommerce-modern' && (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                      <div>
                        {renderFooterBrand('font-bold text-white mb-0.5 truncate', 'Thương Mại')}
                        <div
                          className="text-slate-400 text-[8px] line-clamp-6 leading-tight whitespace-normal break-words"
                          dangerouslySetInnerHTML={{
                            __html: formatRichText(footerConfig.bio || 'Hệ thống mua sắm và cung cấp sản phẩm chính hãng.', '#10b981')
                          }}
                        />
                        <span className="inline-block mt-1 text-[7px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1 py-0.5 rounded">
                          ✓ Cam kết chính hãng
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-white mb-0.5 truncate">{footerConfig.col2Title || 'Chăm Sóc Khách Hàng'}</div>
                        <div className="text-slate-400 text-[7.5px] space-y-0.5">
                          {(footerConfig.col2Links || [{ text: 'Hướng dẫn mua hàng', url: '#' }, { text: 'Chính sách bảo hành', url: '#' }]).slice(0, 4).map((l, i) => (
                            <div key={i} className="truncate text-slate-300">• {l.text}</div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-white mb-0.5 truncate">{footerConfig.col3Title || 'Sản Phẩm & Dịch Vụ'}</div>
                        <div className="text-slate-400 text-[7.5px] space-y-0.5">
                          {(footerConfig.col3Links || [{ text: 'Sản phẩm mới', url: '#' }, { text: 'Khuyến mãi hot', url: '#' }]).slice(0, 4).map((l, i) => (
                            <div key={i} className="truncate text-slate-300">• {l.text}</div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-white mb-0.5 truncate">{footerConfig.col4Title || 'Tổng Đài Mua Hàng'}</div>
                        <div className="text-slate-400 text-[7.5px] space-y-0.5">
                          <div className="truncate">📞 {footerConfig.hotline || '0988.xxx.xxx'}</div>
                          <div className="truncate">✉️ {footerConfig.email || 'lienhe@domain.com'}</div>
                          {renderCol4Extra()}
                        </div>
                        <div className="bg-white/5 rounded p-1 mt-1 text-[7px] text-slate-400">
                          💳 Visa / Master • 🏦 Chuyển khoản • 🪙 USDT
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-slate-800 pt-1 text-center text-slate-500 text-[8px]">
                      {footerConfig.copyrightText || themeConfig.copyrightText || '© 2026 Bản quyền thuộc về Website.'}
                    </div>
                  </>
                )}

                {/* 5. MẪU TIN TỨC / AFFILIATE 2 CỘT */}
                {footerConfig.layout === 'affiliate-2col' && (
                  <>
                    <div className="grid grid-cols-12 gap-2 mb-2">
                      <div className="col-span-7">
                        {renderFooterBrand('font-bold text-white mb-0.5 truncate', 'Thương Hiệu')}
                        <div
                          className="text-slate-400 text-[8px] line-clamp-6 leading-tight mb-1 whitespace-normal break-words"
                          dangerouslySetInnerHTML={{
                            __html: formatRichText(footerConfig.bio || 'Kênh tin tức tổng hợp đánh giá và chia sẻ thông tin uy tín.', '#f59e0b')
                          }}
                        />
                        <div className="text-[7.5px] italic text-slate-500">
                          {footerConfig.disclaimerText || 'Miễn trừ trách nhiệm: Thông tin mang tính tham khảo.'}
                        </div>
                      </div>
                      <div className="col-span-5">
                        <div className="font-bold text-white mb-0.5 truncate">{footerConfig.col4Title || 'Thông Tin Liên Hệ'}</div>
                        <div className="text-slate-400 text-[7.5px] space-y-0.5">
                          <div className="truncate">📞 {footerConfig.hotline || '0988.xxx.xxx'}</div>
                          <div className="truncate">✉️ {footerConfig.email || 'lienhe@domain.com'}</div>
                          <div className="truncate">📍 {footerConfig.address || 'Hà Nội, VN'}</div>
                          {renderCol4Extra()}
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-slate-800 pt-1 text-center text-slate-500 text-[8px]">
                      {footerConfig.copyrightText || themeConfig.copyrightText || '© 2026 Bản quyền thuộc về Website.'}
                    </div>
                  </>
                )}

                {/* 6. MẪU DOANH NGHIỆP 4 CỘT TIÊU CHUẨN (Corporate 4-col) */}
                {(!footerConfig.layout || footerConfig.layout === 'corporate-4col') && (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                      <div>
                        {renderFooterBrand('font-bold text-white mb-0.5 truncate', 'Thương Hiệu')}
                        <div
                          className="text-slate-400 text-[8px] line-clamp-6 leading-tight whitespace-normal break-words"
                          dangerouslySetInnerHTML={{
                            __html: formatRichText(footerConfig.bio || 'Đơn vị uy tín chuyên cung cấp các giải pháp chất lượng cao.', '#3b82f6')
                          }}
                        />
                      </div>
                      <div>
                        <div className="font-bold text-white mb-0.5 truncate">{footerConfig.col2Title || 'Về Chúng Tôi'}</div>
                        <div className="text-slate-400 text-[7.5px] space-y-0.5">
                          {(footerConfig.col2Links || [
                            { text: 'Giới thiệu công ty', url: '#' },
                            { text: 'Chính sách bảo mật', url: '#' },
                            { text: 'Điều khoản sử dụng', url: '#' },
                          ]).slice(0, 4).map((l, i) => (
                            <div key={i} className="truncate text-slate-300">• {l.text}</div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-white mb-0.5 truncate">{footerConfig.col3Title || 'Dịch Vụ Chính'}</div>
                        <div className="text-slate-400 text-[7.5px] space-y-0.5">
                          {(footerConfig.col3Links || [
                            { text: 'Tư vấn chiến lược', url: '#' },
                            { text: 'Giải pháp trọn gói', url: '#' },
                            { text: 'Tối ưu hóa chuyển đổi', url: '#' },
                          ]).slice(0, 4).map((l, i) => (
                            <div key={i} className="truncate text-slate-300">• {l.text}</div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-white mb-0.5 truncate">{footerConfig.col4Title || 'Liên Hệ Nhanh'}</div>
                        <div className="text-slate-400 text-[7.5px] space-y-0.5">
                          <div className="truncate">📞 {footerConfig.hotline || '0988.xxx.xxx'}</div>
                          <div className="truncate">✉️ {footerConfig.email || 'lienhe@domain.com'}</div>
                          <div className="truncate">📍 {footerConfig.address || 'Hà Nội, VN'}</div>
                          {renderCol4Extra()}
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-slate-800 pt-1 text-center text-slate-500 text-[8px]">
                      {footerConfig.copyrightText || themeConfig.copyrightText || '© 2026 Bản quyền thuộc về Website.'}
                    </div>
                  </>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
