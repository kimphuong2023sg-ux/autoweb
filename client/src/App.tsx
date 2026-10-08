import React, { useState, useEffect } from 'react';
import { Topbar } from './components/Topbar';
import { StepNavigation } from './components/StepNavigation';
import { LivePreview } from './components/LivePreview';
import { SiteConnectModal } from './components/SiteConnectModal';
import { DeployModal } from './components/DeployModal';
import { Step1CleanSlate } from './components/steps/Step1CleanSlate';
import { Step2ThemeCustomizer } from './components/steps/Step2ThemeCustomizer';
import { Step3HomepageBuilder } from './components/steps/Step3HomepageBuilder';
import { Step4FooterPicker } from './components/steps/Step4FooterPicker';
import { Step5BulkContentCreator } from './components/steps/Step5BulkContentCreator';
import { StepMenuManager } from './components/steps/StepMenuManager';
import { ConnectedSite, WpInspectData, ThemeConfig, FooterConfig, SectionItem, SeoEssentialsConfig, MenuItem, MenuStylingConfig } from './types';
import { api } from './services/api';
import { Globe, Plus, AlertTriangle, CheckCircle2, XCircle, Download, RefreshCw, X, UploadCloud, Zap, Loader2, Sparkles } from 'lucide-react';

const STORAGE_KEY_SITES = 'flatsome_seo_saved_sites';
const STORAGE_KEY_ACTIVE = 'flatsome_seo_active_site';

export const App: React.FC = () => {
  // Sites State
  const [savedSites, setSavedSites] = useState<ConnectedSite[]>([]);
  const [currentSite, setCurrentSite] = useState<ConnectedSite | null>(null);
  const [inspectData, setInspectData] = useState<WpInspectData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Toast notification
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<ConnectedSite | null>(null);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isAutoInstallingPlugin, setIsAutoInstallingPlugin] = useState(false);
  const [isPushingCode, setIsPushingCode] = useState(false);

  // Active Step (1 - 5)
  const [currentStep, setCurrentStep] = useState(1);

  // Configuration States
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>({
    nicheId: 'real-estate',
    colorPrimary: '#0f3a61',
    colorSecondary: '#d4af37',
    topbarText: 'Hotline: 0988.xxx.xxx - Tư vấn giải pháp SEO & Website 24/7',
    headerLayout: 'wide-nav',
    copyrightText: '© 2026 Bản quyền thuộc về Doanh Nghiệp. Thiết kế chuẩn SEO.',
    siteWidth: '1200px',
    fontHeading: 'Inter',
    fontBody: 'Plus Jakarta Sans',
    defaultPageTemplate: 'default',
    siteLayout: 'full-width',

    // Header Options
    headerPreset: 'header-wide-nav-dark',
    headerHeight: 90,
    headerBg: '#ffffff',
    headerColor: 'light',
    headerWidth: 'container',

    headerBottomShow: true,
    headerBottomHeight: 45,
    headerBottomBg: '#0f3a61',
    headerBottomColor: 'dark',
    headerBottomWidth: 'full-width',
    headerNavNoWrap: true,

    headerSticky: true,
    headerStickyBottom: true,
    headerStickyHeight: 70,
    headerStickyStyle: 'jump',
    headerStickyHideOnScroll: false,

    headerButton1Show: true,
    headerButton1Text: 'REGÍSTRATE',
    headerButton1Link: '#register',
    headerButton1Target: '_self',
    headerButton1Color: 'alert',
    headerButton1Style: 'is-flat',
    headerButton1Radius: '99px',

    headerButton2Show: true,
    headerButton2Text: 'ENTRAR',
    headerButton2Link: '#login',
    headerButton2Target: '_self',
    headerButton2Color: 'alert',
    headerButton2Style: 'is-flat',
    headerButton2Radius: '99px',

    headerShowSearch: 'icon',
    headerShowCart: false,
    headerShowAccount: false,
    headerShowContact: false,
    headerContactText: '',
  });

  const [footerConfig, setFooterConfig] = useState<FooterConfig>({
    layout: 'corporate-4col',
    brandName: 'Doanh Nghiệp Uy Tín',
    bio: 'Đơn vị uy tín chuyên cung cấp các giải pháp chất lượng cao, phục vụ khách hàng trên toàn quốc với sự tận tâm và cam kết bảo hành dài hạn.',
    hotline: '0988.xxx.xxx',
    email: 'lienhe@domain.com',
    address: 'Hà Nội, Việt Nam',
    bgColor: '#1e293b',
  });

  const [sections, setSections] = useState<SectionItem[]>([
    {
      id: 'hero-1',
      type: 'hero',
      title: 'Giải Pháp Đột Phá Cho Doanh Nghiệp Bạn',
      subtitle: 'Tối ưu hóa hiệu suất, nâng tầm thương hiệu với quy trình chuyên nghiệp và chuẩn SEO hàng đầu.',
      buttonText: 'Nhận Tư Vấn Ngay',
      buttonLink: '#contact',
      bgColor: '#f8fafc',
    },
    {
      id: 'services-1',
      type: 'services',
      title: 'Dịch Vụ Nổi Bật',
      subtitle: 'Các giải pháp toàn diện giúp doanh nghiệp bứt phá doanh số',
    },
    {
      id: 'about-1',
      type: 'about',
      title: 'Hơn 10 Năm Khẳng Định Uy Tín',
      subtitle: 'Đồng hành cùng sự phát triển bền vững của khách hàng',
    },
    {
      id: 'numbers-1',
      type: 'numbers',
      title: 'Những Con Số Ấn Tượng',
    },
    {
      id: 'faq-1',
      type: 'faq',
      title: 'Câu Hỏi Thường Gặp (FAQ)',
    },
    {
      id: 'cta-1',
      type: 'cta',
      title: 'Sẵn Sàng Nâng Tầm Dự Án Của Bạn?',
      subtitle: 'Liên hệ ngay hôm nay để nhận ưu đãi và tư vấn miễn phí từ chuyên gia!',
      buttonText: 'Gọi Hotline Ngay',
      buttonLink: 'tel:0988000000',
    },
  ]);

  const [essentials, setEssentials] = useState<SeoEssentialsConfig>({
    brandName: 'Doanh Nghiệp Uy Tín',
    hotline: '0988.xxx.xxx',
    email: 'lienhe@domain.com',
    address: 'Hà Nội, Việt Nam',
    createPages: true,
    createMenu: true,
    setPermalinks: true,
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuStyling, setMenuStyling] = useState<MenuStylingConfig>({
    bgType: 'gradient',
    bgColor: '#1e293b',
    gradientColor1: '#1e3c72',
    gradientColor2: '#2a5298',
    gradientAngle: '135deg',
    textColor: '#ffffff',
    textHoverColor: '#fde047',
    itemHoverBg: 'rgba(255,255,255,0.12)',
    fontSize: '13px',
    fontWeight: '600',
    isUppercase: true,
    itemRadius: '6px',
    dropdownBg: '#1e293b',
    dropdownTextColor: '#f8fafc',
    dropdownHoverBg: 'rgba(255,255,255,0.08)',
    customCss: '',
    mobileDrawerTheme: 'dark',
    mobileBgColor: '#0f172a',
    mobileTextColor: '#f8fafc',
    mobileTextHoverColor: '#38bdf8',
    mobileHoverBg: 'rgba(255, 255, 255, 0.08)',
    mobileDividerColor: 'rgba(255, 255, 255, 0.08)',
    mobileSubmenuBg: '#1e293b',
    mobileSubmenuTextColor: '#94a3b8',
    mobileFontSize: '14px',
    mobileShowSearch: false,
    mobileShowSocial: false,
    mobileHideWooNotice: true,
    mobileShowNewsletter: false,
    cleanMobileNavOnly: false,
    mobileIconColor: '#ffffff',
    mobileIconHoverColor: '#38bdf8',
    mobileIconBgColor: 'transparent',
  });

  // Auto clear toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const getSiteStorageKey = (siteUrl: string) => {
    return `flatsome_site_state_${siteUrl.trim().toLowerCase().replace(/\/+$/, '')}`;
  };

  const loadLocalSiteState = (siteUrl: string) => {
    try {
      const saved = localStorage.getItem(getSiteStorageKey(siteUrl));
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.sections && Array.isArray(parsed.sections) && parsed.sections.length > 0) {
          setSections(parsed.sections);
        }
        if (parsed.themeConfig) setThemeConfig(parsed.themeConfig);
        if (parsed.footerConfig) setFooterConfig(parsed.footerConfig);
        if (parsed.essentials) setEssentials(parsed.essentials);
        if (parsed.menuItems && Array.isArray(parsed.menuItems) && parsed.menuItems.length > 0) {
          setMenuItems(parsed.menuItems);
        }
        if (parsed.menuStyling) setMenuStyling(parsed.menuStyling);
        if (typeof parsed.currentStep === 'number') setCurrentStep(Math.min(6, Math.max(1, parsed.currentStep)));
        return true;
      }
    } catch (e) {
      console.error('Error loading site state from localStorage', e);
    }
    return false;
  };

  // Auto-save active site state to localStorage
  useEffect(() => {
    if (!currentSite?.siteUrl) return;
    try {
      localStorage.setItem(
        getSiteStorageKey(currentSite.siteUrl),
        JSON.stringify({
          currentStep,
          sections,
          themeConfig,
          footerConfig,
          essentials,
          menuItems,
          menuStyling,
          lastUpdated: Date.now(),
        })
      );
    } catch (e) {
      console.error('Error saving site state to localStorage', e);
    }
  }, [currentSite?.siteUrl, currentStep, sections, themeConfig, footerConfig, essentials, menuItems, menuStyling]);

  // Load saved sites on mount
  useEffect(() => {
    try {
      const sitesJson = localStorage.getItem(STORAGE_KEY_SITES);
      if (sitesJson) {
        const parsed = JSON.parse(sitesJson);
        setSavedSites(parsed);
        const activeSiteUrl = localStorage.getItem(STORAGE_KEY_ACTIVE);
        const found = parsed.find((s: ConnectedSite) => s.siteUrl === activeSiteUrl);
        if (found) {
          handleSelectSite(found);
        } else if (parsed.length > 0) {
          handleSelectSite(parsed[0]);
        }
      }
    } catch (e) {
      console.error('Error loading saved sites from localStorage', e);
    }
  }, []);

  const handleSelectSite = async (site: ConnectedSite) => {
    setCurrentSite(site);
    localStorage.setItem(STORAGE_KEY_ACTIVE, site.siteUrl);
    // Instant restore from localStorage
    const restored = loadLocalSiteState(site.siteUrl);
    if (!restored) {
      setCurrentStep(1);
    }
    // Cloud sync from live WordPress
    await syncSiteData(site);
  };

  const handleConnectNewSite = async (site: ConnectedSite) => {
    // Attempt sync with throwOnError = true to catch bad credentials
    await syncSiteData(site, true);

    // If sync succeeded:
    let updated = savedSites.filter((s) => s.siteUrl !== site.siteUrl);
    if (editingSite && editingSite.siteUrl !== site.siteUrl) {
      updated = updated.filter((s) => s.siteUrl !== editingSite.siteUrl);
    }
    updated = [site, ...updated];

    setSavedSites(updated);
    localStorage.setItem(STORAGE_KEY_SITES, JSON.stringify(updated));
    setCurrentSite(site);
    localStorage.setItem(STORAGE_KEY_ACTIVE, site.siteUrl);
    setEditingSite(null);
    setToast({
      type: 'success',
      message: `Kết nối thành công tới ${site.siteUrl.replace(/^https?:\/\//, '')}!`,
    });
  };

  const handleDeleteSite = (siteUrl: string) => {
    const updated = savedSites.filter((s) => s.siteUrl !== siteUrl);
    setSavedSites(updated);
    localStorage.setItem(STORAGE_KEY_SITES, JSON.stringify(updated));
    if (currentSite?.siteUrl === siteUrl) {
      if (updated.length > 0) {
        handleSelectSite(updated[0]);
      } else {
        setCurrentSite(null);
        setInspectData(null);
        setConnectionError(null);
        localStorage.removeItem(STORAGE_KEY_ACTIVE);
      }
    }
    setToast({ type: 'success', message: 'Đã xóa website khỏi danh sách!' });
  };

  const syncSiteData = async (site: ConnectedSite, throwOnError = false) => {
    try {
      setIsLoading(true);
      setConnectionError(null);
      const data: WpInspectData = await api.syncSite(site);
      setInspectData(data);

      // Pre-fill theme configs if WordPress already has them
      if (data.site?.name) {
        setFooterConfig((prev) => ({ ...prev, brandName: data.site.name }));
        setEssentials((prev) => ({ ...prev, brandName: data.site.name }));
      }
      if (data.flatsome?.color_primary) {
        setThemeConfig((prev) => ({
          ...prev,
          colorPrimary: data.flatsome.color_primary,
          colorSecondary: data.flatsome.color_secondary || prev.colorSecondary,
          topbarText: data.flatsome.topbar_content || prev.topbarText,
          defaultPageTemplate: data.flatsome.default_page_template || prev.defaultPageTemplate || 'default',
          siteLayout: data.flatsome.layout || prev.siteLayout || 'full-width',
        }));
      }

      // Restore sections from WordPress if available
      if (data.homepage?.savedSections && data.homepage.savedSections.length > 0) {
        setSections(data.homepage.savedSections);
        setToast({
          type: 'success',
          message: `🎯 Đã quét WordPress! Khôi phục ${data.homepage.savedSections.length} khối Sections Trang Chủ từ website.`,
        });
      } else {
        setToast({
          type: 'success',
          message: `🎯 Đã kết nối và đồng bộ dữ liệu với ${site.siteUrl.replace(/^https?:\/\//, '')}!`,
        });
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Không thể kết nối đến website';
      console.warn('Sync failed:', errorMsg);
      setInspectData(null);
      setConnectionError(errorMsg);
      if (throwOnError) {
        throw err;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoInstallPlugin = async (siteToInstall?: ConnectedSite) => {
    const targetSite = siteToInstall || currentSite;
    if (!targetSite) return;

    if (!targetSite.username || !targetSite.password) {
      setToast({
        type: 'error',
        message: 'Cần có Tên đăng nhập & Mật khẩu WordPress (Admin) để tự động cài plugin!',
      });
      setEditingSite(targetSite);
      setIsConnectModalOpen(true);
      return;
    }

    try {
      setIsAutoInstallingPlugin(true);
      setToast({
        type: 'success',
        message: '🚀 Đang tải file ZIP lên WordPress, giải nén và kích hoạt...',
      });
      const res = await api.autoInstallPlugin(targetSite);
      setToast({
        type: 'success',
        message: res.message || 'Tự động cài đặt & kích hoạt plugin thành công 100%!',
      });

      let updated = savedSites.filter((s) => s.siteUrl !== targetSite.siteUrl);
      updated = [targetSite, ...updated];
      setSavedSites(updated);
      localStorage.setItem(STORAGE_KEY_SITES, JSON.stringify(updated));
      setCurrentSite(targetSite);
      localStorage.setItem(STORAGE_KEY_ACTIVE, targetSite.siteUrl);

      if (res.inspect) {
        setInspectData(res.inspect);
        setConnectionError(null);
      } else {
        await syncSiteData(targetSite);
      }
    } catch (err: any) {
      const msg = err.message || 'Lỗi khi tự động cài plugin lên WordPress';
      setToast({ type: 'error', message: msg });
      setConnectionError(msg);
      throw err;
    } finally {
      setIsAutoInstallingPlugin(false);
    }
  };

  const handlePushPluginCode = async (siteToPush?: ConnectedSite) => {
    const targetSite = siteToPush || currentSite;
    if (!targetSite) return;

    try {
      setIsPushingCode(true);
      setToast({
        type: 'success',
        message: '⚡ Đang đẩy code PHP mới nhất trực tiếp lên WordPress...',
      });
      const res = await api.pushPluginCode(targetSite);
      setToast({
        type: 'success',
        message: res.message || '⚡ Đã đẩy code mới trực tiếp lên WordPress thành công!',
      });
      await syncSiteData(targetSite);
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err.message || 'Lỗi khi đẩy code mới lên WordPress',
      });
    } finally {
      setIsPushingCode(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div
            className={`p-3.5 rounded-xl shadow-lg border flex items-center gap-3 text-xs font-semibold ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-700'
                : 'bg-red-600 text-white border-red-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="text-white/80 hover:text-white ml-2 p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Topbar */}
      <Topbar
        currentSite={currentSite}
        savedSites={savedSites}
        inspectData={inspectData}
        isLoading={isLoading}
        isAutoInstallingPlugin={isAutoInstallingPlugin}
        isPushingCode={isPushingCode}
        onSelectSite={handleSelectSite}
        onOpenConnectModal={() => {
          setEditingSite(null);
          setIsConnectModalOpen(true);
        }}
        onEditSite={(site) => {
          setEditingSite(site);
          setIsConnectModalOpen(true);
        }}
        onDeleteSite={handleDeleteSite}
        onSync={() => currentSite && syncSiteData(currentSite)}
        onOpenDeployModal={() => setIsDeployModalOpen(true)}
        onAutoInstallPlugin={() => currentSite && handleAutoInstallPlugin(currentSite)}
        onPushPluginCode={() => currentSite && handlePushPluginCode(currentSite)}
      />

      {/* Connected Site Status Bar */}
      {inspectData && currentSite && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-5 py-2 border-b border-indigo-900/50 flex items-center justify-between text-xs shrink-0 select-none shadow-inner">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-bold text-emerald-400 bg-emerald-400/15 border border-emerald-400/30 px-2 py-0.5 rounded-full text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Đã Kết Nối
            </span>
            <span className="text-slate-300">
              Website: <strong className="text-white">{currentSite.siteUrl.replace(/^https?:\/\//, '')}</strong>
            </span>
            {inspectData.homepage?.savedSections && inspectData.homepage.savedSections.length > 0 && (
              <span className="hidden md:inline text-slate-300">
                • Đang giữ <strong className="text-white">{inspectData.homepage.savedSections.length} khối Sections</strong> đã xuất bản
              </span>
            )}
            {inspectData.stats?.published_pages !== undefined && (
              <span className="hidden lg:inline text-slate-300">
                • <strong className="text-white">{inspectData.stats.published_pages}</strong> Trang & <strong className="text-white">{inspectData.stats.published_posts ?? 0}</strong> Bài viết
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => syncSiteData(currentSite)}
              disabled={isLoading}
              title="Đồng bộ lại toàn bộ dữ liệu website"
              className="text-slate-300 hover:text-white flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 transition cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} /> Đồng bộ lại web
            </button>
          </div>
        </div>
      )}

      {/* Main App Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Step Stepper Navigation */}
        <StepNavigation
          currentStep={currentStep}
          onSelectStep={setCurrentStep}
          inspectData={inspectData}
        />

        {/* Center Workspace Content */}
        <main className="flex-1 overflow-y-auto p-6 flex justify-center">
          {!currentSite ? (
            <div className="max-w-md my-auto text-center p-8 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Globe className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Chưa Có Website Nào Kết Nối</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Để bắt đầu quét dữ liệu, dọn dẹp demo và tự động dựng giao diện Flatsome UX Builder, vui lòng kết nối website WordPress của bạn.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingSite(null);
                  setIsConnectModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
              >
                <Plus className="w-4 h-4" /> Kết Nối Website WordPress Đầu Tiên
              </button>
            </div>
          ) : (
            <div className={`w-full ${currentStep === 4 ? 'max-w-6xl' : 'max-w-3xl'} space-y-4`}>
              {/* Prominent Connection Error Banner */}
              {connectionError && !inspectData && (
                <div className="bg-red-50/90 border border-red-200 text-red-900 p-5 rounded-2xl shadow-sm space-y-3">
                  <div className="flex items-start gap-3.5">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-red-950">
                          Chưa Thể Kết Nối Website ({currentSite.siteUrl.replace(/^https?:\/\//, '')})
                        </h4>
                        <span className="text-[11px] font-semibold bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full border border-red-200">
                          Cần Plugin Bridge
                        </span>
                      </div>
                      <p className="text-xs text-red-700 mt-1 leading-relaxed">
                        {connectionError}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-2.5">
                        <button
                          onClick={() => handleAutoInstallPlugin(currentSite)}
                          disabled={isAutoInstallingPlugin || isLoading}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {isAutoInstallingPlugin ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Đang Tải Lên & Kích Hoạt...</span>
                            </>
                          ) : (
                            <>
                              <UploadCloud className="w-4 h-4" />
                              <span>🚀 Tự Động Cài & Kích Hoạt Plugin Lên WP</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setEditingSite(currentSite);
                            setIsConnectModalOpen(true);
                          }}
                          className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition cursor-pointer"
                        >
                          Sửa Thông Tin Đăng Nhập
                        </button>

                        <a
                          href="/wp-bridge-plugin/flatsome-seo-bridge.zip"
                          download="flatsome-seo-bridge.zip"
                          className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition flex items-center gap-1.5"
                          title="Tải file ZIP nếu muốn cài thủ công trong WP Admin"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-500" /> Tải Zip Thủ Công
                        </a>

                        <button
                          onClick={() => syncSiteData(currentSite)}
                          disabled={isLoading}
                          className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1.5 ml-auto px-2 py-1.5 rounded-lg hover:bg-white/60 transition cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} /> Thử lại
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step Content */}
              {currentStep === 1 && (
                <Step1CleanSlate
                  currentSite={currentSite}
                  inspectData={inspectData}
                  onRefreshInspect={() => syncSiteData(currentSite)}
                  onNextStep={() => setCurrentStep(2)}
                />
              )}
              {currentStep === 2 && (
                <Step5BulkContentCreator
                  currentSite={currentSite}
                  onRefreshInspect={() => syncSiteData(currentSite)}
                  onNextStep={() => setCurrentStep(3)}
                  onPrevStep={() => setCurrentStep(1)}
                />
              )}
              {currentStep === 3 && (
                <Step2ThemeCustomizer
                  currentSite={currentSite}
                  themeConfig={themeConfig}
                  onChangeThemeConfig={setThemeConfig}
                  onNextStep={() => setCurrentStep(4)}
                  onPrevStep={() => setCurrentStep(2)}
                />
              )}
              {currentStep === 4 && (
                <StepMenuManager
                  currentSite={currentSite}
                  onRefreshInspect={() => syncSiteData(currentSite)}
                  onNextStep={() => setCurrentStep(5)}
                  onPrevStep={() => setCurrentStep(3)}
                  onMenuChange={setMenuItems}
                  onStylingChange={setMenuStyling}
                />
              )}
              {currentStep === 5 && (
                <Step3HomepageBuilder
                  currentSite={currentSite}
                  sections={sections}
                  onChangeSections={setSections}
                  onNextStep={() => setCurrentStep(6)}
                  onPrevStep={() => setCurrentStep(4)}
                />
              )}
              {currentStep === 6 && (
                <Step4FooterPicker
                  footerConfig={footerConfig}
                  onChangeFooterConfig={setFooterConfig}
                  onNextStep={() => setIsDeployModalOpen(true)}
                  onPrevStep={() => setCurrentStep(5)}
                />
              )}
            </div>
          )}
        </main>

        {/* Right Live Preview Mockup */}
        <LivePreview
          themeConfig={themeConfig}
          footerConfig={footerConfig}
          sections={sections}
          menuItems={menuItems}
          menuStyling={menuStyling}
        />
      </div>

      {/* Modals */}
      <SiteConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => {
          setIsConnectModalOpen(false);
          setEditingSite(null);
        }}
        editingSite={editingSite}
        onConnect={handleConnectNewSite}
        onAutoInstall={handleAutoInstallPlugin}
        onDeleteSite={handleDeleteSite}
      />

      {currentSite && (
        <DeployModal
          isOpen={isDeployModalOpen}
          onClose={() => setIsDeployModalOpen(false)}
          currentSite={currentSite}
          inspectData={inspectData}
          themeConfig={themeConfig}
          footerConfig={footerConfig}
          sections={sections}
          essentials={essentials}
          onDeploySuccess={() => syncSiteData(currentSite)}
        />
      )}
    </div>
  );
};

export default App;
