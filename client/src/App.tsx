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
import { StepSiteBackground } from './components/steps/StepSiteBackground';
import { StepSubpageStyling } from './components/steps/StepSubpageStyling';
import { ConnectedSite, WpInspectData, ThemeConfig, FooterConfig, SectionItem, SeoEssentialsConfig, MenuItem, MenuStylingConfig, SubpageStylingConfig, getInitialSubpageStyling } from './types';
import { api } from './services/api';
import { Globe, Plus, AlertTriangle, CheckCircle2, XCircle, Download, RefreshCw, X, UploadCloud, Zap, Loader2, Sparkles, RotateCcw } from 'lucide-react';
import { LoginPage } from './components/auth/LoginPage';
import { AdminPage } from './components/admin/AdminPage';
import { KickoutModal } from './components/auth/KickoutModal';
import { getToken, getUser, clearAuth, authFetch, AuthUser } from './utils/auth';

const STORAGE_KEY_SITES = 'flatsome_seo_saved_sites';
const STORAGE_KEY_ACTIVE = 'flatsome_seo_active_site';

// Clean Default Builders (Isolated per site)
export const getInitialThemeConfig = (siteName?: string, primaryColor = '#0f3a61', secondaryColor = '#d4af37'): ThemeConfig => ({
  nicheId: 'real-estate',
  colorPrimary: primaryColor,
  colorSecondary: secondaryColor,
  topbarText: '',
  headerLayout: 'wide-nav',
  copyrightText: `© ${new Date().getFullYear()} Bản quyền thuộc về ${siteName || 'Doanh Nghiệp'}. Thiết kế chuẩn SEO.`,
  siteWidth: '1200px',
  fontHeading: 'Inter',
  fontBody: 'Plus Jakarta Sans',
  defaultPageTemplate: 'full-width',
  siteLayout: 'full-width',

  // Header Options
  headerPreset: 'header-wide-nav-dark',
  headerHeight: 90,
  headerBg: '#161616',
  headerColor: 'dark',
  headerWidth: 'container',

  headerBottomShow: true,
  headerBottomHeight: 45,
  headerBottomBg: primaryColor,
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

  // Site-wide Background Options
  siteBgType: 'color',
  siteBgColor: '#ffffff',
  siteBgGradientColor1: '#0f172a',
  siteBgGradientColor2: '#1e293b',
  siteBgGradientAngle: 135,
  siteBgGradientType: 'linear',
  siteBgImage: '',
  siteBgImageId: 0,
  siteBgImageRepeat: 'no-repeat',
  siteBgImageSize: 'cover',
  siteBgImagePosition: 'center center',
  siteBgImageAttachment: 'fixed',
  siteBgOverlayColor: 'rgba(0, 0, 0, 0.45)',
  siteBgOverlayEnable: false,
});

export const getInitialFooterConfig = (brand = 'Website Chuẩn SEO'): FooterConfig => ({
  layout: 'corporate-4col',
  brandName: brand,
  logoType: 'text',
  logoUrl: '',
  logoWidth: 180,
  bio: 'Đơn vị uy tín chuyên cung cấp các giải pháp chất lượng cao, phục vụ khách hàng trên toàn quốc với sự tận tâm và cam kết bảo hành dài hạn.',
  hotline: '0988.xxx.xxx',
  email: 'lienhe@domain.com',
  address: 'Hà Nội, Việt Nam',
  bgColor: '#0b0f19',
  col2Title: 'Về Chúng Tôi',
  col2Links: [
    { text: 'Giới thiệu công ty', url: '/gioi-thieu/' },
    { text: 'Chính sách bảo mật', url: '/chinh-sach-bao-mat/' },
    { text: 'Điều khoản sử dụng', url: '/dieu-khoan-su-dung/' },
    { text: 'Liên hệ hợp tác', url: '/lien-he/' },
  ],
  col3Title: 'Dịch Vụ Chính',
  col3Links: [
    { text: 'Tư vấn chiến lược', url: '#' },
    { text: 'Giải pháp trọn gói', url: '#' },
    { text: 'Tối ưu hóa chuyển đổi', url: '#' },
    { text: 'Hỗ trợ kỹ thuật 24/7', url: '#' },
  ],
  col4Title: 'Liên Hệ Nhanh',
});

export const getInitialEssentials = (brand = 'Website Chuẩn SEO'): SeoEssentialsConfig => ({
  brandName: brand,
  hotline: '0988.xxx.xxx',
  email: 'lienhe@domain.com',
  address: 'Hà Nội, Việt Nam',
  createPages: true,
  createMenu: true,
  setPermalinks: true,
});

export const getInitialSections = (): SectionItem[] => [
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
];

export const getInitialMenuStyling = (primaryColor = '#1e3c72'): MenuStylingConfig => ({
  bgType: 'gradient',
  bgColor: '#1e293b',
  gradientColor1: primaryColor,
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

export const App: React.FC = () => {
  // Routing helper (/admin vs /)
  const getInitialRoute = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path === '/admin' || path.startsWith('/admin/') || hash === '#/admin' || hash.startsWith('#/admin/')) {
      return '/admin';
    }
    return '/';
  };

  const [currentRoute, setCurrentRoute] = useState(getInitialRoute);

  const [toolUser, setToolUser] = useState<AuthUser | null>(() => getUser('user'));
  const [isToolLoggedIn, setIsToolLoggedIn] = useState<boolean>(() => {
    return !!getToken('user') || (!!getToken('admin') && !!getUser('admin'));
  });

  const [adminUser, setAdminUser] = useState<AuthUser | null>(() => getUser('admin'));
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    const token = getToken('admin');
    const user = getUser('admin');
    return !!token && user?.role === 'admin';
  });

  const [kickoutMessage, setKickoutMessage] = useState<string | null>(null);

  // Lắng nghe thay đổi URL (Back/Forward hoặc hash)
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/admin' || path.startsWith('/admin/') || hash === '#/admin' || hash.startsWith('#/admin/')) {
        setCurrentRoute('/admin');
      } else {
        setCurrentRoute('/');
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigate = (path: string) => {
    if (path === '/admin') {
      window.location.hash = '#/admin';
    } else {
      window.location.hash = '';
    }
    try {
      window.history.pushState({}, '', path);
    } catch (e) {}
    setCurrentRoute(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Lắng nghe sự kiện bị đá phiên hoặc hết hạn
  useEffect(() => {
    const handleSessionKicked = (e: any) => {
      const scope = e.detail?.scope || (currentRoute === '/admin' ? 'admin' : 'user');
      if (scope === 'admin') {
        clearAuth('admin');
        setIsAdminLoggedIn(false);
        setAdminUser(null);
      } else {
        clearAuth('user');
        setIsToolLoggedIn(false);
        setToolUser(null);
      }
      setKickoutMessage(e.detail?.message || 'Tài khoản của bạn đã được đăng nhập từ một thiết bị khác!');
    };

    const handleAuthExpired = (e: any) => {
      const scope = e.detail?.scope || (currentRoute === '/admin' ? 'admin' : 'user');
      if (scope === 'admin') {
        clearAuth('admin');
        setIsAdminLoggedIn(false);
        setAdminUser(null);
      } else {
        clearAuth('user');
        setIsToolLoggedIn(false);
        setToolUser(null);
      }
    };

    window.addEventListener('session_kicked', handleSessionKicked);
    window.addEventListener('auth_expired', handleAuthExpired);
    return () => {
      window.removeEventListener('session_kicked', handleSessionKicked);
      window.removeEventListener('auth_expired', handleAuthExpired);
    };
  }, [currentRoute]);

  const handleToolLoginSuccess = (data: { user: AuthUser; token: string }) => {
    setToolUser(data.user);
    setIsToolLoggedIn(true);
    if (data.user.role === 'admin') {
      setAdminUser(data.user);
      setIsAdminLoggedIn(true);
    }
  };

  const handleAdminLoginSuccess = (data: { user: AuthUser; token: string }) => {
    setAdminUser(data.user);
    setIsAdminLoggedIn(true);
    setToolUser(data.user);
    setIsToolLoggedIn(true);
    navigate('/admin');
  };

  const handleToolLogout = () => {
    clearAuth('user');
    setIsToolLoggedIn(false);
    setToolUser(null);
  };

  const handleAdminLogout = () => {
    clearAuth('admin');
    setIsAdminLoggedIn(false);
    setAdminUser(null);
    navigate('/admin');
  };

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
  const [showLivePreview, setShowLivePreview] = useState(false);

  // Configuration States (Initialized with clean isolated defaults)
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(getInitialThemeConfig());
  const [footerConfig, setFooterConfig] = useState<FooterConfig>(getInitialFooterConfig());
  const [sections, setSections] = useState<SectionItem[]>(getInitialSections());
  const [essentials, setEssentials] = useState<SeoEssentialsConfig>(getInitialEssentials());
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuStyling, setMenuStyling] = useState<MenuStylingConfig>(getInitialMenuStyling());
  const [subpageStyling, setSubpageStyling] = useState<SubpageStylingConfig>(getInitialSubpageStyling());

  // Ref to prevent race conditions where auto-save overwrites a newly selected site with the previous site's state
  const isSwitchingSiteRef = React.useRef(false);

  // Auto clear toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const getSiteStorageKey = (siteUrl: string) => {
    const cleanKey = siteUrl.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');
    return `flatsome_site_state_${cleanKey}`;
  };

  const resetSiteStateToDefault = (siteUrl: string) => {
    const domain = siteUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    setSections(getInitialSections());
    setThemeConfig(getInitialThemeConfig(domain));
    setFooterConfig(getInitialFooterConfig(domain));
    setEssentials(getInitialEssentials(domain));
    setMenuItems([]);
    setMenuStyling(getInitialMenuStyling());
    setSubpageStyling(getInitialSubpageStyling());
    setCurrentStep(1);
  };

  const loadLocalSiteState = (siteUrl: string) => {
    try {
      const saved = localStorage.getItem(getSiteStorageKey(siteUrl));
      if (saved) {
        const parsed = JSON.parse(saved);
        const domain = siteUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
        setSections(parsed.sections && Array.isArray(parsed.sections) && parsed.sections.length > 0 ? parsed.sections : getInitialSections());
        setThemeConfig(parsed.themeConfig || getInitialThemeConfig(domain));
        setFooterConfig(parsed.footerConfig || getInitialFooterConfig(domain));
        setEssentials(parsed.essentials || getInitialEssentials(domain));
        setMenuItems(parsed.menuItems && Array.isArray(parsed.menuItems) ? parsed.menuItems : []);
        setMenuStyling(parsed.menuStyling || getInitialMenuStyling());
        setSubpageStyling(parsed.subpageStyling || getInitialSubpageStyling());
        setCurrentStep(typeof parsed.currentStep === 'number' ? Math.min(8, Math.max(1, parsed.currentStep)) : 1);
        return true;
      }
    } catch (e) {
      console.error('Error loading site state from localStorage', e);
    }
    return false;
  };

  // Reset current site's state to clean defaults (clears any accidental cross-contamination)
  const handleResetCurrentSiteState = () => {
    if (!currentSite) return;
    const domain = currentSite.siteUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!window.confirm(`Bạn có chắc chắn muốn ĐẶT LẠI TOÀN BỘ CÀI ĐẶT (Header, Theme, Sections, Footer) của website "${domain}" về mặc định sạch không? Thao tác này sẽ xóa sạch dữ liệu cũ lưu tạm của website này trong tool.`)) {
      return;
    }
    try {
      localStorage.removeItem(getSiteStorageKey(currentSite.siteUrl));
    } catch (e) {
      console.error(e);
    }
    resetSiteStateToDefault(currentSite.siteUrl);
    setToast({
      type: 'success',
      message: `Đã làm sạch và đặt lại cài đặt về mặc định cho ${domain}!`,
    });
  };

  // Auto-save active site state to localStorage (guarded against site-switching race conditions)
  useEffect(() => {
    if (!currentSite?.siteUrl || isSwitchingSiteRef.current) return;
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
          subpageStyling,
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
    isSwitchingSiteRef.current = true;
    setCurrentSite(site);
    localStorage.setItem(STORAGE_KEY_ACTIVE, site.siteUrl);

    // Instant restore from localStorage or reset to fresh defaults for this site
    const restored = loadLocalSiteState(site.siteUrl);
    if (!restored) {
      resetSiteStateToDefault(site.siteUrl);
    }

    setTimeout(() => {
      isSwitchingSiteRef.current = false;
    }, 150);

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
    setEditingSite(null);
    setToast({
      type: 'success',
      message: `Kết nối thành công tới ${site.siteUrl.replace(/^https?:\/\//, '')}!`,
    });

    // CRITICAL: Activate and cleanly isolate state for this newly connected site
    await handleSelectSite(site);
  };

  const handleDeleteSite = (siteUrl: string) => {
    const updated = savedSites.filter((s) => s.siteUrl !== siteUrl);
    setSavedSites(updated);
    localStorage.setItem(STORAGE_KEY_SITES, JSON.stringify(updated));
    try {
      localStorage.removeItem(getSiteStorageKey(siteUrl));
    } catch (e) {}

    if (currentSite?.siteUrl === siteUrl) {
      if (updated.length > 0) {
        handleSelectSite(updated[0]);
      } else {
        setCurrentSite(null);
        setInspectData(null);
        setConnectionError(null);
        localStorage.removeItem(STORAGE_KEY_ACTIVE);
        resetSiteStateToDefault('default');
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

      const brand = data.site?.name || site.siteUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

      // Pre-fill brand name if default
      setFooterConfig((prev) => ({
        ...prev,
        brandName: prev.brandName === 'Website Chuẩn SEO' || prev.brandName === 'Doanh Nghiệp Uy Tín' ? brand : prev.brandName,
      }));
      setEssentials((prev) => ({
        ...prev,
        brandName: prev.brandName === 'Website Chuẩn SEO' || prev.brandName === 'Doanh Nghiệp Uy Tín' ? brand : prev.brandName,
      }));

      // Sync Flatsome theme colors & buttons from live WordPress
      if (data.flatsome) {
        setThemeConfig((prev) => ({
          ...prev,
          colorPrimary: data.flatsome.color_primary || prev.colorPrimary,
          colorSecondary: data.flatsome.color_secondary || prev.colorSecondary,
          topbarText:
            data.flatsome.topbar_content && !data.flatsome.topbar_content.includes('0988.xxx.xxx')
              ? data.flatsome.topbar_content
              : prev.topbarText && !prev.topbarText.includes('0988.xxx.xxx')
              ? prev.topbarText
              : '',
          defaultPageTemplate: data.flatsome.default_page_template || prev.defaultPageTemplate || 'default',
          siteLayout: data.flatsome.layout || prev.siteLayout || 'full-width',
          // Tự động nhận diện và đồng bộ text thực tế của Button 1 & Button 2 từ web WordPress
          headerButton1Text:
            data.flatsome.header_button_1 !== undefined && data.flatsome.header_button_1 !== ''
              ? data.flatsome.header_button_1
              : prev.headerButton1Text,
          headerButton1Link: data.flatsome.header_button_1_link || prev.headerButton1Link,
          headerButton1Color: (data.flatsome.header_button_1_color as any) || prev.headerButton1Color,
          headerButton1Style: (data.flatsome.header_button_1_style as any) || prev.headerButton1Style,
          headerButton1Radius: data.flatsome.header_button_1_radius || prev.headerButton1Radius,

          headerButton2Text:
            data.flatsome.header_button_2 !== undefined && data.flatsome.header_button_2 !== ''
              ? data.flatsome.header_button_2
              : prev.headerButton2Text,
          headerButton2Link: data.flatsome.header_button_2_link || prev.headerButton2Link,
          headerButton2Color: (data.flatsome.header_button_2_color as any) || prev.headerButton2Color,
          headerButton2Style: (data.flatsome.header_button_2_style as any) || prev.headerButton2Style,
          headerButton2Radius: data.flatsome.header_button_2_radius || prev.headerButton2Radius,
        }));
      }

      // Check if this site already had custom sections in localStorage:
      // If NOT, and WordPress has savedSections, adopt WordPress's sections
      const savedRaw = localStorage.getItem(getSiteStorageKey(site.siteUrl));
      let hasCustomLocalSections = false;
      if (savedRaw) {
        try {
          const parsed = JSON.parse(savedRaw);
          hasCustomLocalSections = Array.isArray(parsed?.sections) && parsed.sections.length > 0;
        } catch (e) {}
      }

      if (data.subpage_styling) {
        setSubpageStyling((prev) => ({
          ...getInitialSubpageStyling(),
          ...prev,
          ...data.subpage_styling,
        }));
      }

      if (!hasCustomLocalSections && data.homepage?.savedSections && data.homepage.savedSections.length > 0) {
        setSections(data.homepage.savedSections);
        setToast({
          type: 'success',
          message: `🎯 Đã quét WordPress! Khôi phục ${data.homepage.savedSections.length} khối Sections Trang Chủ từ website ${brand}.`,
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

  // 1. Phân luồng Cổng Quản Trị (/admin hoặc #/admin)
  if (currentRoute === '/admin') {
    if (isAdminLoggedIn) {
      return (
        <>
          <AdminPage currentUser={adminUser} onNavigate={navigate} onLogout={handleAdminLogout} />
          <KickoutModal message={kickoutMessage} onConfirm={() => setKickoutMessage(null)} />
        </>
      );
    }
    return (
      <>
        <LoginPage portal="admin" onLoginSuccess={handleAdminLoginSuccess} onNavigate={navigate} />
        <KickoutModal message={kickoutMessage} onConfirm={() => setKickoutMessage(null)} />
      </>
    );
  }

  // 2. Phân luồng Cổng Tool Làm Việc (/)
  if (!isToolLoggedIn) {
    return (
      <>
        <LoginPage portal="tool" onLoginSuccess={handleToolLoginSuccess} onNavigate={navigate} />
        <KickoutModal message={kickoutMessage} onConfirm={() => setKickoutMessage(null)} />
      </>
    );
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden">
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
        showLivePreview={showLivePreview}
        onToggleLivePreview={() => setShowLivePreview(!showLivePreview)}
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
        onResetSiteState={handleResetCurrentSiteState}
        currentUser={toolUser || adminUser}
        onOpenAdmin={() => navigate('/admin')}
        onLogout={handleToolLogout}
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

            {/* Favicon Quick Indicator */}
            <button
              type="button"
              onClick={() => {
                setCurrentStep(2); // Step 3: Cấu Hình Theme
                setTimeout(() => {
                  const el = document.getElementById('section-favicon');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              title="Nhấp để tới mục Cài đặt Favicon cho website"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800/90 hover:bg-slate-700 border border-slate-700 transition cursor-pointer text-slate-200"
            >
              {inspectData?.site?.site_icon_url || inspectData?.flatsome?.site_icon_url || themeConfig.siteIconUrl ? (
                <>
                  <img
                    src={inspectData?.site?.site_icon_url || inspectData?.flatsome?.site_icon_url || themeConfig.siteIconUrl}
                    alt="Favicon"
                    className="w-3.5 h-3.5 object-contain rounded-xs"
                  />
                  <span className="text-emerald-300 font-semibold">Favicon: Đã Cài</span>
                </>
              ) : (
                <>
                  <span className="text-[9px] font-black text-amber-300 bg-amber-500/20 px-1 rounded-xs border border-amber-400/30">W</span>
                  <span className="text-amber-300 font-medium">Đổi Favicon (Chữ W)</span>
                </>
              )}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetCurrentSiteState}
              title="Xóa cache và đưa toàn bộ thiết lập (Theme, Bố cục, Menu, Footer) của website này về mặc định sạch để làm mới độc lập"
              className="text-rose-300 hover:text-white flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 transition cursor-pointer font-medium"
            >
              <RotateCcw className="w-3 h-3 text-rose-400" /> Đặt lại mặc định site này
            </button>
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
        <main className={`flex-1 overflow-y-auto p-6 ${!currentSite ? 'flex justify-center items-center' : ''}`}>
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
            <div className={`w-full ${showLivePreview ? 'max-w-4xl mx-auto' : 'w-full'} space-y-4`}>
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
                  inspectData={inspectData}
                />
              )}
              {currentStep === 4 && (
                <StepSiteBackground
                  currentSite={currentSite}
                  themeConfig={themeConfig}
                  onChangeThemeConfig={setThemeConfig}
                  onNextStep={() => setCurrentStep(5)}
                  onPrevStep={() => setCurrentStep(3)}
                />
              )}
              {currentStep === 5 && (
                <StepMenuManager
                  currentSite={currentSite}
                  onRefreshInspect={() => syncSiteData(currentSite)}
                  onNextStep={() => setCurrentStep(6)}
                  onPrevStep={() => setCurrentStep(4)}
                  onMenuChange={setMenuItems}
                  onStylingChange={setMenuStyling}
                />
              )}
              {currentStep === 6 && (
                <Step3HomepageBuilder
                  currentSite={currentSite}
                  sections={sections}
                  onChangeSections={setSections}
                  onNextStep={() => setCurrentStep(7)}
                  onPrevStep={() => setCurrentStep(5)}
                />
              )}
              {currentStep === 7 && (
                <StepSubpageStyling
                  currentSite={currentSite}
                  styling={subpageStyling}
                  onChangeStyling={setSubpageStyling}
                  onNextStep={() => setCurrentStep(8)}
                  onPrevStep={() => setCurrentStep(6)}
                  onAutoInstallPlugin={() => currentSite && handleAutoInstallPlugin(currentSite)}
                  isAutoInstallingPlugin={isAutoInstallingPlugin}
                />
              )}
              {currentStep === 8 && (
                <Step4FooterPicker
                  footerConfig={footerConfig}
                  onChangeFooterConfig={setFooterConfig}
                  menuItems={menuItems}
                  currentSite={currentSite}
                  onNextStep={() => setIsDeployModalOpen(true)}
                  onPrevStep={() => setCurrentStep(7)}
                />
              )}
            </div>
          )}
        </main>

        {/* Right Live Preview Mockup (Tắt mặc định để mở rộng tối đa khu vực cài đặt) */}
        {showLivePreview && (
          <LivePreview
            themeConfig={themeConfig}
            footerConfig={footerConfig}
            sections={sections}
            menuItems={menuItems}
            menuStyling={menuStyling}
            onClose={() => setShowLivePreview(false)}
          />
        )}
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

      {/* Cửa sổ thông báo bị đá phiên */}
      <KickoutModal
        message={kickoutMessage}
        onConfirm={() => setKickoutMessage(null)}
      />
    </div>
  );
};

export default App;
